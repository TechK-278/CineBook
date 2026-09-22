import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Ticket,
  Clapperboard,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserBookings } from "@/lib/supabase/bookings";
import { formatCurrency } from "@/lib/pricing";
import { formatShowtimeIST } from "@/lib/supabase/show-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

import { Booking, BookingItem } from "@/types";

export const metadata: Metadata = {
  title: "My Bookings & Tickets | CineBook",
  description: "View your active movie tickets, reservation history, and showtime passes on CineBook.",
};

export default async function BookingsPage() {
  let user = null;
  let bookings: Booking[] = [];

  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      user = authUser;

      if (user) {
        bookings = await getUserBookings(user.id);
      }
    }
  } catch (err) {
    console.warn("[Bookings Page] Failed to load session user:", err);
  }

  // If Supabase not configured in demo mode, allow fallback bookings
  if (!user && bookings.length === 0) {
    bookings = await getUserBookings("demo-customer");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 pb-24 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cinebook-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Ticket className="h-7 w-7 text-cinebook-accent" />
            My Movie Passes & Bookings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Confirmed movie reservations, seat allocations, and payment receipts
          </p>
        </div>

        <Link href="/movies">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Clapperboard className="h-4 w-4" />
            Book More Movies
          </Button>
        </Link>
      </div>

      {bookings.length > 0 ? (
        /* Real Bookings List */
        <div className="space-y-4">
          {bookings.map((booking) => {
            const showTime = booking.show?.startTime
              ? formatShowtimeIST(booking.show.startTime)
              : "Showtime";
            const isConfirmed = booking.status === "confirmed";

            return (
              <Card
                key={booking.id}
                className="overflow-hidden border-cinebook-border bg-cinebook-surface/80 hover:border-zinc-700 transition-all duration-200 shadow-lg backdrop-blur"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-cinebook-border/60 bg-gradient-to-r from-cinebook-dark via-cinebook-surface to-cinebook-dark">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent" className="font-mono text-xs">
                      {booking.bookingReference}
                    </Badge>
                    <Badge
                      variant={isConfirmed ? "outline" : "secondary"}
                      className={`text-xs capitalize ${
                        isConfirmed ? "text-emerald-400 border-emerald-500/40" : "text-amber-400"
                      }`}
                    >
                      {isConfirmed ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Confirmed
                        </span>
                      ) : (
                        booking.status
                      )}
                    </Badge>
                  </div>

                  <span className="text-xs text-zinc-400">
                    Booked on{" "}
                    {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {booking.show?.movie?.posterPath && (
                      <div className="w-20 sm:w-24 shrink-0 aspect-[2/3] rounded-xl overflow-hidden border border-cinebook-border shadow-md bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={booking.show.movie.posterPath}
                          alt={booking.show.movie.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">
                            {booking.show?.format || "2D"}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {booking.show?.language || "English"}
                          </Badge>
                          {booking.show?.movie?.certificate && (
                            <span className="text-xs font-semibold text-zinc-400">
                              {booking.show.movie.certificate}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-white">
                          {booking.show?.movie?.title || "Movie Screening"}
                        </h3>

                        <div className="text-xs text-zinc-300 font-medium mt-0.5">
                          {booking.show?.theatre?.name || "CineBook Multiplex"} —{" "}
                          {booking.show?.screen?.name || "Audi 1"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-cinebook-dark/60 p-3 rounded-xl border border-cinebook-border/60">
                        <div>
                          <span className="text-[10px] text-zinc-500 block">Date</span>
                          <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3 text-cinebook-accent" />
                            {booking.show?.date || "Today"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block">Time</span>
                          <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3 text-cinebook-accent" />
                            {showTime}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block">Seats</span>
                          <span className="font-bold text-cinebook-accent block mt-0.5 truncate">
                            {booking.items && booking.items.length > 0
                              ? booking.items.map((i: BookingItem) => i.seatCode).join(", ")
                              : `${booking.ticketCount} Seats`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block">Paid Amount</span>
                          <span className="font-bold text-emerald-400 block mt-0.5">
                            {formatCurrency(booking.grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto shrink-0 self-end sm:self-center">
                      <Link href={`/bookings/${booking.id}`}>
                        <Button className="w-full sm:w-auto gap-1.5 text-xs font-bold shadow-md">
                          View Pass Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : user ? (
        /* Empty State */
        <Card className="p-12 text-center border-dashed border-cinebook-border bg-cinebook-surface/50 max-w-2xl mx-auto space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cinebook-dark border border-cinebook-border text-cinebook-accent">
            <Ticket className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl font-bold text-white">
            No Active Bookings Yet
          </CardTitle>
          <CardDescription className="max-w-md mx-auto text-xs sm:text-sm text-zinc-400 leading-relaxed">
            You haven&apos;t reserved any movie passes yet. Explore the latest blockbusters screening in Ahmedabad and reserve your luxury seats!
          </CardDescription>
          <div className="pt-2">
            <Link href="/movies">
              <Button className="gap-2 text-xs sm:text-sm px-6 font-bold shadow-lg">
                <Clapperboard className="h-4 w-4" />
                Browse Now Showing Movies
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Sign-in Prompt */
        <Card className="p-12 text-center border-cinebook-border bg-cinebook-surface/70 max-w-md mx-auto space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cinebook-dark border border-cinebook-border text-cinebook-accent">
            <User className="h-7 w-7" />
          </div>
          <CardTitle className="text-lg font-bold text-white">
            Sign In to View Your Passes
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Your reservations and movie tickets are tied to your CineBook account. Sign in to access your passes.
          </CardDescription>
          <div className="pt-2">
            <Link href="/auth/login?next=/bookings">
              <Button className="w-full gap-2 text-xs sm:text-sm font-bold shadow-md">
                Sign In to Your Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
