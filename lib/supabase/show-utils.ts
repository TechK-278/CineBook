/**
 * CineBook v2 — Showtime Formatting, Date Utilities & Scheduling Validation
 * Safe for both Client Components and Server Components (no next/headers imports).
 */

import { Show } from "@/types";

/**
 * Formats an ISO date/time string to human-readable Indian Standard Time (IST) 12-hour format (e.g. "10:30 AM")
 */
export function formatShowtimeIST(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).toUpperCase();
  } catch {
    return "10:30 AM";
  }
}

/**
 * Returns today's date in YYYY-MM-DD format in Asia/Kolkata
 */
export function getTodayDateIST(): string {
  const now = new Date();
  const istString = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // Returns YYYY-MM-DD
  return istString;
}

/**
 * Validates a show schedule for conflicting times, invalid relations, or inverted time ranges
 */
export function validateShowSchedule(show: {
  screenId: string;
  theatreId: string;
  screenTheatreId?: string;
  startTime: string | Date;
  endTime: string | Date;
  date: string;
  existingShows?: Show[];
}): { isValid: boolean; error?: string } {
  const start = new Date(show.startTime);
  const end = new Date(show.endTime);

  // 1. Time range check
  if (end.getTime() <= start.getTime()) {
    return {
      isValid: false,
      error: "Invalid showtime: end_time must be strictly after start_time.",
    };
  }

  // 2. Minimum duration check (at least 30 minutes)
  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  if (durationMinutes < 30) {
    return {
      isValid: false,
      error: "Invalid showtime: screening duration must be at least 30 minutes.",
    };
  }

  // 3. Screen/Theatre relation check
  if (show.screenTheatreId && show.screenTheatreId !== show.theatreId) {
    return {
      isValid: false,
      error: `Relationship mismatch: screen belongs to theatre ${show.screenTheatreId}, not ${show.theatreId}.`,
    };
  }

  // 4. Overlap conflict check on the same screen
  if (show.existingShows && show.existingShows.length > 0) {
    for (const existing of show.existingShows) {
      if (existing.screenId === show.screenId && existing.status === "scheduled") {
        const exStart = new Date(existing.startTime).getTime();
        const exEnd = new Date(existing.endTime).getTime();
        const nStart = start.getTime();
        const nEnd = end.getTime();

        const overlaps =
          (nStart >= exStart && nStart < exEnd) ||
          (nEnd > exStart && nEnd <= exEnd) ||
          (nStart <= exStart && nEnd >= exEnd);

        if (overlaps) {
          return {
            isValid: false,
            error: `Schedule conflict: Screen already has show ${existing.id} from ${existing.startTime} to ${existing.endTime}.`,
          };
        }
      }
    }
  }

  return { isValid: true };
}
