-- ==============================================================================
-- CineBook v2 — Phase 5: Real-Time Seat Map & Atomic Seat Locking Migration
-- ==============================================================================

-- 1. Enhance public.show_seats table
ALTER TABLE public.show_seats
    ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS lock_expires_at TIMESTAMPTZ;

-- Ensure constraint allows uppercase and legacy lowercase states
DO $$
BEGIN
    ALTER TABLE public.show_seats DROP CONSTRAINT IF EXISTS show_seats_status_check;
    ALTER TABLE public.show_seats DROP CONSTRAINT IF EXISTS chk_show_seats_status;
    ALTER TABLE public.show_seats ADD CONSTRAINT chk_show_seats_status
        CHECK (status IN ('AVAILABLE', 'LOCKED', 'BOOKED', 'BLOCKED', 'available', 'held', 'locked', 'booked', 'blocked'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. Performance Indexes for Locking and Realtime
CREATE INDEX IF NOT EXISTS idx_show_seats_show_status ON public.show_seats(show_id, status);
CREATE INDEX IF NOT EXISTS idx_show_seats_lock_expires ON public.show_seats(lock_expires_at);
CREATE INDEX IF NOT EXISTS idx_show_seats_locked_by ON public.show_seats(locked_by);

-- 3. Procedure: Reclaim Expired Seat Locks
CREATE OR REPLACE FUNCTION public.reclaim_expired_show_seats(p_show_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    v_reclaimed_count INTEGER := 0;
BEGIN
    UPDATE public.show_seats
    SET status = 'AVAILABLE',
        locked_by = NULL,
        lock_expires_at = NULL,
        held_by_user_id = NULL,
        held_until = NULL
    WHERE (status IN ('LOCKED', 'held', 'locked'))
      AND (
          (lock_expires_at IS NOT NULL AND lock_expires_at <= NOW()) OR
          (held_until IS NOT NULL AND held_until <= NOW())
      )
      AND (p_show_id IS NULL OR show_id = p_show_id);

    GET DIAGNOSTICS v_reclaimed_count = ROW_COUNT;
    RETURN v_reclaimed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 4. RPC Function: Atomic Seat Locking (No partial locks, 10-minute hold)
CREATE OR REPLACE FUNCTION public.lock_show_seats(
    p_show_id UUID,
    p_seat_ids UUID[],
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    seat_id UUID,
    seat_code TEXT,
    row_label TEXT,
    seat_number INTEGER,
    tier TEXT,
    price_multiplier NUMERIC,
    status TEXT,
    lock_expires_at TIMESTAMPTZ
) AS $$
DECLARE
    v_user_id UUID;
    v_show_status TEXT;
    v_show_start TIMESTAMPTZ;
    v_req_count INTEGER;
    v_available_count INTEGER;
    v_expires_at TIMESTAMPTZ;
    v_seat_id UUID;
BEGIN
    -- Determine authenticating user ID
    v_user_id := COALESCE(p_user_id, auth.uid());
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: User must be authenticated to lock seats.';
    END IF;

    -- Validate seat request quantity (Max 8 seats)
    v_req_count := array_length(p_seat_ids, 1);
    IF v_req_count IS NULL OR v_req_count < 1 THEN
        RAISE EXCEPTION 'INVALID_REQUEST: At least 1 seat must be selected.';
    END IF;
    IF v_req_count > 8 THEN
        RAISE EXCEPTION 'LIMIT_EXCEEDED: A maximum of 8 seats can be selected per booking.';
    END IF;

    -- Validate show exists, is scheduled, and has not already started
    SELECT s.status, s.start_time INTO v_show_status, v_show_start
    FROM public.shows s
    WHERE s.id = p_show_id;

    IF v_show_status IS NULL THEN
        RAISE EXCEPTION 'SHOW_NOT_FOUND: Show does not exist.';
    END IF;

    IF v_show_status <> 'scheduled' THEN
        RAISE EXCEPTION 'SHOW_UNAVAILABLE: Cannot lock seats for a % show.', v_show_status;
    END IF;

    IF v_show_start <= NOW() THEN
        RAISE EXCEPTION 'SHOW_PAST: Cannot book tickets for a show that has already started.';
    END IF;

    -- Reclaim any expired locks for this show first
    PERFORM public.reclaim_expired_show_seats(p_show_id);

    -- Calculate authoritative 10-minute expiration (600 seconds)
    v_expires_at := NOW() + INTERVAL '600 seconds';

    -- Transactional row locking: lock all requested show_seat rows for update
    -- Count how many of the requested seats are currently AVAILABLE or already locked by this exact user
    SELECT COUNT(*) INTO v_available_count
    FROM public.show_seats ss
    WHERE ss.show_id = p_show_id
      AND ss.seat_id = ANY(p_seat_ids)
      AND (
          ss.status IN ('AVAILABLE', 'available') OR
          (ss.status IN ('LOCKED', 'held', 'locked') AND (ss.locked_by = v_user_id OR ss.held_by_user_id = v_user_id))
      )
    FOR UPDATE OF ss;

    -- Atomic check: If any requested seat is not available, fail atomically
    IF v_available_count <> v_req_count THEN
        RAISE EXCEPTION 'SEATS_UNAVAILABLE: One or more selected seats are no longer available.';
    END IF;

    -- Perform atomic lock update
    UPDATE public.show_seats ss
    SET status = 'LOCKED',
        locked_by = v_user_id,
        lock_expires_at = v_expires_at,
        held_by_user_id = v_user_id,
        held_until = v_expires_at
    WHERE ss.show_id = p_show_id
      AND ss.seat_id = ANY(p_seat_ids);

    -- Return locked seat records with complete seat details
    RETURN QUERY
    SELECT
        st.id AS seat_id,
        st.seat_code,
        st.row_label,
        st.seat_number,
        st.tier,
        st.price_multiplier,
        ss.status,
        ss.lock_expires_at
    FROM public.show_seats ss
    JOIN public.seats st ON st.id = ss.seat_id
    WHERE ss.show_id = p_show_id
      AND ss.seat_id = ANY(p_seat_ids)
    ORDER BY st.row_label ASC, st.seat_number ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 5. RPC Function: Release User-Locked Seats
CREATE OR REPLACE FUNCTION public.release_show_seats(
    p_show_id UUID,
    p_seat_ids UUID[],
    p_user_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_user_id UUID;
    v_released_count INTEGER := 0;
BEGIN
    v_user_id := COALESCE(p_user_id, auth.uid());
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: User must be authenticated.';
    END IF;

    UPDATE public.show_seats
    SET status = 'AVAILABLE',
        locked_by = NULL,
        lock_expires_at = NULL,
        held_by_user_id = NULL,
        held_until = NULL
    WHERE show_id = p_show_id
      AND (
          (p_seat_ids IS NOT NULL AND seat_id = ANY(p_seat_ids)) OR
          (p_seat_ids IS NULL)
      )
      AND (locked_by = v_user_id OR held_by_user_id = v_user_id)
      AND status IN ('LOCKED', 'held', 'locked');

    GET DIAGNOSTICS v_released_count = ROW_COUNT;
    RETURN v_released_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 6. Enable Realtime on show_seats
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.show_seats;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 7. Secure RLS on show_seats
ALTER TABLE public.show_seats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Show seats are viewable by everyone" ON public.show_seats;
CREATE POLICY "Show seats are viewable by everyone" ON public.show_seats
    FOR SELECT USING (true);

-- Explicitly disallow direct client-side updates (must go through RPC or service role)
DROP POLICY IF EXISTS "Direct client update disabled on show_seats" ON public.show_seats;
