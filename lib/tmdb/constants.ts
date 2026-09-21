/**
 * CineBook v2 — TMDB Constants & Lookup Dictionaries
 */

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const DEFAULT_REGION = "IN";
export const DEFAULT_LANGUAGE = "en-US";

export const TMDB_POSTER_SIZES = {
  sm: "w185",
  md: "w342",
  lg: "w500",
  xl: "w780",
  original: "original",
} as const;

export const TMDB_BACKDROP_SIZES = {
  sm: "w300",
  md: "w780",
  lg: "w1280",
  original: "original",
} as const;

export const TMDB_PROFILE_SIZES = {
  sm: "w45",
  md: "w185",
  lg: "h632",
  original: "original",
} as const;

export type TmdbPosterSize = keyof typeof TMDB_POSTER_SIZES;
export type TmdbBackdropSize = keyof typeof TMDB_BACKDROP_SIZES;
export type TmdbProfileSize = keyof typeof TMDB_PROFILE_SIZES;

/**
 * ISO 639-1 Language Code to Human-Readable Name Map
 * Prioritizing Indian subcontinent and major cinematic languages
 */
export const LANGUAGE_MAP: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  gu: "Gujarati",
  ta: "Tamil",
  te: "Telugu",
  ml: "Malayalam",
  kn: "Kannada",
  mr: "Marathi",
  pa: "Punjabi",
  bn: "Bengali",
  ur: "Urdu",
  or: "Odia",
  as: "Assamese",
  ko: "Korean",
  ja: "Japanese",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  zh: "Chinese",
  cn: "Cantonese",
  ru: "Russian",
  pt: "Portuguese",
  ar: "Arabic",
  tr: "Turkish",
  th: "Thai",
  id: "Indonesian",
  vi: "Vietnamese",
  sv: "Swedish",
  da: "Danish",
  no: "Norwegian",
  fi: "Finnish",
  nl: "Dutch",
  pl: "Polish",
};

/**
 * Standard TMDB Movie Genre IDs to Genre Name Map
 */
export const GENRE_ID_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

/**
 * Fallback placeholder images
 */
export const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80";
export const FALLBACK_BACKDROP =
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80";
export const FALLBACK_PROFILE =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=185&auto=format&fit=crop&q=80";
