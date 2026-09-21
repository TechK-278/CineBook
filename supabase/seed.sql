-- ==============================================================================
-- CineBook v2 — Comprehensive Production Seed Data (Ahmedabad Market)
-- Idempotent, deterministic operational seeds for Theatres, Screens, Seats, Movies, Shows & Show Seats.
-- ==============================================================================

-- 1. Insert/Upsert Theatres
INSERT INTO public.theatres (id, slug, name, chain, area, location, city, state, pincode, address, amenities, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'pvr-palladium-ahmedabad', 'PVR: Palladium Mall', 'PVR', 'Thaltej, SG Highway', 'Thaltej', 'Ahmedabad', 'Gujarat', '380054', '4th Floor, Palladium Mall, Sarkhej - Gandhinagar Hwy, Thaltej, Ahmedabad', ARRAY['IMAX Laser', 'LUXE Recliners', 'Dolby Atmos', 'Gourmet Food', 'Valet Parking'], true),
    ('22222222-2222-2222-2222-222222222222', 'inox-himalaya-mall-ahmedabad', 'INOX: Himalaya Mall', 'INOX', 'Drive-In Road', 'Memnagar', 'Ahmedabad', 'Gujarat', '380052', '3rd Floor, Himalaya Mall, Drive In Rd, Gurukul, Ahmedabad', ARRAY['Insignia Lounge', 'Dolby 7.1', 'Plush Recliners', 'Wheelchair Accessible'], true),
    ('33333333-3333-3333-3333-333333333333', 'cinepolis-alpha-one-ahmedabad', 'Cinépolis: Ahmedabad One Mall', 'Cinépolis', 'Vastrapur', 'Vastrapur Lake', 'Ahmedabad', 'Gujarat', '380015', 'Alpha One Mall, Near Vastrapur Lake, Vastrapur, Ahmedabad', ARRAY['4DX Motion Seats', 'VIP Lounge', 'Dolby Atmos', 'Coffee Tree'], true),
    ('44444444-4444-4444-4444-444444444444', 'pvr-acropolis-ahmedabad', 'PVR: Acropolis Mall', 'PVR', 'Thaltej Crossroads', 'Thaltej', 'Ahmedabad', 'Gujarat', '380059', 'Acropolis Mall, SG Highway, Thaltej, Ahmedabad', ARRAY['Dolby Atmos', 'Snack Lounge', 'Express Pick-Up'], true),
    ('55555555-5555-5555-5555-555555555555', 'wide-angle-sg-highway-ahmedabad', 'Wide Angle Multiplex', 'Independent', 'SG Highway', 'ISCON Cross Roads', 'Ahmedabad', 'Gujarat', '380015', 'Wide Angle, Near ISCON Cross Roads, SG Highway, Ahmedabad', ARRAY['Laser Projection', 'Dolby 7.1', 'Food Court', 'Parking'], true),
    ('66666666-6666-6666-6666-666666666666', 'miraj-vitthal-plaza-ahmedabad', 'Miraj Cinemas: Vitthal Plaza', 'Miraj', 'Naroda', 'New Naroda', 'Ahmedabad', 'Gujarat', '382330', 'Vitthal Plaza, Naroda-Dehgam Road, Ahmedabad', ARRAY['Dolby Atmos', 'Recliner Seating', 'Live Kitchen'], true),
    ('77777777-7777-7777-7777-777777777777', 'mukta-a2-central-mall-ahmedabad', 'Mukta A2 Cinemas: Central Mall', 'Mukta A2', 'Ambawadi', 'Panchvati Cross Road', 'Ahmedabad', 'Gujarat', '380006', 'Ahmedabad Central, Ambawadi, Ahmedabad', ARRAY['3D Digital Cinema', 'Snack Bar', 'Budget Friendly'], true),
    ('88888888-8888-8888-8888-888888888888', 'rajhans-cinemas-nikol-ahmedabad', 'Rajhans Cinemas: Nikol', 'Independent', 'Nikol', 'Raspan Arcade', 'Ahmedabad', 'Gujarat', '382350', 'Raspan Arcade, Nikol Gam Road, Ahmedabad', ARRAY['Dolby Atmos 3D', 'Snack Corner', 'Family Friendly'], true)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name = EXCLUDED.name,
    chain = EXCLUDED.chain,
    area = EXCLUDED.area,
    location = EXCLUDED.location,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    pincode = EXCLUDED.pincode,
    address = EXCLUDED.address,
    amenities = EXCLUDED.amenities,
    is_active = EXCLUDED.is_active;

