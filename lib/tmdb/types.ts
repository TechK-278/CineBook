/**
 * CineBook v2 — TMDB Raw & Normalized Type Definitions
 */

import { MovieCertificate } from "@/types";

// ==========================================
// 1. Raw TMDB API Types
// ==========================================

export interface TmdbMovieResult {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  original_language: string;
  genre_ids?: number[];
  video?: boolean;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  original_name: string;
  character: string;
  profile_path: string | null;
  order: number;
  credit_id: string;
  known_for_department?: string;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  original_name: string;
  job: string;
  department: string;
  profile_path: string | null;
  credit_id: string;
}

export interface TmdbCredits {
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TmdbVideosResponse {
  results: TmdbVideo[];
}

export interface TmdbReleaseDateItem {
  certification: string;
  descriptors?: string[];
  iso_639_1: string;
  note?: string;
  release_date: string;
  type: number;
}

export interface TmdbReleaseDateCountry {
  iso_3166_1: string;
  release_dates: TmdbReleaseDateItem[];
}

export interface TmdbReleaseDatesResponse {
  results: TmdbReleaseDateCountry[];
}

export interface TmdbMovieDetailResponse extends Omit<TmdbMovieResult, "genre_ids"> {
  genres: TmdbGenre[];
  runtime: number | null;
  tagline: string | null;
  status: string;
  budget: number;
  revenue: number;
  homepage: string | null;
  imdb_id: string | null;
  credits?: TmdbCredits;
  videos?: TmdbVideosResponse;
  release_dates?: TmdbReleaseDatesResponse;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
}

export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
  dates?: {
    maximum: string;
    minimum: string;
  };
}

// ==========================================
// 2. Normalized CineBook Domain Types
// ==========================================

export interface CineCast {
  id: number;
  name: string;
  role: string;
  image?: string;
}

export interface CineMovie {
  id: string;
  tmdbId: number;
  title: string;
  originalTitle: string;
  overview: string;
  posterPath: string;
  rawPosterPath: string | null;
  backdropPath: string;
  rawBackdropPath: string | null;
  genres: string[];
  genreIds: number[];
  durationMinutes: number;
  rating: number;
  voteCount: number;
  language: string;
  originalLanguage: string;
  certificate: MovieCertificate;
  releaseDate: string;
  releaseYear: string;
  basePrice: number;
  isFeatured: boolean;
  isNowShowing: boolean;
  isUpcoming: boolean;
  format: string[];
  popularity: number;
}

export interface CineMovieDetail extends CineMovie {
  tagline?: string;
  director: string;
  cast: CineCast[];
  trailerYoutubeId?: string;
  trailerUrl?: string;
  status?: string;
}
