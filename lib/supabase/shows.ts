/**
 * CineBook v2 — Supabase Shows & Showtime Data Access Layer
 * Server-side scheduling queries, conflict validation, date filtering, and grouping in Asia/Kolkata timezone.
 */

import { createServerSupabaseClient } from "./server";
import { isSupabaseConfigured } from "./status";
import { Show, ShowStatus, Theatre, Screen, Movie } from "@/types";
import { CINEMAS } from "@/lib/mock-data/cinemas";
import { MOVIES } from "@/lib/mock-data/movies";
import { ShowtimeSlot } from "@/lib/mock-data/shows";

export interface MovieShowGroup {
  theatre: Theatre;
  formats: Array<{
    format: string;
    screenName: string;
    slots: Show[];
  }>;
}

export interface TheatreShowGroup {
  movie: {
    id: string;
    title: string;
    posterPath: string;
    certificate: string;
    language: string;
    durationMinutes: number;
    genres: string[];
    rating: number;
  };
  formats: Array<{
    format: string;
    screenName: string;
    slots: Show[];
  }>;
}

import {
  formatShowtimeIST,
  getTodayDateIST,
  validateShowSchedule,
} from "./show-utils";

export { formatShowtimeIST, getTodayDateIST, validateShowSchedule };

/**
 * Converts a database row with relations to Show domain model
 */
