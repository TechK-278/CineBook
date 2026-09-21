import { describe, it, expect } from "vitest";
import {
  getShowsForMovie,
  getShowsForTheatre,
  getShowById,
  validateShowSchedule,
  formatShowtimeIST,
  getTodayDateIST,
  groupShowsByTheatre,
  groupShowsByMovie,
} from "@/lib/supabase/shows";
import { Show } from "@/types";

describe("Phase 4 — Showtime Domain & Scheduling Validation", () => {
  describe("Showtime Queries & Grouping", () => {
    const today = getTodayDateIST();

    it("retrieves shows for a movie grouped by theatre with formats and slots", async () => {
      const groups = await getShowsForMovie("dune-part-two", today);
      expect(groups.length).toBeGreaterThan(0);

      groups.forEach((group) => {
        expect(group.theatre).toBeDefined();
        expect(group.theatre.name).toBeTruthy();
        expect(group.formats.length).toBeGreaterThan(0);

        group.formats.forEach((fmt) => {
          expect(fmt.format).toBeTruthy();
          expect(fmt.slots.length).toBeGreaterThan(0);

          // Ensure chronological ordering
          for (let i = 0; i < fmt.slots.length - 1; i++) {
            const t1 = new Date(fmt.slots[i].startTime).getTime();
            const t2 = new Date(fmt.slots[i + 1].startTime).getTime();
            expect(t1).toBeLessThanOrEqual(t2);
          }
        });
      });
    });

    it("retrieves shows for a theatre grouped by movie", async () => {
      const groups = await getShowsForTheatre("pvr-palladium-ahmedabad", today);
      expect(groups.length).toBeGreaterThan(0);

      groups.forEach((group) => {
        expect(group.movie).toBeDefined();
        expect(group.movie.title).toBeTruthy();
        expect(group.formats.length).toBeGreaterThan(0);
      });
    });

    it("retrieves a single show by ID with movie, screen, and theatre relations", async () => {
      const show = await getShowById("show-dune-part-two-pvr-palladium-ahmedabad-2026-09-21-1");
      expect(show).not.toBeNull();
      expect(show?.movie).toBeDefined();
      expect(show?.theatre).toBeDefined();
      expect(show?.screen).toBeDefined();
      expect(show?.basePrice).toBeGreaterThan(0);
    });

    it("formats timestamps cleanly into 12-hour IST format (e.g. 10:30 AM)", () => {
      const formatted = formatShowtimeIST("2026-09-21T10:30:00+05:30");
      expect(formatted).toMatch(/10:30\s*AM/i);

      const eveningFormatted = formatShowtimeIST("2026-09-21T21:45:00+05:30");
      expect(eveningFormatted).toMatch(/09:45\s*PM/i);
    });
  });

  describe("Schedule Conflict & Consistency Validation", () => {
    it("rejects shows where end_time is before or equal to start_time", () => {
      const result = validateShowSchedule({
        screenId: "s1",
        theatreId: "t1",
        date: "2026-09-21",
        startTime: "2026-09-21T14:00:00+05:30",
        endTime: "2026-09-21T13:00:00+05:30",
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("end_time must be strictly after start_time");
    });

    it("rejects shows with screening duration less than 30 minutes", () => {
      const result = validateShowSchedule({
        screenId: "s1",
        theatreId: "t1",
        date: "2026-09-21",
        startTime: "2026-09-21T14:00:00+05:30",
        endTime: "2026-09-21T14:15:00+05:30",
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("screening duration must be at least 30 minutes");
    });

    it("rejects screen/theatre relation mismatches", () => {
      const result = validateShowSchedule({
        screenId: "s1",
        theatreId: "theatre-A",
        screenTheatreId: "theatre-B",
        date: "2026-09-21",
        startTime: "2026-09-21T14:00:00+05:30",
        endTime: "2026-09-21T16:30:00+05:30",
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Relationship mismatch");
    });

    it("detects and rejects overlapping shows on the same screen", () => {
      const existingShows: Show[] = [
        {
          id: "show-1",
          movieId: "m1",
          screenId: "screen-101",
          theatreId: "t1",
          date: "2026-09-21",
          startTime: "2026-09-21T10:00:00+05:30",
          endTime: "2026-09-21T12:30:00+05:30",
          basePrice: 300,
          format: "2D",
          language: "English",
          status: "scheduled",
        },
      ];

      // Overlapping start (11:30 is between 10:00 and 12:30)
      const conflictResult = validateShowSchedule({
        screenId: "screen-101",
        theatreId: "t1",
        date: "2026-09-21",
        startTime: "2026-09-21T11:30:00+05:30",
        endTime: "2026-09-21T14:00:00+05:30",
        existingShows,
      });
      expect(conflictResult.isValid).toBe(false);
      expect(conflictResult.error).toContain("Schedule conflict");

      // Non-overlapping (13:00 to 15:30 starts after 12:30)
      const validResult = validateShowSchedule({
        screenId: "screen-101",
        theatreId: "t1",
        date: "2026-09-21",
        startTime: "2026-09-21T13:00:00+05:30",
        endTime: "2026-09-21T15:30:00+05:30",
        existingShows,
      });
      expect(validResult.isValid).toBe(true);
    });
  });
});
