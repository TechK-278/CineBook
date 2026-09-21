import { describe, it, expect } from "vitest";
import {
  MOVIES,
  CINEMAS,
  CITIES,
  GENRES,
  LANGUAGES,
  getMovieById,
  getCinemaById,
  searchEntities,
  getRecommendedMovies,
  getNowShowingMovies,
  getUpcomingMovies,
} from "@/lib/mock-data";
import { calculatePricing, formatCurrency } from "@/lib/pricing";

describe("Phase 1 — Marketplace Data & Domain Logic", () => {
  it("loads movies with valid poster, ratings, certificates, and pricing", () => {
    expect(MOVIES.length).toBeGreaterThanOrEqual(12);
    MOVIES.forEach((movie) => {
      expect(movie.id).toBeDefined();
      expect(movie.title).toBeTruthy();
      expect(movie.posterPath).toBeTruthy();
      expect(movie.rating).toBeGreaterThan(0);
      expect(movie.basePrice).toBeGreaterThan(0);
      expect(movie.genres.length).toBeGreaterThan(0);
    });
  });

  it("loads cinemas across Ahmedabad and partner cities", () => {
    expect(CINEMAS.length).toBeGreaterThanOrEqual(8);
    const ahmedabadCinemas = CINEMAS.filter((c) => c.cityId === "ahmedabad");
    expect(ahmedabadCinemas.length).toBeGreaterThanOrEqual(5);

    ahmedabadCinemas.forEach((cinema) => {
      expect(cinema.name).toBeTruthy();
      expect(cinema.locationArea).toBeTruthy();
      expect(cinema.screenCount).toBeGreaterThan(0);
      expect(cinema.formats.length).toBeGreaterThan(0);
    });
  });

  it("filters recommended, now-showing, and upcoming movies accurately", () => {
    const recommended = getRecommendedMovies();
    expect(recommended.length).toBeGreaterThan(0);
    recommended.forEach((m) => expect(m.rating).toBeGreaterThanOrEqual(8.0));

    const nowShowing = getNowShowingMovies();
    expect(nowShowing.length).toBeGreaterThan(0);
    nowShowing.forEach((m) => expect(m.isNowShowing).toBe(true));

    const upcoming = getUpcomingMovies();
    expect(upcoming.length).toBeGreaterThan(0);
    upcoming.forEach((m) => expect(m.isUpcoming).toBe(true));
  });

  it("searches movies and cinemas with case-insensitive matching", () => {
    // Search by movie title
    const searchDune = searchEntities("dune");
    expect(searchDune.movies.some((m) => m.title.includes("Dune"))).toBe(true);

    // Search by genre
    const searchSciFi = searchEntities("Sci-Fi");
    expect(searchSciFi.movies.length).toBeGreaterThan(0);

    // Search by cinema name / area
    const searchPalladium = searchEntities("Palladium");
    expect(searchPalladium.cinemas.some((c) => c.name.includes("Palladium"))).toBe(true);

    // Search with empty string
    const searchEmpty = searchEntities("");
    expect(searchEmpty.movies.length).toBe(0);
    expect(searchEmpty.cinemas.length).toBe(0);
  });

  it("retrieves entity by unique ID accurately", () => {
    const movie = getMovieById("dune-part-two");
    expect(movie).not.toBeNull();
    expect(movie?.title).toBe("Dune: Part Two");

    const cinema = getCinemaById("pvr-palladium-ahmedabad");
    expect(cinema).not.toBeNull();
    expect(cinema?.name).toBe("PVR: Palladium Mall");
  });

  it("preserves authoritative pricing calculations", () => {
    expect(calculatePricing(320, 1)).toEqual({
      unitPrice: 320,
      seatCount: 1,
      subtotal: 320,
      convenienceFee: 38,
      grandTotal: 358,
    });

    expect(calculatePricing(320, 3)).toEqual({
      unitPrice: 320,
      seatCount: 3,
      subtotal: 960,
      convenienceFee: 115,
      grandTotal: 1075,
    });

    expect(calculatePricing(320, 8)).toEqual({
      unitPrice: 320,
      seatCount: 8,
      subtotal: 2560,
      convenienceFee: 307,
      grandTotal: 2867,
    });

    expect(formatCurrency(1075)).toBe("₹1,075");
  });
});
