import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getShowById } from "@/lib/supabase/shows";
import { getShowSeats, getCurrentUserLocks } from "@/lib/supabase/show-seats";
import { formatShowtimeIST } from "@/lib/supabase/show-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SeatSelectionClient } from "@/components/seats/SeatSelectionClient";

interface SeatSelectionPageProps {
  params: Promise<{
    showId: string;
  }>;
}

export async function generateMetadata({
  params,
}: SeatSelectionPageProps): Promise<Metadata> {
  const { showId } = await params;
  const show = await getShowById(showId);

  if (!show) {
    return {
      title: "Show Not Found | CineBook",
      description: "Select seats for your movie screening on CineBook.",
    };
  }

  const timeStr = formatShowtimeIST(show.startTime);
  return {
    title: `Select Seats — ${show.movie?.title || "Movie"} (${timeStr}) | CineBook`,
    description: `Interactive real-time seat selection for ${show.movie?.title} at ${show.theatre?.name}, Ahmedabad.`,
  };
}

export default async function SeatSelectionPage({ params }: SeatSelectionPageProps) {
  const { showId } = await params;
  const show = await getShowById(showId);

  if (!show) {
    notFound();
  }

  // Fetch show seats
  const seats = await getShowSeats(showId);

  // Determine current user ID if logged in
  let currentUserId = "guest-session";
  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        currentUserId = user.id;
      }
    }
  } catch (err) {
    console.warn("[Seat Selection Page] Could not retrieve session user:", err);
  }

  const userLocks = await getCurrentUserLocks(showId, currentUserId);

  return (
    <SeatSelectionClient
      show={show}
      initialSeats={seats}
      initialUserLocks={userLocks}
      currentUserId={currentUserId}
    />
  );
}
