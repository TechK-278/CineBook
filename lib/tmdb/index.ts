/**
 * CineBook v2 — TMDB API Service Abstraction
 * Server-side wrapper for TMDB v3/v4 endpoints.
 * Returns structured domain representations or null if unconfigured.
 */

export function isTmdbConfigured(): boolean {
  const key = process.env.TMDB_API_KEY || process.env.TMDB_ACCESS_TOKEN;
  if (!key || key.includes("your-tmdb")) return false;
  return true;
}

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface TmdbMovieSummary {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  original_language: string;
}

/**
 * Low-level TMDB fetch helper with authentication
 */
async function fetchTmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!isTmdbConfigured()) {
    return null;
  }

  const token = process.env.TMDB_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (apiKey) {
    url.searchParams.set("api_key", apiKey);
  }

  try {
    const res = await fetch(url.toString(), {
      headers,
      next: { revalidate: 3600 }, // 1-hour cache
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const tmdbService = {
  getNowPlaying: async (page = 1) => {
    return fetchTmdb<{ results: TmdbMovieSummary[]; page: number; total_pages: number }>(
      "/movie/now_playing",
      { page: String(page) }
    );
  },

  getPopular: async (page = 1) => {
    return fetchTmdb<{ results: TmdbMovieSummary[]; page: number; total_pages: number }>(
      "/movie/popular",
      { page: String(page) }
    );
  },

  getUpcoming: async (page = 1) => {
    return fetchTmdb<{ results: TmdbMovieSummary[]; page: number; total_pages: number }>(
      "/movie/upcoming",
      { page: String(page) }
    );
  },

  searchMovies: async (query: string, page = 1) => {
    if (!query.trim()) return null;
    return fetchTmdb<{ results: TmdbMovieSummary[]; page: number; total_pages: number }>(
      "/search/movie",
      { query: query.trim(), page: String(page) }
    );
  },

  getMovie: async (tmdbId: number) => {
    return fetchTmdb<TmdbMovieSummary & { runtime: number; genres: { id: number; name: string }[] }>(
      `/movie/${tmdbId}`
    );
  },

  getGenres: async () => {
    return fetchTmdb<{ genres: { id: number; name: string }[] }>("/genre/movie/list");
  },
};
