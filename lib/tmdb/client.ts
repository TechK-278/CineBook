/**
 * CineBook v2 — Centralized TMDB HTTP Client
 * Secure server-side request wrapper with caching, typed responses, and resilient error recovery.
 */

import { TMDB_BASE_URL, DEFAULT_LANGUAGE } from "./constants";

/**
 * Checks if TMDB API is properly configured via environment variables
 */
export function isTmdbConfigured(): boolean {
  const token = process.env.TMDB_ACCESS_TOKEN;
  const key = process.env.TMDB_API_KEY;
  if (token && !token.includes("your-tmdb") && token.trim().length > 10) {
    return true;
  }
  if (key && !key.includes("your-tmdb") && key.trim().length > 10) {
    return true;
  }
  return false;
}

/**
 * Centralized, typed server-side fetch wrapper for TMDB API
 */
export async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
  revalidateSeconds = 3600
): Promise<T | null> {
  if (!isTmdbConfigured()) {
    return null;
  }

  const token = process.env.TMDB_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;

  const url = new URL(`${TMDB_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`);

  // Default language
  if (!params.language) {
    url.searchParams.set("language", DEFAULT_LANGUAGE);
  }

  // Append query params
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      url.searchParams.set(key, String(val));
    }
  });

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  // Prefer Bearer token
  if (token && !token.includes("your-tmdb")) {
    headers["Authorization"] = `Bearer ${token.trim()}`;
  } else if (apiKey && !apiKey.includes("your-tmdb")) {
    url.searchParams.set("api_key", apiKey.trim());
  }

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
      next: {
        revalidate: revalidateSeconds,
      },
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      console.warn(`[TMDB Client] Request to ${endpoint} returned HTTP status ${res.status}`);
      return null;
    }

    const data = (await res.json()) as T;
    return data;
  } catch (error) {
    console.error(`[TMDB Client] Network error fetching ${endpoint}:`, error instanceof Error ? error.message : "Unknown error");
    return null;
  }
}
