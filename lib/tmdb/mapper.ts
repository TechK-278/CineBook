/**
 * CineBook v2 — TMDB Data Normalizers & Domain Mappers
 */

import { MovieCertificate } from "@/types";
import {
  TmdbMovieResult,
  TmdbMovieDetailResponse,
  TmdbCastMember,
  TmdbCrewMember,
  TmdbVideo,
  TmdbReleaseDateCountry,
  CineMovie,
  CineMovieDetail,
  CineCast,
} from "./types";
import {
  LANGUAGE_MAP,
  GENRE_ID_MAP,
  FALLBACK_POSTER,
  FALLBACK_BACKDROP,
} from "./constants";
import { getPosterUrl, getBackdropUrl, getProfileUrl } from "./images";

/**
 * Maps ISO 639-1 language code to human-readable language string
 */
export function mapLanguageCode(code?: string): string {
  if (!code) return "English";
  const normalized = code.toLowerCase().trim();
  return LANGUAGE_MAP[normalized] || code.toUpperCase();
}

/**
 * Maps TMDB genre IDs or genre objects to array of genre names
 */
export function mapGenreIds(genreIds?: number[]): string[] {
  if (!genreIds || !Array.isArray(genreIds) || genreIds.length === 0) {
    return ["Cinema"];
  }
  const names = genreIds
    .map((id) => GENRE_ID_MAP[id])
    .filter((name): name is string => Boolean(name));
  return names.length > 0 ? names : ["Cinema"];
}

/**
 * Normalizes release certification, prioritizing Indian (IN) CBFC rating
 * Valid returns: "U" | "UA" | "UA 13+" | "UA 16+" | "A"
 */
export function extractCertification(
  releaseCountries?: TmdbReleaseDateCountry[]
): MovieCertificate {
  if (!releaseCountries || !Array.isArray(releaseCountries)) {
    return "UA";
  }

  // 1. Look for India (IN) certification
  const indiaRelease = releaseCountries.find(
    (c) => c.iso_3166_1?.toUpperCase() === "IN"
  );
  if (indiaRelease && indiaRelease.release_dates?.length > 0) {
    for (const item of indiaRelease.release_dates) {
      const cert = (item.certification || "").trim().toUpperCase();
      if (cert === "U" || cert === "U/A" || cert === "UA" || cert === "UA 13+" || cert === "UA 16+" || cert === "A") {
        if (cert === "U/A") return "UA";
        return cert as MovieCertificate;
      }
    }
  }

  // 2. Look for US / general certification as fallback
  const usRelease = releaseCountries.find(
    (c) => c.iso_3166_1?.toUpperCase() === "US"
  );
  if (usRelease && usRelease.release_dates?.length > 0) {
    for (const item of usRelease.release_dates) {
      const cert = (item.certification || "").trim().toUpperCase();
      if (cert === "G") return "U";
      if (cert === "PG" || cert === "PG-13") return "UA";
      if (cert === "R" || cert === "NC-17") return "A";
    }
  }

  return "UA";
}

/**
 * Extracts the primary director from TMDB crew members
 */
export function extractDirector(crew?: TmdbCrewMember[]): string {
  if (!crew || !Array.isArray(crew) || crew.length === 0) {
    return "Acclaimed Filmmaker";
  }
  const director = crew.find(
    (c) => c.job?.toLowerCase() === "director" || c.department?.toLowerCase() === "directing"
  );
  return director?.name || crew[0]?.name || "Acclaimed Filmmaker";
}

/**
 * Extracts top cast members (up to limit, e.g. 8)
 */
export function extractCast(cast?: TmdbCastMember[], limit = 8): CineCast[] {
  if (!cast || !Array.isArray(cast)) return [];
  return cast.slice(0, limit).map((c) => ({
    id: c.id,
    name: c.name || c.original_name || "Actor",
    role: c.character || "Cast Member",
    image: getProfileUrl(c.profile_path, "md"),
  }));
}

/**
 * Extracts best YouTube trailer from TMDB videos array
 */
export function extractTrailer(videos?: TmdbVideo[]): {
  youtubeId?: string;
  url?: string;
} {
  if (!videos || !Array.isArray(videos) || videos.length === 0) {
    return {};
  }

  // Filter YouTube videos
  const ytVideos = videos.filter(
    (v) => v.site?.toLowerCase() === "youtube" && Boolean(v.key)
  );

  if (ytVideos.length === 0) return {};

  // 1. Prefer Official Trailer
  const officialTrailer = ytVideos.find(
    (v) => v.type?.toLowerCase() === "trailer" && v.official
  );
  if (officialTrailer) {
    return {
      youtubeId: officialTrailer.key,
      url: `https://www.youtube.com/watch?v=${officialTrailer.key}`,
    };
  }

  // 2. Any Trailer
  const anyTrailer = ytVideos.find((v) => v.type?.toLowerCase() === "trailer");
  if (anyTrailer) {
    return {
      youtubeId: anyTrailer.key,
      url: `https://www.youtube.com/watch?v=${anyTrailer.key}`,
    };
  }

  // 3. Teaser or Clip
  const teaser = ytVideos.find(
    (v) => v.type?.toLowerCase() === "teaser" || v.type?.toLowerCase() === "clip"
  );
  if (teaser) {
    return {
      youtubeId: teaser.key,
      url: `https://www.youtube.com/watch?v=${teaser.key}`,
    };
  }

  // 4. First available YouTube video
  const first = ytVideos[0];
  return {
    youtubeId: first.key,
    url: `https://www.youtube.com/watch?v=${first.key}`,
  };
}

