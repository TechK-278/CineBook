/**
 * CineBook v2 — Supabase Show Seats & Real-Time Seat Locking Data Layer
 * Server-authoritative atomic locking, expiration reconciliation, and tier calculations.
 */

import { createServerSupabaseClient } from "./server";
import { isSupabaseConfigured } from "./status";
import { ShowSeat, Seat, SeatLockResult } from "@/types";
import {
  SEAT_LOCK_DURATION_SECONDS,
  MAX_SEAT_SELECTION_LIMIT,
  normalizeSeatStatus,
  generateFallbackShowSeats,
  getInMemKey,
  inMemLocks,
  resetInMemoryLocks,
} from "./show-seats-utils";

export {
  SEAT_LOCK_DURATION_SECONDS,
  MAX_SEAT_SELECTION_LIMIT,
  normalizeSeatStatus,
  generateFallbackShowSeats,
  resetInMemoryLocks,
};

/**
 * Maps database show_seat row to ShowSeat domain model
 */
function mapDbRowToShowSeat(row: any): ShowSeat {
  const lockExpires = row.lock_expires_at || row.held_until || null;
  const lockedBy = row.locked_by || row.held_by_user_id || null;
  const status = normalizeSeatStatus(row.status, lockExpires);

  const seat: Seat | undefined = row.seat
    ? {
        id: row.seat.id,
        screenId: row.seat.screen_id,
        rowLabel: row.seat.row_label,
        seatNumber: row.seat.seat_number,
        seatCode: row.seat.seat_code,
        tier: row.seat.tier || "Standard",
        priceMultiplier: Number(row.seat.price_multiplier || 1.0),
        position: row.seat.position || row.seat.seat_number,
        isActive: row.seat.is_active !== undefined ? row.seat.is_active : true,
      }
    : undefined;

  return {
    id: row.id,
    showId: row.show_id,
    seatId: row.seat_id,
    status,
    lockedBy: status === "LOCKED" ? lockedBy : null,
    lockExpiresAt: status === "LOCKED" ? lockExpires : null,
    heldUntil: status === "LOCKED" ? lockExpires : null,
    heldByUserId: status === "LOCKED" ? lockedBy : null,
    seat,
  };
}

/**
 * Fetch all show_seats for a given show, including seat metadata
 */
export async function getShowSeats(showId: string): Promise<ShowSeat[]> {
  const cleanId = showId?.trim();
  if (!cleanId) return [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("show_seats")
          .select("*, seat:seats(*)")
          .eq("show_id", cleanId);

        if (!error && data && data.length > 0) {
          const mapped = data.map(mapDbRowToShowSeat);
          mapped.sort((a, b) => {
            const rowA = a.seat?.rowLabel || "";
            const rowB = b.seat?.rowLabel || "";
            if (rowA !== rowB) return rowA.localeCompare(rowB);
            return (a.seat?.seatNumber || 0) - (b.seat?.seatNumber || 0);
          });
          return mapped;
        }
      }
    } catch (err) {
      console.warn("[Show Seats Service] Supabase getShowSeats query failed:", err);
    }
  }

  // Fallback / Offline data
  return generateFallbackShowSeats(cleanId);
}

/**
 * Atomically locks selected seats for a show (10-minute hold)
 */
