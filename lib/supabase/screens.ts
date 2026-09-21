/**
 * CineBook v2 — Supabase Screens & Seats Data Access Layer
 */

import { createServerSupabaseClient } from "./server";
import { isSupabaseConfigured } from "./status";
import { Screen, Seat } from "@/types";

/**
 * Maps database screen row to Screen domain model
 */
function mapDbRowToScreen(row: any): Screen {
  return {
    id: row.id,
    theatreId: row.theatre_id,
    name: row.name,
    screenNumber: row.screen_number || 1,
    screenType: row.screen_type || "Standard",
    format: row.format || "2D",
    totalSeats: row.total_seats || 36,
    capacity: row.capacity || row.total_seats || 36,
    isActive: row.is_active !== undefined ? row.is_active : true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Maps database seat row to Seat domain model
 */
function mapDbRowToSeat(row: any): Seat {
  return {
    id: row.id,
    screenId: row.screen_id,
    rowLabel: row.row_label,
    seatNumber: row.seat_number,
    seatCode: row.seat_code,
    tier: row.tier || "Standard",
    priceMultiplier: Number(row.price_multiplier || 1.0),
    position: row.position || 1,
    isActive: row.is_active !== undefined ? row.is_active : true,
  };
}

/**
 * Fetch all active screens for a theatre
 */
export async function getScreensForTheatre(theatreId: string): Promise<Screen[]> {
  if (!theatreId) return [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("screens")
          .select("*")
          .eq("theatre_id", theatreId)
          .eq("is_active", true)
          .order("screen_number", { ascending: true });

        if (!error && data) {
          return data.map(mapDbRowToScreen);
        }
      }
    } catch (err) {
      console.warn("[Screens Service] Supabase getScreensForTheatre failed:", err);
    }
  }

  // Fallback demo screens
  return [
    {
      id: `${theatreId}-screen-1`,
      theatreId,
      name: "Screen 1 (Audi 1)",
      screenNumber: 1,
      screenType: "IMAX",
      format: "IMAX 2D",
      totalSeats: 36,
      capacity: 36,
      isActive: true,
    },
    {
      id: `${theatreId}-screen-2`,
      theatreId,
      name: "Screen 2 (Audi 2)",
      screenNumber: 2,
      screenType: "Dolby Atmos",
      format: "2D",
      totalSeats: 36,
      capacity: 36,
      isActive: true,
    },
  ];
}

/**
 * Fetch screen with associated seats
 */
export async function getScreenWithSeats(screenId: string): Promise<{
  screen: Screen | null;
  seats: Seat[];
}> {
  if (!screenId) return { screen: null, seats: [] };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const [screenRes, seatsRes] = await Promise.all([
          supabase.from("screens").select("*").eq("id", screenId).maybeSingle(),
          supabase
            .from("seats")
            .select("*")
            .eq("screen_id", screenId)
            .eq("is_active", true)
            .order("row_label", { ascending: true })
            .order("seat_number", { ascending: true }),
        ]);

        if (!screenRes.error && screenRes.data) {
          const screen = mapDbRowToScreen(screenRes.data);
          const seats = (seatsRes.data || []).map(mapDbRowToSeat);
          return { screen, seats };
        }
      }
    } catch (err) {
      console.warn("[Screens Service] Supabase getScreenWithSeats failed:", err);
    }
  }

  // Fallback demo seats (3 rows x 12 seats)
  const rows = ["A", "B", "C"];
  const seats: Seat[] = [];
  rows.forEach((rowLabel, rIdx) => {
    const tier = rIdx === 0 ? "Recliner" : rIdx === 1 ? "Premium" : "Standard";
    const multiplier = rIdx === 0 ? 1.5 : rIdx === 1 ? 1.2 : 1.0;
    for (let s = 1; s <= 12; s++) {
      seats.push({
        id: `${screenId}-${rowLabel}${s}`,
        screenId,
        rowLabel,
        seatNumber: s,
        seatCode: `${rowLabel}${s}`,
        tier,
        priceMultiplier: multiplier,
        position: s,
        isActive: true,
      });
    }
  });

  return {
    screen: {
      id: screenId,
      theatreId: "demo-theatre",
      name: "Audi 1",
      screenNumber: 1,
      screenType: "Standard",
      format: "2D",
      totalSeats: 36,
      capacity: 36,
      isActive: true,
    },
    seats,
  };
}
