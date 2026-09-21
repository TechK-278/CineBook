-- ==============================================================================
-- CineBook v2 — Initial PostgreSQL Relational Schema Migration
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Movies
CREATE TABLE IF NOT EXISTS public.movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    overview TEXT NOT NULL,
    poster_path TEXT NOT NULL,
    backdrop_path TEXT,
    genres TEXT[] NOT NULL DEFAULT '{}',
    duration_minutes INTEGER NOT NULL DEFAULT 120,
    rating NUMERIC(3, 1) NOT NULL DEFAULT 0.0,
    language TEXT NOT NULL DEFAULT 'English',
    certificate TEXT NOT NULL DEFAULT 'UA' CHECK (certificate IN ('U', 'UA', 'UA 13+', 'UA 16+', 'A')),
    release_date DATE NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    tmdb_id INTEGER UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Theatres
CREATE TABLE IF NOT EXISTS public.theatres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    amenities TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Screens
CREATE TABLE IF NOT EXISTS public.screens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    theatre_id UUID NOT NULL REFERENCES public.theatres(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    screen_type TEXT NOT NULL DEFAULT 'Standard' CHECK (screen_type IN ('Standard', 'IMAX', '4DX', 'Dolby Atmos', 'Insignia Luxe')),
    total_seats INTEGER NOT NULL DEFAULT 36,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Seats
CREATE TABLE IF NOT EXISTS public.seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    screen_id UUID NOT NULL REFERENCES public.screens(id) ON DELETE CASCADE,
    row_label TEXT NOT NULL,
    seat_number INTEGER NOT NULL,
    seat_code TEXT NOT NULL, -- e.g. "A1", "C4"
    tier TEXT NOT NULL DEFAULT 'Standard' CHECK (tier IN ('Standard', 'Premium', 'Recliner')),
    price_multiplier NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(screen_id, seat_code)
);

-- 6. Shows
CREATE TABLE IF NOT EXISTS public.shows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    screen_id UUID NOT NULL REFERENCES public.screens(id) ON DELETE CASCADE,
    theatre_id UUID NOT NULL REFERENCES public.theatres(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Show Seats (Per-Show Seat Status & Locking)
CREATE TABLE IF NOT EXISTS public.show_seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
    seat_id UUID NOT NULL REFERENCES public.seats(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'held', 'booked')),
    held_until TIMESTAMPTZ,
    held_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(show_id, seat_id)
);

-- 8. Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference TEXT NOT NULL UNIQUE, -- e.g. "CB-123456"
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE RESTRICT,
    ticket_count INTEGER NOT NULL CHECK (ticket_count > 0 AND ticket_count <= 8),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    convenience_fee NUMERIC(10, 2) NOT NULL CHECK (convenience_fee >= 0),
    grand_total NUMERIC(10, 2) NOT NULL CHECK (grand_total >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired')),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Booking Items
CREATE TABLE IF NOT EXISTS public.booking_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    seat_id UUID NOT NULL REFERENCES public.seats(id) ON DELETE RESTRICT,
    seat_code TEXT NOT NULL,
    tier TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_movies_featured ON public.movies(is_featured);
CREATE INDEX IF NOT EXISTS idx_shows_date ON public.shows(date);
CREATE INDEX IF NOT EXISTS idx_shows_movie_id ON public.shows(movie_id);
CREATE INDEX IF NOT EXISTS idx_show_seats_show_id ON public.show_seats(show_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theatres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Initial RLS Read Policies (Public Catalogue)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Movies are viewable by everyone" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Theatres are viewable by everyone" ON public.theatres FOR SELECT USING (true);
CREATE POLICY "Screens are viewable by everyone" ON public.screens FOR SELECT USING (true);
CREATE POLICY "Seats are viewable by everyone" ON public.seats FOR SELECT USING (true);
CREATE POLICY "Shows are viewable by everyone" ON public.shows FOR SELECT USING (true);
CREATE POLICY "Show seats are viewable by everyone" ON public.show_seats FOR SELECT USING (true);

CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own booking items" ON public.booking_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = booking_items.booking_id AND bookings.user_id = auth.uid())
);
