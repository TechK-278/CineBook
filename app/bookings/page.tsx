"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Ticket, Clapperboard, Calendar, Clock, ArrowRight, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/status";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export default function BookingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsAuthenticated(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setIsAuthenticated(false);
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(Boolean(user));
    });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cinebook-border pb-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Ticket className="h-7 w-7 text-cinebook-accent" />
            My Reservations & Passes
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            View active movie tickets, showtime passes, and booking history
          </p>
        </div>
      </div>

      {isAuthenticated === null ? (
        <div className="py-16 text-center text-zinc-400 text-sm">
          Checking your reservations...
        </div>
      ) : isAuthenticated ? (
        /* Authenticated User: Empty Bookings State */
        <Card className="p-12 text-center border-dashed border-cinebook-border bg-cinebook-surface/50 max-w-2xl mx-auto">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cinebook-dark border border-cinebook-border text-cinebook-accent mb-4">
            <Ticket className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl font-bold text-white mb-2">
            No Active Bookings Yet
          </CardTitle>
          <CardDescription className="max-w-md mx-auto text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
            You haven&apos;t booked any movie tickets yet. Explore movies screening in Ahmedabad and reserve your favorite seats!
          </CardDescription>
          <Link href="/movies">
            <Button className="gap-2 text-xs sm:text-sm px-5">
              <Clapperboard className="h-4 w-4" />
              Explore Now Showing Movies
            </Button>
          </Link>
        </Card>
      ) : (
        /* Unauthenticated User Prompt */
        <Card className="p-12 text-center border-cinebook-border bg-cinebook-surface/70 max-w-md mx-auto">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cinebook-dark border border-cinebook-border text-cinebook-accent mb-4">
            <User className="h-7 w-7" />
          </div>
          <CardTitle className="text-lg font-bold text-white mb-2">
            Sign In to View Bookings
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
            Your movie passes and ticket history are linked to your CineBook account. Please sign in to access them.
          </CardDescription>
          <Link href="/auth/login?next=/bookings">
            <Button className="w-full gap-2 text-xs sm:text-sm">
              Sign In to Your Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
