import React from "react";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getShowById } from "@/lib/supabase/shows";
import { getShowSeats, getCurrentUserLocks } from "@/lib/supabase/show-seats";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatShowtimeIST } from "@/lib/supabase/show-utils";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

interface CheckoutPageProps {
  params: Promise<{
    showId: string;
  }>;
  searchParams: Promise<{
    seats?: string;
  }>;
}

export async function generateMetadata({
  params,
}: CheckoutPageProps): Promise<Metadata> {
  const { showId } = await params;
  const show = await getShowById(showId);

  if (!show) {
    return {
      title: "Checkout | CineBook",
      description: "Secure ticket checkout on CineBook.",
    };
  }

  const timeStr = formatShowtimeIST(show.startTime);
  return {
    title: `Checkout — ${show.movie?.title || "Movie"} (${timeStr}) | CineBook`,
    description: `Complete payment for ${show.movie?.title} at ${show.theatre?.name}, Ahmedabad.`,
  };
}

export default async function CheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const { showId } = await params;
  const { seats: seatsQuery } = await searchParams;

  const show = await getShowById(showId);
  if (!show) {
    notFound();
  }

  // 1. Fetch current user from session
  let userId = "demo-customer";
  let initialCustomer = {
    name: "",
    email: "",
    phone: "",
  };

  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        userId = user.id;
        initialCustomer.email = user.email || "";
        initialCustomer.name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "";
        initialCustomer.phone =
          user.user_metadata?.phone || "";
      }
    }
  } catch {
    // Demo mode fallback
  }

  // 2. Fetch seats for the show
  const allShowSeats = await getShowSeats(showId);

  // 3. Resolve user's locked seats
  let userLocks = await getCurrentUserLocks(showId, userId);

  // If no user locks found by user ID (e.g. guest or URL query), check query matching
  if (userLocks.length === 0 && seatsQuery) {
    const requestedCodes = seatsQuery.split(",").map((s) => s.trim().toUpperCase());
    userLocks = allShowSeats.filter(
      (s) =>
        s.seat &&
        (requestedCodes.includes(s.seat.seatCode.toUpperCase()) ||
          requestedCodes.includes(s.seatId.toUpperCase()))
    );
  }

  // If still no seats, redirect back to seat selection
  if (userLocks.length === 0) {
    redirect(`/shows/${showId}/seats`);
  }

  return (
    <CheckoutClient
      show={show}
      lockedSeats={userLocks}
      initialCustomer={initialCustomer}
    />
  );
}
