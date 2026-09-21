-- ==============================================================================
-- CineBook v2 — Seed Data
-- ==============================================================================

-- 1. Insert Theatres
INSERT INTO public.theatres (id, name, location, city, address, amenities)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Cineplex Central', 'Downtown City Center', 'Mumbai', '123 MG Road, Fort, Mumbai', ARRAY['4K Laser Projection', 'Dolby Atmos', 'Recliner Seating', 'Gourmet Food']),
    ('22222222-2222-2222-2222-222222222222', 'PVR IMAX', 'Phoenix Grand Mall', 'Mumbai', 'Lower Parel, Mumbai', ARRAY['IMAX with Laser', 'Dolby 7.1', 'Valet Parking']),
    ('33333333-3333-3333-3333-333333333333', 'INOX Premiere', 'Galleria Boulevard', 'Bengaluru', 'Indiranagar, Bengaluru', ARRAY['Insignia Luxe Screen', 'Butler on Call', 'Plush Recliners']),
    ('44444444-4444-4444-4444-444444444444', 'CineMax Arena', 'West End Plaza', 'Delhi', 'Connaught Place, New Delhi', ARRAY['Dolby 7.1 Surround', 'Snack Bar', 'Wheelchair Accessible'])
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Movies
INSERT INTO public.movies (id, title, overview, poster_path, backdrop_path, genres, duration_minutes, rating, language, certificate, release_date, base_price, is_featured, tmdb_id)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'Dune: Part Two', 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80', ARRAY['Sci-Fi', 'Adventure', 'Action'], 166, 8.8, 'English', 'UA 16+', '2024-03-01', 320.00, true, 693134),
    ('a2222222-2222-2222-2222-222222222222', 'Oppenheimer', 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project.', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&auto=format&fit=crop&q=80', ARRAY['Drama', 'History', 'Thriller'], 180, 8.9, 'English', 'A', '2023-07-21', 350.00, true, 872585),
    ('a3333333-3333-3333-3333-333333333333', 'Spider-Man: Across the Spider-Verse', 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.', 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80', ARRAY['Animation', 'Action', 'Sci-Fi'], 140, 8.7, 'English', 'U', '2023-06-02', 280.00, true, 569094),
    ('a4444444-4444-4444-4444-444444444444', 'The Batman', 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city hidden corruption.', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&auto=format&fit=crop&q=80', ARRAY['Action', 'Crime', 'Drama'], 176, 7.9, 'English', 'UA 16+', '2022-03-04', 300.00, true, 414906)
ON CONFLICT (id) DO NOTHING;