export async function lockShowSeats(
  showId: string,
  seatIds: string[],
  userId?: string
): Promise<SeatLockResult> {
  const cleanShowId = showId?.trim();
  if (!cleanShowId) {
    return { success: false, error: "Show ID is required." };
  }

  if (!seatIds || seatIds.length === 0) {
    return { success: false, error: "Please select at least one seat." };
  }

  if (seatIds.length > MAX_SEAT_SELECTION_LIMIT) {
    return {
      success: false,
      error: `You can select a maximum of ${MAX_SEAT_SELECTION_LIMIT} seats per booking.`,
    };
  }

  const callerUserId = userId || "demo-user-session";

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.rpc("lock_show_seats", {
          p_show_id: cleanShowId,
          p_seat_ids: seatIds,
          p_user_id: callerUserId,
        });

        if (error) {
          console.warn("[Show Seats Service] RPC lock_show_seats failed:", error.message);
          return {
            success: false,
            error: error.message.includes("SEATS_UNAVAILABLE")
              ? "One or more selected seats are no longer available. Please select another seat."
              : error.message.includes("LIMIT_EXCEEDED")
              ? `Maximum ${MAX_SEAT_SELECTION_LIMIT} seats allowed.`
              : error.message.includes("SHOW_PAST")
              ? "Cannot book tickets for a show that has already started."
              : "Unable to lock seats. Please try again.",
          };
        }

        const expiresAt = new Date(Date.now() + SEAT_LOCK_DURATION_SECONDS * 1000).toISOString();
        const lockedSeats: ShowSeat[] = (data || []).map((row: any) => ({
          id: `ss-${cleanShowId}-${row.seat_code}`,
          showId: cleanShowId,
          seatId: row.seat_id,
          status: "LOCKED",
          lockedBy: callerUserId,
          lockExpiresAt: row.lock_expires_at || expiresAt,
          seat: {
            id: row.seat_id,
            screenId: `${cleanShowId}-screen`,
            rowLabel: row.row_label,
            seatNumber: row.seat_number,
            seatCode: row.seat_code,
            tier: row.tier || "Standard",
            priceMultiplier: Number(row.price_multiplier || 1.0),
          },
        }));

        return {
          success: true,
          lockedSeats,
          expiresAt,
          expiresInSeconds: SEAT_LOCK_DURATION_SECONDS,
        };
      }
    } catch (err: any) {
      console.warn("[Show Seats Service] Supabase lockShowSeats execution error:", err);
    }
  }

  // In-Memory Fallback Atomic Locking Engine (for offline / unit tests)
  const now = Date.now();
  const expiresAtMs = now + SEAT_LOCK_DURATION_SECONDS * 1000;
  const expiresAt = new Date(expiresAtMs).toISOString();

  for (const sId of seatIds) {
    const key = getInMemKey(cleanShowId, sId);
    const existing = inMemLocks.get(key);

    if (existing) {
      if (existing.expiresAt > now && existing.lockedBy !== callerUserId) {
        return {
          success: false,
          error: "One or more selected seats are no longer available. Please select another seat.",
        };
      }
    }
  }

  const lockedSeats: ShowSeat[] = [];
  for (const sId of seatIds) {
    const key = getInMemKey(cleanShowId, sId);
    inMemLocks.set(key, {
      showId: cleanShowId,
      seatId: sId,
      lockedBy: callerUserId,
      expiresAt: expiresAtMs,
      status: "LOCKED",
    });

    const matchCode = sId.match(/([A-Z])(\d+)/);
    const rowLabel = matchCode ? matchCode[1] : "A";
    const seatNumber = matchCode ? parseInt(matchCode[2], 10) : 1;
    const tier = rowLabel === "A" ? "Recliner" : rowLabel === "B" ? "Premium" : "Standard";
    const multiplier = rowLabel === "A" ? 1.5 : rowLabel === "B" ? 1.2 : 1.0;

    lockedSeats.push({
      id: `ss-${cleanShowId}-${sId}`,
      showId: cleanShowId,
      seatId: sId,
      status: "LOCKED",
      lockedBy: callerUserId,
      lockExpiresAt: expiresAt,
      seat: {
        id: sId,
        screenId: `${cleanShowId}-screen`,
        rowLabel,
        seatNumber,
        seatCode: `${rowLabel}${seatNumber}`,
        tier,
        priceMultiplier: multiplier,
      },
    });
  }

  return {
    success: true,
    lockedSeats,
    expiresAt,
    expiresInSeconds: SEAT_LOCK_DURATION_SECONDS,
  };
}

/**
 * Releases seats locked by the current user
 */
export async function releaseShowSeats(
  showId: string,
  seatIds?: string[],
  userId?: string
): Promise<{ success: boolean; releasedCount: number }> {
  const cleanShowId = showId?.trim();
  if (!cleanShowId) return { success: false, releasedCount: 0 };

  const callerUserId = userId || "demo-user-session";

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.rpc("release_show_seats", {
          p_show_id: cleanShowId,
          p_seat_ids: seatIds && seatIds.length > 0 ? seatIds : null,
          p_user_id: callerUserId,
        });

        if (!error) {
          return { success: true, releasedCount: Number(data || 0) };
        }
      }
    } catch (err) {
      console.warn("[Show Seats Service] Supabase releaseShowSeats failed:", err);
    }
  }

  let releasedCount = 0;
  if (seatIds && seatIds.length > 0) {
    for (const sId of seatIds) {
      const key = getInMemKey(cleanShowId, sId);
      const existing = inMemLocks.get(key);
      if (existing && existing.lockedBy === callerUserId) {
        inMemLocks.delete(key);
        releasedCount++;
      }
    }
  } else {
    for (const [key, lock] of inMemLocks.entries()) {
      if (lock.showId === cleanShowId && lock.lockedBy === callerUserId) {
        inMemLocks.delete(key);
        releasedCount++;
      }
    }
  }

  return { success: true, releasedCount };
}

/**
 * Fetches all unexpired seats currently locked by the specified user
 */
export async function getCurrentUserLocks(
  showId: string,
  userId: string
): Promise<ShowSeat[]> {
  const seats = await getShowSeats(showId);
  return seats.filter(
    (s) =>
      s.status === "LOCKED" &&
      s.lockedBy === userId &&
      s.lockExpiresAt &&
      new Date(s.lockExpiresAt).getTime() > Date.now()
  );
}

/**
 * Reclaims expired seats
 */
export async function reclaimExpiredShowSeats(showId?: string): Promise<number> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.rpc("reclaim_expired_show_seats", {
          p_show_id: showId || null,
        });
        if (!error) {
          return Number(data || 0);
        }
      }
    } catch (err) {
      console.warn("[Show Seats Service] Supabase reclaimExpiredShowSeats failed:", err);
    }
  }

  let count = 0;
  const now = Date.now();
  for (const [key, lock] of inMemLocks.entries()) {
    if ((!showId || lock.showId === showId) && lock.expiresAt <= now) {
      inMemLocks.delete(key);
      count++;
    }
  }
  return count;
}
