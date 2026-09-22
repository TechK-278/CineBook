"use server";

import {
  lockShowSeats,
  releaseShowSeats,
  getShowSeats,
  getCurrentUserLocks,
} from "@/lib/supabase/show-seats";
import { SeatLockResult, ShowSeat } from "@/types";

/**
 * Server action to lock seats atomically
 */
export async function lockSeatsAction(
  showId: string,
  seatIds: string[],
  userId?: string
): Promise<SeatLockResult> {
  return await lockShowSeats(showId, seatIds, userId);
}

/**
 * Server action to release locked seats
 */
export async function releaseSeatsAction(
  showId: string,
  seatIds?: string[],
  userId?: string
): Promise<{ success: boolean; releasedCount: number }> {
  return await releaseShowSeats(showId, seatIds, userId);
}

/**
 * Server action to fetch fresh show seat inventory
 */
export async function getShowSeatsAction(showId: string): Promise<ShowSeat[]> {
  return await getShowSeats(showId);
}

/**
 * Server action to fetch active user locks
 */
export async function getUserLocksAction(
  showId: string,
  userId: string
): Promise<ShowSeat[]> {
  return await getCurrentUserLocks(showId, userId);
}