function mapDbRowToShow(row: any): Show {
  return {
    id: row.id,
    movieId: row.movie_id,
    screenId: row.screen_id,
    theatreId: row.theatre_id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    basePrice: Number(row.base_price || 300),
    format: row.format || row.screen?.screen_type || "2D",
    language: row.language || row.movie?.language || "English",
    status: (row.status as ShowStatus) || "scheduled",
    movie: row.movie
      ? {
          id: row.movie.id,
          title: row.movie.title,
          overview: row.movie.overview || "",
          posterPath: row.movie.poster_path || "",
          backdropPath: row.movie.backdrop_path,
          genres: row.movie.genres || [],
          durationMinutes: row.movie.duration_minutes || 120,
          rating: Number(row.movie.rating || 8.0),
          language: row.movie.language || "English",
          certificate: row.movie.certificate || "UA",
          releaseDate: row.movie.release_date || "2024-01-01",
          basePrice: Number(row.movie.base_price || 300),
          isFeatured: row.movie.is_featured || false,
          tmdbId: row.movie.tmdb_id,
        }
      : undefined,
    screen: row.screen
      ? {
          id: row.screen.id,
          theatreId: row.screen.theatre_id,
          name: row.screen.name,
          screenType: row.screen.screen_type || "Standard",
          format: row.screen.format || "2D",
          totalSeats: row.screen.total_seats || 36,
          isActive: row.screen.is_active,
        }
      : undefined,
    theatre: row.theatre
      ? {
          id: row.theatre.id,
          name: row.theatre.name,
          slug: row.theatre.slug || row.theatre.id,
          chain: row.theatre.chain || "Independent",
          area: row.theatre.area || row.theatre.location || "Ahmedabad",
          location: row.theatre.location || "Ahmedabad",
          city: row.theatre.city || "Ahmedabad",
          amenities: row.theatre.amenities || [],
          isActive: row.theatre.is_active,
        }
      : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}


/**
 * Generates fallback shows for a movie across Ahmedabad multiplexes
 */
function generateFallbackMovieShows(movieIdOrSlug: string, date: string): Show[] {
  const matchingMovie = MOVIES.find((m) => m.id === movieIdOrSlug || String(m.tmdbId) === movieIdOrSlug) || MOVIES[0];
  if (!matchingMovie || !matchingMovie.isNowShowing) {
    return [];
  }

  const shows: Show[] = [];
  const times = [
    { start: "10:30:00", end: "13:15:00", price: 320 },
    { start: "14:00:00", end: "16:45:00", price: 350 },
    { start: "17:30:00", end: "20:15:00", price: 380 },
    { start: "21:00:00", end: "23:45:00", price: 420 },
  ];

  CINEMAS.slice(0, 4).forEach((cinema, cIdx) => {
    times.forEach((t, tIdx) => {
      const showId = `show-${matchingMovie.id}-${cinema.id}-${date}-${tIdx + 1}`;
      const format = cIdx === 0 ? "IMAX 2D" : cIdx === 1 ? "4DX" : "2D";
      shows.push({
        id: showId,
        movieId: matchingMovie.id,
        theatreId: cinema.id,
        screenId: `${cinema.id}-screen-1`,
        date,
        startTime: `${date}T${t.start}+05:30`,
        endTime: `${date}T${t.end}+05:30`,
        basePrice: t.price,
        format,
        language: matchingMovie.language || "English",
        status: "scheduled",
        theatre: {
          id: cinema.id,
          name: cinema.name,
          slug: cinema.id,
          chain: cinema.chain,
          area: cinema.locationArea,
          location: cinema.locationArea,
          city: "Ahmedabad",
          amenities: cinema.amenities,
          screenCount: cinema.screenCount,
          formats: cinema.formats,
          isActive: true,
        },
        screen: {
          id: `${cinema.id}-screen-1`,
          theatreId: cinema.id,
          name: "Audi 1 (IMAX)",
          screenType: format === "IMAX 2D" ? "IMAX" : "Standard",
          totalSeats: 36,
          isActive: true,
        },
        movie: {
          id: matchingMovie.id,
          title: matchingMovie.title,
          overview: matchingMovie.overview,
          posterPath: matchingMovie.posterPath,
          backdropPath: matchingMovie.backdropPath,
          genres: matchingMovie.genres,
          durationMinutes: matchingMovie.durationMinutes,
          rating: matchingMovie.rating,
          language: matchingMovie.language,
          certificate: matchingMovie.certificate,
          releaseDate: matchingMovie.releaseDate,
          basePrice: matchingMovie.basePrice,
          isFeatured: matchingMovie.isFeatured,
          tmdbId: matchingMovie.tmdbId,
        },
      });
    });
  });

  return shows;
}

/**
 * Generates fallback shows for a cinema
 */
function generateFallbackTheatreShows(theatreId: string, date: string): Show[] {
  const cinema = CINEMAS.find((c) => c.id === theatreId) || CINEMAS[0];
  const nowShowing = MOVIES.filter((m) => m.isNowShowing).slice(0, 3);
  const shows: Show[] = [];

  const timeSlots = [
    { start: "10:30:00", end: "13:15:00", price: 300 },
    { start: "14:15:00", end: "17:00:00", price: 340 },
    { start: "18:00:00", end: "20:45:00", price: 380 },
    { start: "21:30:00", end: "00:15:00", price: 420 },
  ];

  nowShowing.forEach((movie, mIdx) => {
    timeSlots.forEach((slot, sIdx) => {
      const showId = `show-${theatreId}-${movie.id}-${date}-${mIdx}-${sIdx}`;
      const format = mIdx === 0 ? "IMAX 2D" : "2D";
      shows.push({
        id: showId,
        movieId: movie.id,
        theatreId: cinema.id,
        screenId: `${cinema.id}-screen-${mIdx + 1}`,
        date,
        startTime: `${date}T${slot.start}+05:30`,
        endTime: `${date}T${slot.end}+05:30`,
        basePrice: slot.price,
        format,
        language: movie.language || "English",
        status: "scheduled",
        theatre: {
          id: cinema.id,
          name: cinema.name,
          slug: cinema.id,
          chain: cinema.chain,
          area: cinema.locationArea,
          location: cinema.locationArea,
          city: "Ahmedabad",
          amenities: cinema.amenities,
          screenCount: cinema.screenCount,
          formats: cinema.formats,
          isActive: true,
        },
        screen: {
          id: `${cinema.id}-screen-${mIdx + 1}`,
          theatreId: cinema.id,
          name: `Audi ${mIdx + 1}`,
          screenType: format === "IMAX 2D" ? "IMAX" : "Standard",
          totalSeats: 36,
          isActive: true,
        },
        movie: {
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          posterPath: movie.posterPath,
          backdropPath: movie.backdropPath,
          genres: movie.genres,
          durationMinutes: movie.durationMinutes,
          rating: movie.rating,
          language: movie.language,
          certificate: movie.certificate,
          releaseDate: movie.releaseDate,
          basePrice: movie.basePrice,
          isFeatured: movie.isFeatured,
          tmdbId: movie.tmdbId,
        },
      });
    });
  });

  return shows;
}

/**
 * Fetch all scheduled shows for a movie on a given date (defaults to today in IST)
 */
export async function getShowsForMovie(
  movieIdOrTmdbId: string | number,
  date?: string
): Promise<MovieShowGroup[]> {
  const targetDate = date || getTodayDateIST();
  const idStr = String(movieIdOrTmdbId).trim();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        // Find movie UUID by id or tmdb_id
        let movieQuery = supabase.from("movies").select("id, tmdb_id");
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr);

        if (isUuid) {
          movieQuery = movieQuery.eq("id", idStr);
        } else if (!isNaN(Number(idStr))) {
          movieQuery = movieQuery.eq("tmdb_id", Number(idStr));
        } else {
          movieQuery = movieQuery.ilike("title", `%${idStr.replace(/-/g, " ")}%`);
        }

        const { data: movieData } = await movieQuery.maybeSingle();

        if (movieData) {
          const { data: showsData, error } = await supabase
            .from("shows")
            .select("*, theatre:theatres(*), screen:screens(*), movie:movies(*)")
            .eq("movie_id", movieData.id)
            .eq("date", targetDate)
            .eq("status", "scheduled")
            .order("start_time", { ascending: true });

          if (!error && showsData && showsData.length > 0) {
            const rawShows = showsData.map(mapDbRowToShow);
            return groupShowsByTheatre(rawShows);
          }
        }
      }
    } catch (err) {
      console.warn("[Shows Service] Supabase getShowsForMovie query failed:", err);
    }
  }

  // Fallback data
  const fallbackShows = generateFallbackMovieShows(idStr, targetDate);
  return groupShowsByTheatre(fallbackShows);
}

