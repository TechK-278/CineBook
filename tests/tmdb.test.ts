import { describe, it, expect } from "vitest";
import {
  mapLanguageCode,
  mapGenreIds,
  extractCertification,
  extractDirector,
  extractCast,
  extractTrailer,
  normalizeTmdbMovie,
  normalizeTmdbMovieDetail,
} from "@/lib/tmdb/mapper";
import {
  getPosterUrl,
  getBackdropUrl,
  getProfileUrl,
} from "@/lib/tmdb/images";
import {
  TmdbMovieResult,
  TmdbMovieDetailResponse,
} from "@/lib/tmdb/types";
import {
  getNowPlayingMovies,
  getPopularMovies,
  getUpcomingMovies,
  getMovieDetails,
  searchMovies,
} from "@/lib/tmdb/movies";

describe("Phase 3 — TMDB Integration & Movie Domain Mappers", () => {
  describe("Language Mapping", () => {
    it("maps standard Indian and international ISO 639-1 language codes", () => {
      expect(mapLanguageCode("en")).toBe("English");
      expect(mapLanguageCode("hi")).toBe("Hindi");
      expect(mapLanguageCode("gu")).toBe("Gujarati");
      expect(mapLanguageCode("ta")).toBe("Tamil");
      expect(mapLanguageCode("te")).toBe("Telugu");
      expect(mapLanguageCode("ml")).toBe("Malayalam");
      expect(mapLanguageCode("kn")).toBe("Kannada");
      expect(mapLanguageCode("mr")).toBe("Marathi");
      expect(mapLanguageCode("pa")).toBe("Punjabi");
      expect(mapLanguageCode("bn")).toBe("Bengali");
      expect(mapLanguageCode("ja")).toBe("Japanese");
      expect(mapLanguageCode("ko")).toBe("Korean");
    });

    it("handles missing or unknown language codes gracefully", () => {
      expect(mapLanguageCode(undefined)).toBe("English");
      expect(mapLanguageCode("xyz")).toBe("XYZ");
    });
  });

  describe("Genre Mapping", () => {
    it("maps TMDB genre numeric IDs to standard readable names", () => {
      expect(mapGenreIds([28, 12, 878])).toEqual(["Action", "Adventure", "Sci-Fi"]);
      expect(mapGenreIds([18, 53])).toEqual(["Drama", "Thriller"]);
      expect(mapGenreIds([16, 10751])).toEqual(["Animation", "Family"]);
    });

    it("returns default fallback genre for empty or missing genre list", () => {
      expect(mapGenreIds([])).toEqual(["Cinema"]);
      expect(mapGenreIds(undefined)).toEqual(["Cinema"]);
    });
  });

  describe("Certification Extraction", () => {
    it("prioritizes Indian CBFC release certifications (IN)", () => {
      const mockReleases = [
        {
          iso_3166_1: "US",
          release_dates: [{ certification: "PG-13", release_date: "2024-03-01", type: 3 }],
        },
        {
          iso_3166_1: "IN",
          release_dates: [{ certification: "UA 16+", release_date: "2024-03-01", type: 3 }],
        },
      ];
      expect(extractCertification(mockReleases as any)).toBe("UA 16+");
    });

    it("maps US release certification when Indian rating is missing", () => {
      const mockReleases = [
        {
          iso_3166_1: "US",
          release_dates: [{ certification: "R", release_date: "2024-03-01", type: 3 }],
        },
      ];
      expect(extractCertification(mockReleases as any)).toBe("A");
    });

    it("defaults to UA when no certifications are found", () => {
      expect(extractCertification([])).toBe("UA");
      expect(extractCertification(undefined)).toBe("UA");
    });
  });

  describe("Trailer Extraction", () => {
    it("extracts official YouTube trailer correctly", () => {
      const mockVideos = [
        {
          id: "1",
          iso_639_1: "en",
          iso_3166_1: "US",
          key: "clip123",
          name: "Behind the Scenes",
          site: "YouTube",
          size: 1080,
          type: "Clip",
          official: true,
          published_at: "2024-01-01",
        },
        {
          id: "2",
          iso_639_1: "en",
          iso_3166_1: "US",
          key: "trailerABC",
          name: "Official Main Trailer",
          site: "YouTube",
          size: 1080,
          type: "Trailer",
          official: true,
          published_at: "2024-01-01",
        },
      ];

      const trailer = extractTrailer(mockVideos as any);
      expect(trailer.youtubeId).toBe("trailerABC");
      expect(trailer.url).toBe("https://www.youtube.com/watch?v=trailerABC");
    });

    it("returns empty object when no videos exist", () => {
      expect(extractTrailer([])).toEqual({});
      expect(extractTrailer(undefined)).toEqual({});
    });
  });

  describe("Image Helpers & Fallbacks", () => {
    it("constructs full TMDB image URL for valid poster path", () => {
      const url = getPosterUrl("/sample_poster.jpg", "lg");
      expect(url).toBe("https://image.tmdb.org/t/p/w500/sample_poster.jpg");
    });

    it("constructs full TMDB backdrop URL for valid backdrop path", () => {
      const url = getBackdropUrl("/sample_backdrop.jpg", "lg");
      expect(url).toBe("https://image.tmdb.org/t/p/w1280/sample_backdrop.jpg");
    });

    it("returns fallback artwork when path is null or empty", () => {
      expect(getPosterUrl(null)).toBeTruthy();
      expect(getPosterUrl("")).toBeTruthy();
      expect(getBackdropUrl(null)).toBeTruthy();
      expect(getProfileUrl(null)).toBeTruthy();
    });
  });

  describe("Normalization & Domain Models", () => {
    const rawItem: TmdbMovieResult = {
      id: 693134,
      title: "Dune: Part Two",
      original_title: "Dune: Part Two",
      overview: "Paul Atreides unites with Chani...",
      poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s520b4.jpg",
      release_date: "2024-03-01",
      vote_average: 8.4,
      vote_count: 5200,
      popularity: 145.2,
      adult: false,
      original_language: "en",
      genre_ids: [878, 12],
    };

    it("normalizes raw TMDB movie list item into CineMovie", () => {
      const normalized = normalizeTmdbMovie(rawItem, { isNowShowing: true });
      expect(normalized.id).toBe("693134");
      expect(normalized.tmdbId).toBe(693134);
      expect(normalized.title).toBe("Dune: Part Two");
      expect(normalized.rating).toBe(8.4);
      expect(normalized.language).toBe("English");
      expect(normalized.genres).toContain("Sci-Fi");
      expect(normalized.isNowShowing).toBe(true);
      expect(normalized.posterPath).toContain("/w500/");
    });

    it("normalizes raw TMDB movie detail response into CineMovieDetail", () => {
      const rawDetail: TmdbMovieDetailResponse = {
        ...rawItem,
        genres: [
          { id: 878, name: "Science Fiction" },
          { id: 12, name: "Adventure" },
        ],
        runtime: 166,
        tagline: "Long live the fighters",
        status: "Released",
        budget: 190000000,
        revenue: 711800000,
        homepage: "https://www.dunemovie.com",
        imdb_id: "tt15239678",
        spoken_languages: [{ english_name: "English", iso_639_1: "en", name: "English" }],
        production_countries: [{ iso_3166_1: "US", name: "United States" }],
        credits: {
          cast: [
            {
              id: 1190668,
              name: "Timothée Chalamet",
              original_name: "Timothée Chalamet",
              character: "Paul Atreides",
              profile_path: "/BE2sdjpg9EVgB9T5pC1fC8w0.jpg",
              order: 0,
              credit_id: "c1",
            },
          ],
          crew: [
            {
              id: 137427,
              name: "Denis Villeneuve",
              original_name: "Denis Villeneuve",
              job: "Director",
              department: "Directing",
              profile_path: "/d1.jpg",
              credit_id: "d1",
            },
          ],
        },
        videos: {
          results: [
            {
              id: "v1",
              iso_639_1: "en",
              iso_3166_1: "US",
              key: "Way9Dexny3w",
              name: "Official Trailer",
              site: "YouTube",
              size: 1080,
              type: "Trailer",
              official: true,
              published_at: "2023-05-03",
            },
          ],
        },
      };

      const detail = normalizeTmdbMovieDetail(rawDetail);
      expect(detail.title).toBe("Dune: Part Two");
      expect(detail.director).toBe("Denis Villeneuve");
      expect(detail.durationMinutes).toBe(166);
      expect(detail.cast.length).toBe(1);
      expect(detail.cast[0].name).toBe("Timothée Chalamet");
      expect(detail.trailerYoutubeId).toBe("Way9Dexny3w");
      expect(detail.tagline).toBe("Long live the fighters");
    });
  });

  describe("Service Queries & Resilience", () => {
    it("returns movies for now playing, popular, upcoming without errors", async () => {
      const nowPlaying = await getNowPlayingMovies();
      expect(nowPlaying.length).toBeGreaterThan(0);
      nowPlaying.forEach((m) => {
        expect(m.id).toBeDefined();
        expect(m.title).toBeTruthy();
        expect(m.posterPath).toBeTruthy();
      });

      const upcoming = await getUpcomingMovies();
      expect(upcoming.length).toBeGreaterThan(0);

      const popular = await getPopularMovies();
      expect(popular.length).toBeGreaterThan(0);
    });

    it("searches movies and normalizes results", async () => {
      const results = await searchMovies("Dune");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((m) => m.title.toLowerCase().includes("dune"))).toBe(true);

      const emptyResults = await searchMovies("   ");
      expect(emptyResults.length).toBe(0);
    });

    it("retrieves movie details by ID or slug", async () => {
      const movie = await getMovieDetails("dune-part-two");
      expect(movie).not.toBeNull();
      expect(movie?.title).toBe("Dune: Part Two");
      expect(movie?.cast.length).toBeGreaterThan(0);
    });
  });
});