/**
 * Derives cinema formats based on vote average and popularity
 */
function deriveFormats(popularity = 50, rating = 7): string[] {
  if (popularity > 100 || rating >= 8) {
    return ["2D", "IMAX 2D", "4DX", "Dolby Atmos"];
  }
  if (popularity > 50 || rating >= 7) {
    return ["2D", "3D", "Dolby Atmos"];
  }
  return ["2D", "Dolby Atmos"];
}

/**
 * Normalizes a raw TMDB movie list item into a CineMovie domain object
 */
export function normalizeTmdbMovie(
  raw: TmdbMovieResult,
  options: {
    isNowShowing?: boolean;
    isUpcoming?: boolean;
  } = {}
): CineMovie {
  const genres = mapGenreIds(raw.genre_ids);
  const rating = Number((raw.vote_average || 7.0).toFixed(1));
  const releaseYear = raw.release_date ? raw.release_date.split("-")[0] : "2025";
  const releaseDateObj = raw.release_date ? new Date(raw.release_date) : new Date();
  const now = new Date();

  // If upcoming flag not specified, infer from release date
  const isUpcoming =
    options.isUpcoming !== undefined
      ? options.isUpcoming
      : releaseDateObj.getTime() > now.getTime();

  const isNowShowing =
    options.isNowShowing !== undefined ? options.isNowShowing : !isUpcoming;

  const basePrice = rating >= 8 ? 320 : rating >= 7 ? 280 : 250;

  return {
    id: String(raw.id),
    tmdbId: raw.id,
    title: raw.title || raw.original_title || "Untitled Film",
    originalTitle: raw.original_title || raw.title || "Untitled Film",
    overview:
      raw.overview ||
      "An exciting theatrical presentation available for cinema reservations on CineBook.",
    posterPath: getPosterUrl(raw.poster_path, "lg"),
    rawPosterPath: raw.poster_path,
    backdropPath: getBackdropUrl(raw.backdrop_path, "lg"),
    rawBackdropPath: raw.backdrop_path,
    genres,
    genreIds: raw.genre_ids || [],
    durationMinutes: 120, // default until detailed endpoint
    rating,
    voteCount: raw.vote_count || 0,
    language: mapLanguageCode(raw.original_language),
    originalLanguage: raw.original_language || "en",
    certificate: raw.adult ? "A" : rating >= 8.2 ? "UA 16+" : "UA",
    releaseDate: raw.release_date || "2025-01-01",
    releaseYear,
    basePrice,
    isFeatured: raw.popularity > 80 || rating >= 8.0,
    isNowShowing,
    isUpcoming,
    format: deriveFormats(raw.popularity, rating),
    popularity: raw.popularity || 0,
  };
}

/**
 * Normalizes full TMDB movie detail response (with credits, videos, release_dates)
 */
export function normalizeTmdbMovieDetail(
  raw: TmdbMovieDetailResponse
): CineMovieDetail {
  const genres =
    raw.genres && raw.genres.length > 0
      ? raw.genres.map((g) => g.name)
      : ["Cinema"];
  const genreIds = raw.genres ? raw.genres.map((g) => g.id) : [];
  const rating = Number((raw.vote_average || 7.0).toFixed(1));
  const releaseYear = raw.release_date ? raw.release_date.split("-")[0] : "2025";
  const releaseDateObj = raw.release_date ? new Date(raw.release_date) : new Date();
  const now = new Date();
  const isUpcoming = releaseDateObj.getTime() > now.getTime();
  const isNowShowing = !isUpcoming;

  const certificate = extractCertification(raw.release_dates?.results);
  const director = extractDirector(raw.credits?.crew);
  const cast = extractCast(raw.credits?.cast, 8);
  const trailer = extractTrailer(raw.videos?.results);
  const durationMinutes = raw.runtime && raw.runtime > 0 ? raw.runtime : 125;
  const basePrice = rating >= 8 ? 350 : rating >= 7 ? 300 : 250;

  return {
    id: String(raw.id),
    tmdbId: raw.id,
    title: raw.title || raw.original_title || "Untitled Film",
    originalTitle: raw.original_title || raw.title || "Untitled Film",
    overview:
      raw.overview ||
      "An exciting theatrical presentation available for cinema reservations on CineBook.",
    posterPath: getPosterUrl(raw.poster_path, "lg"),
    rawPosterPath: raw.poster_path,
    backdropPath: getBackdropUrl(raw.backdrop_path, "lg"),
    rawBackdropPath: raw.backdrop_path,
    genres,
    genreIds,
    durationMinutes,
    rating,
    voteCount: raw.vote_count || 0,
    language: mapLanguageCode(raw.original_language),
    originalLanguage: raw.original_language || "en",
    certificate,
    releaseDate: raw.release_date || "2025-01-01",
    releaseYear,
    basePrice,
    isFeatured: raw.popularity > 80 || rating >= 8.0,
    isNowShowing,
    isUpcoming,
    format: deriveFormats(raw.popularity, rating),
    popularity: raw.popularity || 0,
    tagline: raw.tagline || undefined,
    director,
    cast,
    trailerYoutubeId: trailer.youtubeId,
    trailerUrl: trailer.url,
    status: raw.status,
  };
}