/**
 * Fetch all scheduled shows for a theatre on a given date
 */
export async function getShowsForTheatre(
  theatreIdOrSlug: string,
  date?: string
): Promise<TheatreShowGroup[]> {
  const targetDate = date || getTodayDateIST();
  const cleanId = theatreIdOrSlug.trim();

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        // Resolve theatre UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
        let theatreQuery = supabase.from("theatres").select("id").eq("is_active", true);

        if (isUuid) {
          theatreQuery = theatreQuery.eq("id", cleanId);
        } else {
          theatreQuery = theatreQuery.eq("slug", cleanId);
        }

        const { data: theatreData } = await theatreQuery.maybeSingle();

        if (theatreData) {
          const { data: showsData, error } = await supabase
            .from("shows")
            .select("*, theatre:theatres(*), screen:screens(*), movie:movies(*)")
            .eq("theatre_id", theatreData.id)
            .eq("date", targetDate)
            .eq("status", "scheduled")
            .order("start_time", { ascending: true });

          if (!error && showsData && showsData.length > 0) {
            const rawShows = showsData.map(mapDbRowToShow);
            return groupShowsByMovie(rawShows);
          }
        }
      }
    } catch (err) {
      console.warn("[Shows Service] Supabase getShowsForTheatre query failed:", err);
    }
  }

  // Fallback data
  const fallbackShows = generateFallbackTheatreShows(cleanId, targetDate);
  return groupShowsByMovie(fallbackShows);
}

