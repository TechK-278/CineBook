-- ==============================================================================
-- CineBook v2 — Cinema, Screen, Seat & Showtime Hardening Migration
-- ==============================================================================

-- 1. Enhance public.theatres
ALTER TABLE public.theatres
    ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS chain TEXT NOT NULL DEFAULT 'Independent',
    ADD COLUMN IF NOT EXISTS area TEXT NOT NULL DEFAULT 'Ahmedabad Central',
    ADD COLUMN IF NOT EXISTS state TEXT NOT NULL DEFAULT 'Gujarat',
    ADD COLUMN IF NOT EXISTS pincode TEXT,
    ADD COLUMN IF NOT EXISTS latitude NUMERIC(9, 6),
    ADD COLUMN IF NOT EXISTS longitude NUMERIC(9, 6),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS image_url TEXT,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_theatres_city_active ON public.theatres(city, is_active);
CREATE INDEX IF NOT EXISTS idx_theatres_slug ON public.theatres(slug);

-- 2. Enhance public.screens
ALTER TABLE public.screens
    ADD COLUMN IF NOT EXISTS screen_number INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS format TEXT NOT NULL DEFAULT '2D',
    ADD COLUMN IF NOT EXISTS capacity INTEGER NOT NULL DEFAULT 36,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_screens_theatre_active ON public.screens(theatre_id, is_active);

-- 3. Enhance public.seats
ALTER TABLE public.seats
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_seats_screen_tier ON public.seats(screen_id, tier);

-- 4. Enhance public.shows
ALTER TABLE public.shows
    ADD COLUMN IF NOT EXISTS format TEXT NOT NULL DEFAULT '2D',
    ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'English',
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Validation Constraint: end_time must be after start_time
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_shows_time_order'
    ) THEN
        ALTER TABLE public.shows ADD CONSTRAINT chk_shows_time_order CHECK (end_time > start_time);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_shows_theatre_date ON public.shows(theatre_id, date, status);
CREATE INDEX IF NOT EXISTS idx_shows_movie_date ON public.shows(movie_id, date, status);
CREATE INDEX IF NOT EXISTS idx_shows_screen_time ON public.shows(screen_id, start_time, end_time);

-- 5. Function & Trigger: Ensure Screen Belongs to Theatre on Show Creation
CREATE OR REPLACE FUNCTION public.validate_show_relationships()
RETURNS TRIGGER AS $$
DECLARE
    v_screen_theatre_id UUID;
BEGIN
    -- Check screen belongs to specified theatre
    SELECT theatre_id INTO v_screen_theatre_id
    FROM public.screens
    WHERE id = NEW.screen_id;

    IF v_screen_theatre_id IS NULL THEN
        RAISE EXCEPTION 'Screen % does not exist.', NEW.screen_id;
    END IF;

    IF v_screen_theatre_id <> NEW.theatre_id THEN
        RAISE EXCEPTION 'Screen % belongs to theatre %, not theatre %.',
            NEW.screen_id, v_screen_theatre_id, NEW.theatre_id;
    END IF;

    -- Check for overlapping scheduled shows on the same screen
    IF EXISTS (
        SELECT 1 FROM public.shows
        WHERE screen_id = NEW.screen_id
          AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
          AND status = 'scheduled'
          AND date = NEW.date
          AND (
              (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
              (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
              (NEW.start_time <= start_time AND NEW.end_time >= end_time)
          )
    ) THEN
        RAISE EXCEPTION 'Schedule conflict: Screen % already has a show during % - %.',
            NEW.screen_id, NEW.start_time, NEW.end_time;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_show_relationships ON public.shows;
CREATE TRIGGER trg_validate_show_relationships
    BEFORE INSERT OR UPDATE ON public.shows
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_show_relationships();

-- 6. Function: Transactional Show Seat Initialization
CREATE OR REPLACE FUNCTION public.initialize_show_seats(p_show_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_screen_id UUID;
    v_seats_created INTEGER := 0;
BEGIN
    -- Fetch the screen_id for the show
    SELECT screen_id INTO v_screen_id
    FROM public.shows
    WHERE id = p_show_id;

    IF v_screen_id IS NULL THEN
        RAISE EXCEPTION 'Show % not found.', p_show_id;
    END IF;

    -- Copy all active seats for the screen into show_seats
    INSERT INTO public.show_seats (show_id, seat_id, status)
    SELECT p_show_id, id, 'available'
    FROM public.seats
    WHERE screen_id = v_screen_id AND is_active = true
    ON CONFLICT (show_id, seat_id) DO NOTHING;

    GET DIAGNOSTICS v_seats_created = ROW_COUNT;
    RETURN v_seats_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger to automatically initialize show seats when a show is inserted
CREATE OR REPLACE FUNCTION public.trg_auto_initialize_show_seats()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.initialize_show_seats(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_after_show_insert_init_seats ON public.shows;
CREATE TRIGGER trg_after_show_insert_init_seats
    AFTER INSERT ON public.shows
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_auto_initialize_show_seats();

-- 8. Updated RLS Policies for Active Theatres, Screens, Shows
DROP POLICY IF EXISTS "Theatres are viewable by everyone" ON public.theatres;
CREATE POLICY "Active theatres are viewable by everyone" ON public.theatres
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Screens are viewable by everyone" ON public.screens;
CREATE POLICY "Active screens are viewable by everyone" ON public.screens
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Seats are viewable by everyone" ON public.seats;
CREATE POLICY "Active seats are viewable by everyone" ON public.seats
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Shows are viewable by everyone" ON public.shows;
CREATE POLICY "Scheduled shows are viewable by everyone" ON public.shows
    FOR SELECT USING (status = 'scheduled');
