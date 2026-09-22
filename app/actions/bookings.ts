"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserBookings, getBookingById } from "@/lib/supabase/bookings";
import { Booking } from "@/types";

/**
 * Server action to fetch current authenticated user's bookings
 */
export async function getUserBookingsAction(): Promise<Booking[]> {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return [];

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    return await getUserBookings(user.id);
  } catch (err) {
    console.warn("[Bookings Action] Failed to fetch user bookings:", err);
    return [];
  }
}

/**
 * Server action to fetch specific booking with strict authorization
 */
export async function getBookingDetailsAction(
  bookingIdOrRef: string
): Promise<Booking | null> {
  try {
    let userId: string | undefined = undefined;
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        }
      }
    } catch {
      // Ignored for demo
    }

    return await getBookingById(bookingIdOrRef, userId);
  } catch (err) {
    console.warn("[Bookings Action] Failed to fetch booking details:", err);
    return null;
  }
}
