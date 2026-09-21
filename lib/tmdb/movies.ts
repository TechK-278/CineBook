/**
 * CineBook v2 — High-Level TMDB Movie Services & Catalogue Retrieval
 */

import { tmdbFetch, isTmdbConfigured } from "./client";
import {
  DEFAULT_REGION,
  DEFAULT_LANGUAGE,
} from "./constants";
import {
  TmdbMovieResult,
  TmdbMovieDetailResponse,
  TmdbCredits,
  TmdbVideosResponse,
  TmdbPaginatedResponse,
  TmdbGenre,
  CineMovie,
  CineMovieDetail,
} from "./types";
import {
  normalizeTmdbMovie,
  normalizeTmdbMovieDetail,
} from "./mapper";
import { MOVIES as FALLBACK_MOVIES, MovieDetail as FallbackMovieDetail } from "@/lib/mock-data/movies";

/**
 * Converts fallback local demo movie into CineMovie
 */
function mapFallbackToCineMovie(m: FallbackMovieDetail): CineMovie {
  const rating = m.rating || 8.0;
  return {
    id: m.id,
    tmdbId: m.tmdbId || 100000,
    title: m.title,
    originalTitle: m.title,
    overview: m.overview,
    posterPath: m.posterPath,
    rawPosterPath: null,
    backdropPath: m.backdropPath || m.posterPath,
    rawBackdropPath: null,
    genres: m.genres,
    genreIds: [],
    durationMinutes: m.durationMinutes,
    rating,
    voteCount: 1540,
    language: m.language,
    originalLanguage: "en",
    certificate: m.certificate,
    releaseDate: m.releaseDate,
    releaseYear: m.releaseDate.split("-")[0] || "2024",
    basePrice: m.basePrice,
    isFeatured: m.isFeatured,
    isNowShowing: m.isNowShowing,
    isUpcoming: m.isUpcoming,
    format: m.format,
    popularity: 95,
  };
}

/**
 * Converts fallback local demo movie into CineMovieDetail
 */
function mapFallbackToCineMovieDetail(m: FallbackMovieDetail): CineMovieDetail {
  const base = mapFallbackToCineMovie(m);
  return {
    ...base,
    director: m.director,
    cast: m.cast.map((c, i) => ({
      id: i + 1,
      name: c.name,
      role: c.role,
      image: c.image,
    })),
    trailerYoutubeId: m.trailerYoutubeId,
    trailerUrl: m.trailerYoutubeId
      ? `https://www.youtube.com/watch?v=${m.trailerYoutubeId}`
      : undefined,
    status: "Released",
  };
}

/**
 * Fetch Now Playing movies (targeted to India region by default)
 */
export async function getNowPlayingMovies(options: {
  page?: number;
  region?: string;
} = {}): Promise<CineMovie[]> {
  const { page = 1, region = DEFAULT_REGION } = options;

  if (!isTmdbConfigured()) {
    return FALLBACK_MOVIES.filter((m) => m.isNowShowing).map(mapFallbackToCineMovie);
  }

  const res = await tmdbFetch<TmdbPaginatedResponse<TmdbMovieResult>>(
    "/movie/now_playing",
    { page, region }
  );

  if (!res || !res.results || res.results.length === 0) {
    return FALLBACK_MOVIES.filter((m) => m.isNowShowing).map(mapFallbackToCineMovie);
  }

  return res.results.map((item) =>
    normalizeTmdbMovie(item, { isNowShowing: true, isUpcoming: false })
  );
}

/**
 * Fetch Popular movies
 */
export async function getPopularMovies(options: {
  page?: number;
  region?: string;
} = {}): Promise<CineMovie[]> {
  const { page = 1, region = DEFAULT_REGION } = options;

  if (!isTmdbConfigured()) {
    return FALLBACK_MOVIES.filter((m) => m.isFeatured || m.rating >= 8.0).map(mapFallbackToCineMovie);
  }

  const res = await tmdbFetch<TmdbPaginatedResponse<TmdbMovieResult>>(
    "/movie/popular",
    { page, region }
  );

  if (!res || !res.results || res.results.length === 0) {
    return FALLBACK_MOVIES.filter((m) => m.isFeatured).map(mapFallbackToCineMovie);
  }

  return res.results.map((item) => normalizeTmdbMovie(item));
}

/**
 * Fetch Top Rated movies
 */
