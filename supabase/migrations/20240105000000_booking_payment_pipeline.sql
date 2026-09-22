-- ==============================================================================
-- CineBook v2 — Phase 6: Booking Transaction & Razorpay Payment Migration
-- ==============================================================================

-- 1. Enhance public.bookings table
ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS movie_title_snapshot TEXT,
    ADD COLUMN IF NOT EXISTS theatre_name_snapshot TEXT,
    ADD COLUMN IF NOT EXISTS screen_name_snapshot TEXT,
    ADD COLUMN IF NOT EXISTS show_time_snapshot TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS show_format_snapshot TEXT,
    ADD COLUMN IF NOT EXISTS show_language_snapshot TEXT;

-- Update booking status check to accommodate standardized uppercase & lowercase states
DO $$
BEGIN
    ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
    ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS chk_bookings_status;
    ALTER TABLE public.bookings ADD CONSTRAINT chk_bookings_status
        CHECK (status IN (
            'pending', 'confirmed', 'cancelled', 'expired',
            'PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'CONFIRMED', 'PAYMENT_FAILED', 'CANCELLED', 'EXPIRED'
        ));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. Enhance public.booking_items table
ALTER TABLE public.booking_items
    ADD COLUMN IF NOT EXISTS show_seat_id UUID REFERENCES public.show_seats(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS seat_tier TEXT,
    ADD COLUMN IF NOT EXISTS price_multiplier NUMERIC(4, 2) DEFAULT 1.0;

-- 3. Enhance public.payments table
ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'razorpay',
    ADD COLUMN IF NOT EXISTS raw_response JSONB;

-- Ensure payment status check supports standard payment lifecycle
DO $$
BEGIN
    ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
    ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS chk_payments_status;
    ALTER TABLE public.payments ADD CONSTRAINT chk_payments_status
        CHECK (status IN (
            'pending', 'paid', 'failed', 'refunded',
            'CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED'
        ));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Add unique constraint on razorpay order & payment IDs when present
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_razorpay_order ON public.payments(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_razorpay_payment ON public.payments(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON public.bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_show_id ON public.bookings(show_id);

-- 4. Procedure / RPC: Create Server-Authoritative Booking Intent
CREATE OR REPLACE FUNCTION public.create_booking_intent(
    p_show_id UUID,
    p_seat_ids UUID[],
    p_user_id UUID,
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_customer_phone TEXT,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS TABLE (
    booking_id UUID,
    booking_reference TEXT,
    ticket_count INTEGER,
    subtotal NUMERIC,
    convenience_fee NUMERIC,
    grand_total NUMERIC,
    currency TEXT,
    status TEXT
) AS $$
DECLARE
    v_user_id UUID;
    v_show RECORD;
    v_seat_count INTEGER;
    v_valid_locks INTEGER;
    v_subtotal NUMERIC := 0;
    v_conv_fee NUMERIC := 0;
    v_grand_total NUMERIC := 0;
    v_booking_ref TEXT;
    v_booking_id UUID;
    v_item RECORD;
BEGIN
    -- Resolve authenticated user ID
    v_user_id := COALESCE(p_user_id, auth.uid());
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Authentication required to create booking.';
    END IF;

    -- Validate seat count
    v_seat_count := array_length(p_seat_ids, 1);
    IF v_seat_count IS NULL OR v_seat_count < 1 OR v_seat_count > 8 THEN
        RAISE EXCEPTION 'INVALID_REQUEST: Between 1 and 8 seats must be selected.';
    END IF;

    -- Fetch show with movie, theatre, and screen details
    SELECT
        s.id, s.base_price, s.start_time, s.format, s.language, s.status,
        m.title AS movie_title,
        t.name AS theatre_name,
        sc.name AS screen_name
    INTO v_show
    FROM public.shows s
    JOIN public.movies m ON m.id = s.movie_id
    JOIN public.theatres t ON t.id = s.theatre_id
    JOIN public.screens sc ON sc.id = s.screen_id
    WHERE s.id = p_show_id;

    IF v_show.id IS NULL THEN
        RAISE EXCEPTION 'SHOW_NOT_FOUND: Show does not exist.';
    END IF;

    IF v_show.status <> 'scheduled' THEN
        RAISE EXCEPTION 'SHOW_UNAVAILABLE: Cannot book tickets for a % show.', v_show.status;
    END IF;

    IF v_show.start_time <= NOW() THEN
        RAISE EXCEPTION 'SHOW_PAST: Show has already commenced.';
    END IF;

    -- Verify that all requested seats are currently locked by this user and unexpired
    SELECT COUNT(*) INTO v_valid_locks
    FROM public.show_seats ss
    WHERE ss.show_id = p_show_id
      AND ss.seat_id = ANY(p_seat_ids)
      AND ss.status IN ('LOCKED', 'held', 'locked')
      AND (ss.locked_by = v_user_id OR ss.held_by_user_id = v_user_id)
      AND (
          (ss.lock_expires_at IS NOT NULL AND ss.lock_expires_at > NOW()) OR
          (ss.held_until IS NOT NULL AND ss.held_until > NOW())
      );

    IF v_valid_locks <> v_seat_count THEN
        RAISE EXCEPTION 'SEAT_LOCK_EXPIRED: Seat lock expired or seats are not held by current user.';
    END IF;

    -- Idempotency check: Return existing pending booking if idempotency_key is supplied
    IF p_idempotency_key IS NOT NULL THEN
        SELECT b.id, b.booking_reference, b.ticket_count, b.subtotal, b.convenience_fee, b.grand_total, b.currency, b.status
        INTO v_booking_id, v_booking_ref, v_seat_count, v_subtotal, v_conv_fee, v_grand_total, v_show.language, v_show.status
        FROM public.bookings b
        WHERE b.idempotency_key = p_idempotency_key;

        IF v_booking_id IS NOT NULL THEN
            RETURN QUERY SELECT v_booking_id, v_booking_ref, v_seat_count, v_subtotal, v_conv_fee, v_grand_total, 'INR'::TEXT, 'pending'::TEXT;
            RETURN;
        END IF;
    END IF;

    -- Server-Authoritative Price Calculation (Zero Client Trust)
    FOR v_item IN
        SELECT
            st.id AS seat_id,
            st.seat_code,
            st.tier,
            COALESCE(st.price_multiplier, 1.0) AS price_multiplier,
            ss.id AS show_seat_id
        FROM public.show_seats ss
        JOIN public.seats st ON st.id = ss.seat_id
        WHERE ss.show_id = p_show_id AND ss.seat_id = ANY(p_seat_ids)
    LOOP
        v_subtotal := v_subtotal + ROUND(v_show.base_price * v_item.price_multiplier);
    END LOOP;

    -- Convenience fee: 12% rounded
    v_conv_fee := ROUND(v_subtotal * 0.12);
    v_grand_total := v_subtotal + v_conv_fee;

    -- Generate unique booking reference: CB- + 8 random hex characters
    v_booking_ref := 'CB-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));

    -- Insert into public.bookings
    INSERT INTO public.bookings (
        booking_reference,
        user_id,
        show_id,
        ticket_count,
        subtotal,
        convenience_fee,
        grand_total,
        currency,
        status,
        customer_name,
        customer_email,
        customer_phone,
        idempotency_key,
        movie_title_snapshot,
        theatre_name_snapshot,
        screen_name_snapshot,
        show_time_snapshot,
        show_format_snapshot,
        show_language_snapshot
    ) VALUES (
        v_booking_ref,
        v_user_id,
        p_show_id,
        v_seat_count,
        v_subtotal,
        v_conv_fee,
        v_grand_total,
        'INR',
        'pending',
        p_customer_name,
        p_customer_email,
        p_customer_phone,
        p_idempotency_key,
        v_show.movie_title,
        v_show.theatre_name,
        v_show.screen_name,
        v_show.start_time,
        v_show.format,
        v_show.language
    ) RETURNING id INTO v_booking_id;

    -- Insert itemized snapshot records
    FOR v_item IN
        SELECT
            st.id AS seat_id,
            st.seat_code,
            st.tier,
            COALESCE(st.price_multiplier, 1.0) AS price_multiplier,
            ss.id AS show_seat_id
        FROM public.show_seats ss
        JOIN public.seats st ON st.id = ss.seat_id
        WHERE ss.show_id = p_show_id AND ss.seat_id = ANY(p_seat_ids)
    LOOP
        INSERT INTO public.booking_items (
            booking_id,
            seat_id,
            show_seat_id,
            seat_code,
            tier,
            seat_tier,
            price_multiplier,
            unit_price
        ) VALUES (
            v_booking_id,
            v_item.seat_id,
            v_item.show_seat_id,
            v_item.seat_code,
            v_item.tier,
            v_item.tier,
            v_item.price_multiplier,
            ROUND(v_show.base_price * v_item.price_multiplier)
        );
    END LOOP;

    RETURN QUERY
    SELECT
        v_booking_id,
        v_booking_ref,
        v_seat_count,
        v_subtotal,
        v_conv_fee,
        v_grand_total,
        'INR'::TEXT,
        'pending'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 5. Procedure / RPC: Atomic Payment & Booking Confirmation (LOCKED -> BOOKED)
CREATE OR REPLACE FUNCTION public.confirm_booking_payment(
    p_booking_id UUID,
    p_razorpay_order_id TEXT,
    p_razorpay_payment_id TEXT,
    p_razorpay_signature TEXT,
    p_raw_response JSONB DEFAULT NULL
)
RETURNS TABLE (
    booking_id UUID,
    booking_reference TEXT,
    status TEXT,
    grand_total NUMERIC,
    confirmed_at TIMESTAMPTZ
) AS $$
DECLARE
    v_booking RECORD;
BEGIN
    -- Acquire exclusive row lock on booking
    SELECT * INTO v_booking
    FROM public.bookings b
    WHERE b.id = p_booking_id
    FOR UPDATE;

    IF v_booking.id IS NULL THEN
        RAISE EXCEPTION 'BOOKING_NOT_FOUND: Booking % does not exist.', p_booking_id;
    END IF;

    -- Idempotent return if already confirmed
    IF v_booking.status IN ('confirmed', 'CONFIRMED') THEN
        RETURN QUERY
        SELECT v_booking.id, v_booking.booking_reference, v_booking.status, v_booking.grand_total, v_booking.updated_at;
        RETURN;
    END IF;

    -- Atomic transition of show seats: LOCKED -> BOOKED
    UPDATE public.show_seats ss
    SET status = 'BOOKED',
        locked_by = NULL,
        lock_expires_at = NULL,
        held_by_user_id = NULL,
        held_until = NULL
    FROM public.booking_items bi
    WHERE bi.booking_id = p_booking_id
      AND ss.show_id = v_booking.show_id
      AND ss.seat_id = bi.seat_id;

    -- Update booking status to CONFIRMED
    UPDATE public.bookings
    SET status = 'confirmed',
        updated_at = NOW()
    WHERE id = p_booking_id;

    -- Upsert payment record
    INSERT INTO public.payments (
        booking_id,
        provider,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount,
        currency,
        status,
        raw_response,
        updated_at
    ) VALUES (
        p_booking_id,
        'razorpay',
        p_razorpay_order_id,
        p_razorpay_payment_id,
        p_razorpay_signature,
        v_booking.grand_total,
        v_booking.currency,
        'paid',
        p_raw_response,
        NOW()
    )
    ON CONFLICT (booking_id) DO UPDATE
    SET razorpay_order_id = EXCLUDED.razorpay_order_id,
        razorpay_payment_id = EXCLUDED.razorpay_payment_id,
        razorpay_signature = EXCLUDED.razorpay_signature,
        status = 'paid',
        raw_response = EXCLUDED.raw_response,
        updated_at = NOW();

    RETURN QUERY
    SELECT
        v_booking.id,
        v_booking.booking_reference,
        'confirmed'::TEXT,
        v_booking.grand_total,
        NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 6. Procedure / RPC: Mark Booking Payment Failed
CREATE OR REPLACE FUNCTION public.fail_booking_payment(
    p_booking_id UUID,
    p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_booking RECORD;
BEGIN
    SELECT * INTO v_booking
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF v_booking.id IS NULL THEN
        RETURN FALSE;
    END IF;

    IF v_booking.status IN ('confirmed', 'CONFIRMED') THEN
        RETURN FALSE; -- Cannot fail an already confirmed booking
    END IF;

    UPDATE public.bookings
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE id = p_booking_id;

    -- Release locked seats back to AVAILABLE
    UPDATE public.show_seats ss
    SET status = 'AVAILABLE',
        locked_by = NULL,
        lock_expires_at = NULL,
        held_by_user_id = NULL,
        held_until = NULL
    FROM public.booking_items bi
    WHERE bi.booking_id = p_booking_id
      AND ss.show_id = v_booking.show_id
      AND ss.seat_id = bi.seat_id
      AND ss.status IN ('LOCKED', 'held', 'locked');

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 7. Update RLS on bookings, booking_items, and payments
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own booking items" ON public.booking_items;
CREATE POLICY "Users can view their own booking items" ON public.booking_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = booking_items.booking_id AND bookings.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = payments.booking_id AND bookings.user_id = auth.uid())
    );
