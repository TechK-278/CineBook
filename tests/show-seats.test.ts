/**
 * CineBook v2 — Show Seats & Real-Time Seat Locking Test Suite
 * Validates atomic locking, concurrency simulation, expiration, ownership, 8-seat limit, and tier pricing.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  lockShowSeats,
  releaseShowSeats,
  getShowSeats,
  getCurrentUserLocks,
  reclaimExpiredShowSeats,
  normalizeSeatStatus,
  resetInMemoryLocks,
  MAX_SEAT_SELECTION_LIMIT,
} from "@/lib/supabase/show-seats";
import { calculateSeatsPricing, calculatePricing } from "@/lib/pricing";

describe("Phase 5: Real-Time Seat Map & Secure Seat Locking Engine", () => {
  const SHOW_ID = "show-pvr-acropolis-test-1";

  beforeEach(() => {
    resetInMemoryLocks();
  });

  describe("1. Seat Status Normalization & Expiration", () => {
    it("correctly identifies available, booked, and blocked statuses", () => {
      expect(normalizeSeatStatus("available")).toBe("AVAILABLE");
      expect(normalizeSeatStatus("AVAILABLE")).toBe("AVAILABLE");
      expect(normalizeSeatStatus("booked")).toBe("BOOKED");
      expect(normalizeSeatStatus("BOOKED")).toBe("BOOKED");
      expect(normalizeSeatStatus("BLOCKED")).toBe("BLOCKED");
    });

    it("reclaims expired locked seat as AVAILABLE if lock_expires_at has passed", () => {
      const pastTime = new Date(Date.now() - 5000).toISOString();
      const futureTime = new Date(Date.now() + 60000).toISOString();

      expect(normalizeSeatStatus("LOCKED", pastTime)).toBe("AVAILABLE");
      expect(normalizeSeatStatus("LOCKED", futureTime)).toBe("LOCKED");
      expect(normalizeSeatStatus("held", pastTime)).toBe("AVAILABLE");
      expect(normalizeSeatStatus("held", futureTime)).toBe("LOCKED");
    });
  });

  describe("2. Atomic Seat Locking & Max Seat Limits", () => {
    it("successfully locks selected seats for the current user", async () => {
      const seatIds = [`${SHOW_ID}-seat-A1`, `${SHOW_ID}-seat-A2`];
      const result = await lockShowSeats(SHOW_ID, seatIds, "user-alice");

      expect(result.success).toBe(true);
      expect(result.lockedSeats).toHaveLength(2);
      expect(result.expiresInSeconds).toBe(600);
      expect(result.expiresAt).toBeDefined();

      // Verify locked state
      const seats = await getShowSeats(SHOW_ID);
      const a1 = seats.find((s) => s.seatId === seatIds[0]);
      const a2 = seats.find((s) => s.seatId === seatIds[1]);

      expect(a1?.status).toBe("LOCKED");
      expect(a1?.lockedBy).toBe("user-alice");
      expect(a2?.status).toBe("LOCKED");
      expect(a2?.lockedBy).toBe("user-alice");
    });

    it("enforces maximum 8 seats limit on selection", async () => {
      const nineSeats = Array.from({ length: 9 }, (_, i) => `${SHOW_ID}-seat-A${i + 1}`);
      const result = await lockShowSeats(SHOW_ID, nineSeats, "user-alice");

      expect(result.success).toBe(false);
      expect(result.error).toContain(`${MAX_SEAT_SELECTION_LIMIT} seats`);
    });

    it("rejects empty seat selections", async () => {
      const result = await lockShowSeats(SHOW_ID, [], "user-alice");
      expect(result.success).toBe(false);
      expect(result.error).toContain("at least one seat");
    });
  });

  describe("3. Concurrency & Race Condition Simulation", () => {
    it("ensures exactly one user succeeds when two users race to lock the same seat", async () => {
      const targetSeat = `${SHOW_ID}-seat-A3`;

      // Alice and Bob attempt to lock the same seat concurrently
      const [resAlice, resBob] = await Promise.all([
        lockShowSeats(SHOW_ID, [targetSeat], "user-alice"),
        lockShowSeats(SHOW_ID, [targetSeat], "user-bob"),
      ]);

      // Exactly one succeeds, one fails
      const successCount = (resAlice.success ? 1 : 0) + (resBob.success ? 1 : 0);
      const failureCount = (!resAlice.success ? 1 : 0) + (!resBob.success ? 1 : 0);

      expect(successCount).toBe(1);
      expect(failureCount).toBe(1);
    });

    it("fails atomically with NO partial locks if any requested seat is unavailable", async () => {
      // Step 1: User Alice locks seat A1
      const lockA1 = await lockShowSeats(SHOW_ID, [`${SHOW_ID}-seat-A1`], "user-alice");
      expect(lockA1.success).toBe(true);

      // Step 2: User Bob attempts to lock [A1, A2, A3] (where A1 is already held by Alice)
      const lockBob = await lockShowSeats(
        SHOW_ID,
        [`${SHOW_ID}-seat-A1`, `${SHOW_ID}-seat-A2`, `${SHOW_ID}-seat-A3`],
        "user-bob"
      );

      // Bob's request must completely fail
      expect(lockBob.success).toBe(false);

      // Verify that A2 and A3 were NOT partially locked by Bob
      const seats = await getShowSeats(SHOW_ID);
      const a2 = seats.find((s) => s.seatId === `${SHOW_ID}-seat-A2`);
      const a3 = seats.find((s) => s.seatId === `${SHOW_ID}-seat-A3`);

      expect(a2?.status).toBe("AVAILABLE");
      expect(a3?.status).toBe("AVAILABLE");
    });
  });

  describe("4. Ownership & Lock Release", () => {
    it("allows a user to release their own locked seats", async () => {
      const seatIds = [`${SHOW_ID}-seat-B1`, `${SHOW_ID}-seat-B2`];
      await lockShowSeats(SHOW_ID, seatIds, "user-alice");

      const releaseRes = await releaseShowSeats(SHOW_ID, seatIds, "user-alice");
      expect(releaseRes.success).toBe(true);
      expect(releaseRes.releasedCount).toBe(2);

      const seats = await getShowSeats(SHOW_ID);
      const b1 = seats.find((s) => s.seatId === seatIds[0]);
      expect(b1?.status).toBe("AVAILABLE");
    });

    it("prevents User Bob from releasing seats locked by User Alice", async () => {
      const seatId = `${SHOW_ID}-seat-B3`;
      await lockShowSeats(SHOW_ID, [seatId], "user-alice");

      // Bob tries to release Alice's seat
      const releaseBob = await releaseShowSeats(SHOW_ID, [seatId], "user-bob");
      expect(releaseBob.releasedCount).toBe(0);

      // Alice's seat must remain locked
      const seats = await getShowSeats(SHOW_ID);
      const b3 = seats.find((s) => s.seatId === seatId);
      expect(b3?.status).toBe("LOCKED");
      expect(b3?.lockedBy).toBe("user-alice");
    });

    it("fetches active unexpired locks for a specific user", async () => {
      const seatIds = [`${SHOW_ID}-seat-C1`, `${SHOW_ID}-seat-C2`];
      await lockShowSeats(SHOW_ID, seatIds, "user-alice");

      const aliceLocks = await getCurrentUserLocks(SHOW_ID, "user-alice");
      const bobLocks = await getCurrentUserLocks(SHOW_ID, "user-bob");

      expect(aliceLocks).toHaveLength(2);
      expect(bobLocks).toHaveLength(0);
    });
  });

  describe("5. Tier-Aware Pricing Calculations", () => {
    it("calculates multi-tier pricing with multipliers and 12% convenience fee correctly", () => {
      const basePrice = 300;
      // 1 Recliner (1.5x = 450) + 1 Premium (1.2x = 360) + 1 Standard (1.0x = 300)
      const selectedSeats = [
        { tier: "Recliner", priceMultiplier: 1.5 },
        { tier: "Premium", priceMultiplier: 1.2 },
        { tier: "Standard", priceMultiplier: 1.0 },
      ];

      const pricing = calculateSeatsPricing(basePrice, selectedSeats);

      // Subtotal = 450 + 360 + 300 = 1110
      expect(pricing.subtotal).toBe(1110);
      expect(pricing.seatCount).toBe(3);

      // Convenience fee = 12% of 1110 = 133.2 -> 133
      expect(pricing.convenienceFee).toBe(133);

      // Grand total = 1110 + 133 = 1243
      expect(pricing.grandTotal).toBe(1243);

      // Tier breakdown
      expect(pricing.tierBreakdown).toHaveLength(3);
      const recliner = pricing.tierBreakdown.find((t) => t.tier === "Recliner");
      expect(recliner?.unitPrice).toBe(450);
      expect(recliner?.count).toBe(1);
    });

    it("returns zero totals when no seats are selected", () => {
      const pricing = calculateSeatsPricing(300, []);
      expect(pricing.seatCount).toBe(0);
      expect(pricing.subtotal).toBe(0);
      expect(pricing.convenienceFee).toBe(0);
      expect(pricing.grandTotal).toBe(0);
    });
  });
});