export async function getTopRatedMovies(options: {
  page?: number;
  region?: string;
} = {}): Promise<CineMovie[]> {
  const { page = 1, region = DEFAULT_REGION } = options;

  if (!isTmdbConfigured()) {
    return [...FALLBACK_MOVIES].sort((a, b) => b.rating - a.rating).map(mapFallbackToCineMovie);
  }

  const res = await tmdbFetch<TmdbPaginatedResponse<TmdbMovieResult>>(
    "/movie/top_rated",
    { page, region }
  );

  if (!res || !res.results || res.results.length === 0) {
    return [...FALLBACK_MOVIES].sort((a, b) => b.rating - a.rating).map(mapFallbackToCineMovie);
  }

  return res.results.map((item) => normalizeTmdbMovie(item));
}

/**
 * Fetch Upcoming movies (targeted to India region by default)
 */
export async function getUpcomingMovies(options: {
  page?: number;
  region?: string;
} = {}): Promise<CineMovie[]> {
  const { page = 1, region = DEFAULT_REGION } = options;

  if (!isTmdbConfigured()) {
    return FALLBACK_MOVIES.filter((m) => m.isUpcoming).map(mapFallbackToCineMovie);
  }

  const res = await tmdbFetch<TmdbPaginatedResponse<TmdbMovieResult>>(
    "/movie/upcoming",
    { page, region }
  );

  if (!res || !res.results || res.results.length === 0) {
    return FALLBACK_MOVIES.filter((m) => m.isUpcoming).map(mapFallbackToCineMovie);
  }

  return res.results.map((item) =>
    normalizeTmdbMovie(item, { isNowShowing: false, isUpcoming: true })
  );
}

/**
 * Search movies by text query
 */
export async function searchMovies(
  query: string,
  options: { page?: number } = {}
): Promise<CineMovie[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  if (!isTmdbConfigured()) {
    const q = cleanQuery.toLowerCase();
    return FALLBACK_MOVIES.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genres.some((g) => g.toLowerCase().includes(q)) ||
        m.language.toLowerCase().includes(q)
    ).map(mapFallbackToCineMovie);
  }

  const res = await tmdbFetch<TmdbPaginatedResponse<TmdbMovieResult>>(
    "/search/movie",
    { query: cleanQuery, page: options.page || 1 }
  );

  if (!res || !res.results) {
    const q = cleanQuery.toLowerCase();
    return FALLBACK_MOVIES.filter((m) => m.title.toLowerCase().includes(q)).map(
      mapFallbackToCineMovie
    );
  }

  return res.results.map((item) => normalizeTmdbMovie(item));
}

/**
 * Fetch detailed movie information including credits, videos, and release dates
 */
export async function getMovieDetails(
  idOrSlug: string | number
): Promise<CineMovieDetail | null> {
  const idStr = String(idOrSlug).trim();

  // 1. Check fallback dataset first if it matches fallback slug ID
  const localMatch = FALLBACK_MOVIES.find((m) => m.id === idStr);

  if (!isTmdbConfigured()) {
    if (localMatch) return mapFallbackToCineMovieDetail(localMatch);
    // If numeric query and not configured, try matching first demo movie
    return FALLBACK_MOVIES[0] ? mapFallbackToCineMovieDetail(FALLBACK_MOVIES[0]) : null;
  }

  // If numeric TMDB ID
  const tmdbNumericId = Number(idStr);
  if (!isNaN(tmdbNumericId) && tmdbNumericId > 0) {
    const res = await tmdbFetch<TmdbMovieDetailResponse>(
      `/movie/${tmdbNumericId}`,
      {
        append_to_response: "credits,videos,release_dates",
      }
    );

    if (res) {
      return normalizeTmdbMovieDetail(res);
    }
  }

  // If slug provided or numeric lookup failed, check local fallback
  if (localMatch) {
    return mapFallbackToCineMovieDetail(localMatch);
  }

  return null;
}

/**
 * Fetch credits for a movie
 */
export async function getMovieCredits(tmdbId: number): Promise<TmdbCredits | null> {
  return tmdbFetch<TmdbCredits>(`/movie/${tmdbId}/credits`);
}

/**
 * Fetch videos for a movie
 */
export async function getMovieVideos(tmdbId: number): Promise<TmdbVideosResponse | null> {
  return tmdbFetch<TmdbVideosResponse>(`/movie/${tmdbId}/videos`);
}

/**
 * Fetch standard TMDB movie genre list
 */
export async function getMovieGenres(): Promise<TmdbGenre[]> {
  if (!isTmdbConfigured()) {
    return [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
      { id: 16, name: "Animation" },
      { id: 35, name: "Comedy" },
      { id: 80, name: "Crime" },
      { id: 18, name: "Drama" },
      { id: 14, name: "Fantasy" },
      { id: 27, name: "Horror" },
      { id: 878, name: "Sci-Fi" },
      { id: 53, name: "Thriller" },
    ];
  }

  const res = await tmdbFetch<{ genres: TmdbGenre[] }>("/genre/movie/list");
  return res?.genres || [];
}
