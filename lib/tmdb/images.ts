/**
 * CineBook v2 — TMDB Image URL Generators & Fallbacks
 */

import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZES,
  TMDB_BACKDROP_SIZES,
  TMDB_PROFILE_SIZES,
  TmdbPosterSize,
  TmdbBackdropSize,
  TmdbProfileSize,
  FALLBACK_POSTER,
  FALLBACK_BACKDROP,
  FALLBACK_PROFILE,
} from "./constants";

/**
 * Returns full TMDB poster URL with requested size or fallback image if null/empty
 */
export function getPosterUrl(
  path?: string | null,
  size: TmdbPosterSize = "lg"
): string {
  if (!path || typeof path !== "string" || !path.trim()) {
    return FALLBACK_POSTER;
  }
  // If already absolute URL
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const sizeValue = TMDB_POSTER_SIZES[size] || TMDB_POSTER_SIZES.lg;
  return `${TMDB_IMAGE_BASE_URL}/${sizeValue}${cleanPath}`;
}

/**
 * Returns full TMDB backdrop URL with requested size or fallback image if null/empty
 */
export function getBackdropUrl(
  path?: string | null,
  size: TmdbBackdropSize = "lg"
): string {
  if (!path || typeof path !== "string" || !path.trim()) {
    return FALLBACK_BACKDROP;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const sizeValue = TMDB_BACKDROP_SIZES[size] || TMDB_BACKDROP_SIZES.lg;
  return `${TMDB_IMAGE_BASE_URL}/${sizeValue}${cleanPath}`;
}

/**
 * Returns full TMDB person/cast profile URL or fallback avatar if null/empty
 */
export function getProfileUrl(
  path?: string | null,
  size: TmdbProfileSize = "md"
): string {
  if (!path || typeof path !== "string" || !path.trim()) {
    return FALLBACK_PROFILE;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const sizeValue = TMDB_PROFILE_SIZES[size] || TMDB_PROFILE_SIZES.md;
  return `${TMDB_IMAGE_BASE_URL}/${sizeValue}${cleanPath}`;
}
