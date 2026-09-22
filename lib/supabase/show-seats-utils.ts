/**
 * CineBook v2 — Show Seats Pure Utilities & Constants
 * Client-safe, zero server-dependencies module.
 */

import { ShowSeat, Seat, SeatStatus } from "@/types";

export const SEAT_LOCK_DURATION_SECONDS = 600; // 10 minutes hold
export const MAX_SEAT_SELECTION_LIMIT = 8;

/**
 * In-memory fallback lock storage for offline / unit tests / demo mode
 */
export interface InMemLock {
  showId: string;
  seatId: string;
  lockedBy: string;
  expiresAt: number; // epoch ms
  status: "LOCKED" | "BOOKED" | "BLOCKED";
}

export const inMemLocks = new Map<string, InMemLock>();

/**
 * Generates key for in-memory store
 */
export function getInMemKey(showId: string, seatId: string): string {
  return `${showId}:${seatId}`;
}

/**
 * Normalizes database status string to domain status enum
 */
export function normalizeSeatStatus(
  rawStatus: string,
  lockExpiresAt?: string | null
): SeatStatus {
  const s = (rawStatus || "AVAILABLE").toUpperCase();

  if (s === "HELD" || s === "LOCKED") {
    if (lockExpiresAt && new Date(lockExpiresAt).getTime() <= Date.now()) {
      return "AVAILABLE";
    }
    return "LOCKED";
  }

  if (s === "BOOKED") return "BOOKED";
  if (s === "BLOCKED") return "BLOCKED";
  return "AVAILABLE";
}

/**
 * Generates realistic fallback show seats for demo or offline testing
 */
export function generateFallbackShowSeats(showId: string): ShowSeat[] {
  const rows = ["A", "B", "C"];
  const showSeats: ShowSeat[] = [];

  rows.forEach((rowLabel, rIdx) => {
    const tier = rIdx === 0 ? "Recliner" : rIdx === 1 ? "Premium" : "Standard";
    const multiplier = rIdx === 0 ? 1.5 : rIdx === 1 ? 1.2 : 1.0;

    for (let s = 1; s <= 12; s++) {
      const seatId = `${showId}-seat-${rowLabel}${s}`;
      const seatCode = `${rowLabel}${s}`;
      const memKey = getInMemKey(showId, seatId);
      const memLock = inMemLocks.get(memKey);

      let status: SeatStatus = "AVAILABLE";
      let lockedBy: string | null = null;
      let lockExpiresAt: string | null = null;

      if (memLock) {
        if (memLock.expiresAt > Date.now()) {
          status = memLock.status;
          lockedBy = memLock.lockedBy;
          lockExpiresAt = new Date(memLock.expiresAt).toISOString();
        } else {
          inMemLocks.delete(memKey);
        }
      } else {
        // Deterministic demo booked seats (e.g. B5, B6)
        if (rowLabel === "B" && (s === 5 || s === 6)) {
          status = "BOOKED";
        }
      }

      showSeats.push({
        id: `ss-${showId}-${seatCode}`,
        showId,
        seatId,
        status,
        lockedBy,
        lockExpiresAt,
        heldUntil: lockExpiresAt,
        heldByUserId: lockedBy,
        seat: {
          id: seatId,
          screenId: `${showId}-screen`,
          rowLabel,
          seatNumber: s,
          seatCode,
          tier,
          priceMultiplier: multiplier,
          position: s,
          isActive: true,
        },
      });
    }
  });

  return showSeats;
}

/**
 * Clear in-memory locks (useful for test isolation)
 */
export function resetInMemoryLocks(): void {
  inMemLocks.clear();
}