-- 2. Insert/Upsert Screens (2-3 screens per theatre)
INSERT INTO public.screens (id, theatre_id, name, screen_number, screen_type, format, total_seats, is_active)
VALUES
    -- PVR Palladium
    ('10000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Audi 1 (IMAX Laser)', 1, 'IMAX', 'IMAX 2D', 36, true),
    ('10000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Audi 2 (LUXE)', 2, 'Insignia Luxe', '2D', 36, true),
    ('10000001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Audi 3 (Dolby Atmos)', 3, 'Dolby Atmos', '2D', 36, true),

    -- INOX Himalaya Mall
    ('10000002-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Audi 1 (Insignia)', 1, 'Insignia Luxe', '2D', 36, true),
    ('10000002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Audi 2 (Standard)', 2, 'Standard', '2D', 36, true),

    -- Cinepolis Alpha One
    ('10000003-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Audi 1 (4DX)', 1, '4DX', '4DX 3D', 36, true),
    ('10000003-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'Audi 2 (VIP)', 2, 'Insignia Luxe', '2D', 36, true),

    -- PVR Acropolis
    ('10000004-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'Audi 1 (Dolby Atmos)', 1, 'Dolby Atmos', '2D', 36, true),

    -- Wide Angle
    ('10000005-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 'Screen 1', 1, 'Standard', '2D', 36, true),

    -- Miraj
    ('10000006-0000-0000-0000-000000000001', '66666666-6666-6666-6666-666666666666', 'Audi 1', 1, 'Dolby Atmos', '2D', 36, true),

    -- Mukta A2
    ('10000007-0000-0000-0000-000000000001', '77777777-7777-7777-7777-777777777777', 'Screen 1', 1, 'Standard', '2D', 36, true),

    -- Rajhans
    ('10000008-0000-0000-0000-000000000001', '88888888-8888-8888-8888-888888888888', 'Screen 1', 1, 'Dolby Atmos', '2D', 36, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    screen_type = EXCLUDED.screen_type,
    format = EXCLUDED.format,
    total_seats = EXCLUDED.total_seats;

-- 3. Insert/Upsert Seats (36 seats per screen: 3 rows A, B, C x 12 seats)
-- Row A (Recliner, 1.5x), Row B (Premium, 1.2x), Row C (Standard, 1.0x)
INSERT INTO public.seats (screen_id, row_label, seat_number, seat_code, tier, price_multiplier, position, is_active)
SELECT
    s.id AS screen_id,
    r.row_label,
    n.num AS seat_number,
    r.row_label || n.num AS seat_code,
    r.tier,
    r.price_multiplier,
    n.num AS position,
    true AS is_active
FROM public.screens s
CROSS JOIN (
    VALUES
        ('A', 'Recliner'::text, 1.50::numeric),
        ('B', 'Premium'::text, 1.20::numeric),
        ('C', 'Standard'::text, 1.00::numeric)
) AS r(row_label, tier, price_multiplier)
CROSS JOIN (
    SELECT generate_series(1, 12) AS num
) AS n
ON CONFLICT (screen_id, seat_code) DO NOTHING;

-- 4. Insert/Upsert Movies
INSERT INTO public.movies (id, title, overview, poster_path, backdrop_path, genres, duration_minutes, rating, language, certificate, release_date, base_price, is_featured, tmdb_id)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'Dune: Part Two', 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80', ARRAY['Sci-Fi', 'Adventure', 'Action'], 166, 8.8, 'English', 'UA 16+', '2024-03-01', 320.00, true, 693134),
    ('a2222222-2222-2222-2222-222222222222', 'Oppenheimer', 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project.', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&auto=format&fit=crop&q=80', ARRAY['Drama', 'History', 'Thriller'], 180, 8.9, 'English', 'A', '2023-07-21', 350.00, true, 872585),
    ('a3333333-3333-3333-3333-333333333333', 'Spider-Man: Across the Spider-Verse', 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.', 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80', ARRAY['Animation', 'Action', 'Sci-Fi'], 140, 8.7, 'English', 'U', '2023-06-02', 280.00, true, 569094),
    ('a4444444-4444-4444-4444-444444444444', 'The Batman', 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city hidden corruption.', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&auto=format&fit=crop&q=80', ARRAY['Action', 'Crime', 'Drama'], 176, 7.9, 'English', 'UA 16+', '2022-03-04', 300.00, true, 414906)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    tmdb_id = EXCLUDED.tmdb_id,
    rating = EXCLUDED.rating;

-- 5. Insert/Upsert Shows for Today and Future Dates
-- Using parameterized timestamps matching CURRENT_DATE
INSERT INTO public.shows (id, movie_id, theatre_id, screen_id, date, start_time, end_time, base_price, format, language, status)
VALUES
    -- PVR Palladium - Dune 2 (Today)
    ('s0000001-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '10000001-0000-0000-0000-000000000001', CURRENT_DATE, (CURRENT_DATE || ' 10:30:00+05:30')::timestamptz, (CURRENT_DATE || ' 13:16:00+05:30')::timestamptz, 420.00, 'IMAX 2D', 'English', 'scheduled'),
    ('s0000001-0000-0000-0000-000000000002', 'a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '10000001-0000-0000-0000-000000000001', CURRENT_DATE, (CURRENT_DATE || ' 14:15:00+05:30')::timestamptz, (CURRENT_DATE || ' 17:01:00+05:30')::timestamptz, 450.00, 'IMAX 2D', 'English', 'scheduled'),
    ('s0000001-0000-0000-0000-000000000003', 'a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '10000001-0000-0000-0000-000000000001', CURRENT_DATE, (CURRENT_DATE || ' 18:00:00+05:30')::timestamptz, (CURRENT_DATE || ' 20:46:00+05:30')::timestamptz, 480.00, 'IMAX 2D', 'English', 'scheduled'),
    ('s0000001-0000-0000-0000-000000000004', 'a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '10000001-0000-0000-0000-000000000001', CURRENT_DATE, (CURRENT_DATE || ' 21:45:00+05:30')::timestamptz, (CURRENT_DATE + 1 || ' 00:31:00+05:30')::timestamptz, 450.00, 'IMAX 2D', 'English', 'scheduled'),

    -- INOX Himalaya Mall - Oppenheimer (Today)
    ('s0000002-0000-0000-0000-000000000001', 'a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '10000002-0000-0000-0000-000000000001', CURRENT_DATE, (CURRENT_DATE || ' 11:00:00+05:30')::timestamptz, (CURRENT_DATE || ' 14:00:00+05:30')::timestamptz, 350.00, '2D', 'English', 'scheduled'),
    ('s0000002-0000-0000-0000-000000000002', 'a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '10000002-0000-0000-0000-000000000001', CURRENT_DATE, (CURRENT_DATE || ' 15:30:00+05:30')::timestamptz, (CURRENT_DATE || ' 18:30:00+05:30')::timestamptz, 380.00, '2D', 'English', 'scheduled'),
    ('s0000002-0000-0000-0000-000000000003', 'a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '10000002-0000-0000-0000-000000000001', CURRENT_DATE, (CURRENT_DATE || ' 19:45:00+05:30')::timestamptz, (CURRENT_DATE || ' 22:45:00+05:30')::timestamptz, 400.00, '2D', 'English', 'scheduled'),

    -- Cinepolis Alpha One - Spider-Man (Today)
    ('s0000003-0000-0000-0000-000000000001', 'a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '10000003-0000-0000-0000-000000000001', CURRENT_DATE, (CURRENT_DATE || ' 10:45:00+05:30')::timestamptz, (CURRENT_DATE || ' 13:05:00+05:30')::timestamptz, 320.00, '4DX 3D', 'English', 'scheduled'),
    ('s0000003-0000-0000-0000-000000000002', 'a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '10000003-0000-0000-0000-000000000001', CURRENT_DATE, (CURRENT_DATE || ' 14:30:00+05:30')::timestamptz, (CURRENT_DATE || ' 16:50:00+05:30')::timestamptz, 360.00, '4DX 3D', 'English', 'scheduled'),
    ('s0000003-0000-0000-0000-000000000003', 'a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '10000003-0000-0000-0000-000000000001', CURRENT_DATE, (CURRENT_DATE || ' 18:15:00+05:30')::timestamptz, (CURRENT_DATE || ' 20:35:00+05:30')::timestamptz, 400.00, '4DX 3D', 'English', 'scheduled'),

    -- PVR Acropolis - The Batman (Today)
    ('s0000004-0000-0000-0000-000000000001', 'a4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '10000004-0000-0000-0000-000000000001', CURRENT_DATE, (CURRENT_DATE || ' 13:00:00+05:30')::timestamptz, (CURRENT_DATE || ' 15:56:00+05:30')::timestamptz, 280.00, '2D', 'English', 'scheduled'),
    ('s0000004-0000-0000-0000-000000000002', 'a4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '10000004-0000-0000-0000-000000000001', CURRENT_DATE, (CURRENT_DATE || ' 19:00:00+05:30')::timestamptz, (CURRENT_DATE || ' 21:56:00+05:30')::timestamptz, 320.00, '2D', 'English', 'scheduled'),

    -- PVR Palladium - Dune 2 (Tomorrow)
    ('s0000005-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '10000001-0000-0000-0000-000000000001', CURRENT_DATE + 1, (CURRENT_DATE + 1 || ' 11:30:00+05:30')::timestamptz, (CURRENT_DATE + 1 || ' 14:16:00+05:30')::timestamptz, 420.00, 'IMAX 2D', 'English', 'scheduled'),
    ('s0000005-0000-0000-0000-000000000002', 'a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '10000001-0000-0000-0000-000000000001', CURRENT_DATE + 1, (CURRENT_DATE + 1 || ' 16:00:00+05:30')::timestamptz, (CURRENT_DATE + 1 || ' 18:46:00+05:30')::timestamptz, 460.00, 'IMAX 2D', 'English', 'scheduled'),
    ('s0000005-0000-0000-0000-000000000003', 'a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '10000001-0000-0000-0000-000000000001', CURRENT_DATE + 1, (CURRENT_DATE + 1 || ' 20:30:00+05:30')::timestamptz, (CURRENT_DATE + 1 || ' 23:16:00+05:30')::timestamptz, 480.00, 'IMAX 2D', 'English', 'scheduled')
ON CONFLICT (id) DO UPDATE SET
    base_price = EXCLUDED.base_price,
    format = EXCLUDED.format,
    status = EXCLUDED.status;

-- 6. Initialize Show Seats for All Scheduled Shows
SELECT public.initialize_show_seats(id) FROM public.shows WHERE status = 'scheduled';
