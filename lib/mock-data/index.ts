/**
 * CineBook v2 — Mock Data Layer Index & Query Helpers
 */

export * from "./cities";
export * from "./genres";
export * from "./languages";
export * from "./movies";
export * from "./cinemas";
export * from "./shows";
export * from "./offers";

import { MOVIES, MovieDetail } from "./movies";
import { CINEMAS, CinemaDetail } from "./cinemas";
import { CITIES, City } from "./cities";
import { OFFERS, OfferItem } from "./offers";

export function getRecommendedMovies(): MovieDetail[] {
  return MOVIES.filter((m) => m.rating >= 8.0);
}

export function getNowShowingMovies(): MovieDetail[] {
  return MOVIES.filter((m) => m.isNowShowing);
}

export function getUpcomingMovies(): MovieDetail[] {
  return MOVIES.filter((m) => m.isUpcoming);
}

export function getMovieById(id: string): MovieDetail | null {
  return MOVIES.find((m) => m.id === id) || null;
}

export function getCinemasByCity(cityId: string = "ahmedabad"): CinemaDetail[] {
  return CINEMAS.filter((c) => c.cityId === cityId || c.cityName.toLowerCase() === cityId.toLowerCase());
}

export function getCinemaById(id: string): CinemaDetail | null {
  return CINEMAS.find((c) => c.id === id) || null;
}

export function searchEntities(query: string, cityId: string = "ahmedabad") {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { movies: [], cinemas: [] };
  }

  const matchedMovies = MOVIES.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q)) ||
      m.language.toLowerCase().includes(q)
  );

  const matchedCinemas = CINEMAS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.locationArea.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
  );

  return {
    movies: matchedMovies,
    cinemas: matchedCinemas,
  };
}