/**
 * Fetch a single show by its UUID with movie, screen, and theatre relationships
 */
export async function getShowById(showId: string): Promise<Show | null> {
  const cleanId = showId.trim();
  if (!cleanId) return null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("shows")
          .select("*, theatre:theatres(*), screen:screens(*), movie:movies(*)")
          .eq("id", cleanId)
          .maybeSingle();

        if (!error && data) {
          return mapDbRowToShow(data);
        }
      }
    } catch (err) {
      console.warn("[Shows Service] Supabase getShowById query failed:", err);
    }
  }

  // Fallback matching
  const allFallbackShows = [
    ...generateFallbackMovieShows("dune-part-two", getTodayDateIST()),
    ...generateFallbackMovieShows("oppenheimer", getTodayDateIST()),
  ];
  const found = allFallbackShows.find((s) => s.id === cleanId) || allFallbackShows[0] || null;
  return found;
}

/**
 * Groups raw shows into Theatre-centric structure for movie details page
 */
export function groupShowsByTheatre(shows: Show[]): MovieShowGroup[] {
  const map = new Map<string, { theatre: Theatre; formatsMap: Map<string, Show[]> }>();

  shows.forEach((show) => {
    const theatreId = show.theatreId;
    const theatre = show.theatre || {
      id: theatreId,
      name: "CineBook Multiplex",
      slug: theatreId,
      chain: "PVR",
      area: "Ahmedabad",
      location: "Ahmedabad",
      city: "Ahmedabad",
      amenities: [],
      isActive: true,
    };

    if (!map.has(theatreId)) {
      map.set(theatreId, { theatre, formatsMap: new Map() });
    }

    const entry = map.get(theatreId)!;
    const formatKey = `${show.format || "2D"}-${show.screen?.name || "Audi 1"}`;

    if (!entry.formatsMap.has(formatKey)) {
      entry.formatsMap.set(formatKey, []);
    }
    entry.formatsMap.get(formatKey)!.push(show);
  });

  const results: MovieShowGroup[] = [];
  map.forEach(({ theatre, formatsMap }) => {
    const formats: Array<{ format: string; screenName: string; slots: Show[] }> = [];
    formatsMap.forEach((slots, formatKey) => {
      const [fmt, screenName] = formatKey.split("-");
      // Sort slots chronologically
      slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      formats.push({ format: fmt, screenName: screenName || "Audi 1", slots });
    });
    results.push({ theatre, formats });
  });

  return results;
}

/**
 * Groups raw shows into Movie-centric structure for cinema details page
 */
export function groupShowsByMovie(shows: Show[]): TheatreShowGroup[] {
  const map = new Map<string, { movie: any; formatsMap: Map<string, Show[]> }>();

  shows.forEach((show) => {
    const movieId = show.movieId;
    const movie = show.movie || {
      id: movieId,
      title: "Blockbuster Feature",
      posterPath: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500",
      certificate: "UA",
      language: "English",
      durationMinutes: 135,
      genres: ["Action", "Thriller"],
      rating: 8.5,
    };

    if (!map.has(movieId)) {
      map.set(movieId, { movie, formatsMap: new Map() });
    }

    const entry = map.get(movieId)!;
    const formatKey = `${show.format || "2D"}-${show.screen?.name || "Audi 1"}`;

    if (!entry.formatsMap.has(formatKey)) {
      entry.formatsMap.set(formatKey, []);
    }
    entry.formatsMap.get(formatKey)!.push(show);
  });

  const results: TheatreShowGroup[] = [];
  map.forEach(({ movie, formatsMap }) => {
    const formats: Array<{ format: string; screenName: string; slots: Show[] }> = [];
    formatsMap.forEach((slots, formatKey) => {
      const [fmt, screenName] = formatKey.split("-");
      slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      formats.push({ format: fmt, screenName: screenName || "Audi 1", slots });
    });
    results.push({ movie, formats });
  });

  return results;
}
