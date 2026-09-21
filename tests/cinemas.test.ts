import { describe, it, expect } from "vitest";
import {
  getActiveTheatres,
  getTheatreById,
} from "@/lib/supabase/theatres";
import {
  getScreensForTheatre,
  getScreenWithSeats,
} from "@/lib/supabase/screens";

describe("Phase 4 — Cinemas & Screens Data Layer", () => {
  describe("Theatre Retrieval & Filtering", () => {
    it("retrieves active theatres in Ahmedabad", async () => {
      const theatres = await getActiveTheatres({ city: "ahmedabad" });
      expect(theatres.length).toBeGreaterThanOrEqual(5);

      theatres.forEach((theatre) => {
        expect(theatre.id).toBeTruthy();
        expect(theatre.name).toBeTruthy();
        expect(theatre.slug).toBeTruthy();
        expect(theatre.chain).toBeTruthy();
        expect(theatre.area).toBeTruthy();
        expect(theatre.city.toLowerCase()).toContain("ahmedabad");
        expect(theatre.isActive).toBe(true);
      });
    });

    it("filters theatres by cinema chain accurately", async () => {
      const pvrTheatres = await getActiveTheatres({ city: "ahmedabad", chain: "PVR" });
      expect(pvrTheatres.length).toBeGreaterThanOrEqual(1);
      pvrTheatres.forEach((t) => expect(t.chain).toBe("PVR"));

      const inoxTheatres = await getActiveTheatres({ city: "ahmedabad", chain: "INOX" });
      expect(inoxTheatres.length).toBeGreaterThanOrEqual(1);
      inoxTheatres.forEach((t) => expect(t.chain).toBe("INOX"));
    });

    it("searches theatres by name, area, or address", async () => {
      const results = await getActiveTheatres({ search: "Palladium" });
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((t) => t.name.includes("Palladium") || t.area.includes("Palladium"))).toBe(true);

      const emptyResults = await getActiveTheatres({ search: "NonExistentCinema12345" });
      expect(emptyResults.length).toBe(0);
    });

    it("retrieves a single theatre by slug or UUID", async () => {
      const theatre = await getTheatreById("pvr-palladium-ahmedabad");
      expect(theatre).not.toBeNull();
      expect(theatre?.name).toBe("PVR: Palladium Mall");
      expect(theatre?.chain).toBe("PVR");

      const nonExistent = await getTheatreById("invalid-cinema-id-xyz");
      expect(nonExistent).toBeNull();
    });
  });

  describe("Screen & Seat Structure", () => {
    it("retrieves screens for a specific theatre with valid capacity and formats", async () => {
      const screens = await getScreensForTheatre("pvr-palladium-ahmedabad");
      expect(screens.length).toBeGreaterThan(0);

      screens.forEach((screen) => {
        expect(screen.id).toBeTruthy();
        expect(screen.name).toBeTruthy();
        expect(screen.screenType).toBeTruthy();
        expect(screen.totalSeats).toBeGreaterThan(0);
      });
    });

    it("retrieves screen with tier-structured seats", async () => {
      const { screen, seats } = await getScreenWithSeats("screen-demo-1");
      expect(screen).not.toBeNull();
      expect(seats.length).toBeGreaterThan(0);

      // Verify seats have valid seat codes, tiers, and price multipliers
      seats.forEach((seat) => {
        expect(seat.seatCode).toMatch(/^[A-Z][0-9]+$/);
        expect(["Standard", "Premium", "Recliner"]).toContain(seat.tier);
        expect(seat.priceMultiplier).toBeGreaterThan(0);
        expect(seat.isActive).toBe(true);
      });
    });
  });
});
