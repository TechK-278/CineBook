import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Film,
  MapPin,
  Clock,
  Calendar,
  Ticket,
  ChevronLeft,
  Shield,
  Sparkles,
  Info,
  Armchair,
} from "lucide-react";
import { getShowById, formatShowtimeIST } from "@/lib/supabase/shows";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

interface ShowDetailsPageProps {
  params: Promise<{
    showId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ShowDetailsPageProps): Promise<Metadata> {
  const { showId } = await params;
  const show = await getShowById(showId);

  if (!show) {
    return {
      title: "Show Not Found | CineBook",
      description: "Screening details on CineBook.",
    };
  }

  const timeStr = formatShowtimeIST(show.startTime);
  return {
    title: `${show.movie?.title || "Movie"} — ${timeStr} at ${show.theatre?.name || "Cinema"} | CineBook`,
    description: `Book tickets for ${show.movie?.title} (${show.format}) at ${show.theatre?.name}, Ahmedabad.`,
  };
}

export default async function ShowDetailsPage({ params }: ShowDetailsPageProps) {
  const { showId } = await params;
  const show = await getShowById(showId);

  if (!show) {
    notFound();
  }

  const formattedTime = formatShowtimeIST(show.startTime);
  const movie = show.movie;
  const theatre = show.theatre;
  const screen = show.screen;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Navigation Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={movie ? `/movies/${movie.id}` : "/movies"}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Movie Details
        </Link>
        <Badge variant="outline" className="text-xs">
          Show Reference: {show.id.slice(0, 8)}
        </Badge>
      </div>

      <Card className="border-cinebook-border bg-cinebook-surface/90 shadow-2xl backdrop-blur overflow-hidden">
        {/* Header Summary */}
        <div className="bg-gradient-to-r from-cinebook-dark via-cinebook-surface to-cinebook-dark p-6 sm:p-8 border-b border-cinebook-border">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {movie && (
              <div className="w-28 sm:w-36 shrink-0 aspect-[2/3] rounded-xl overflow-hidden border border-cinebook-border shadow-lg bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={movie.posterPath}
                  alt={movie.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent" className="font-bold text-[10px]">
                  {show.format}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {show.language}
                </Badge>
                {movie && (
                  <span className="text-xs font-semibold text-zinc-300">
                    {movie.certificate}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {movie?.title || "Scheduled Feature"}
              </h1>

              <div className="text-sm text-zinc-300 font-medium">
                {theatre?.name || "CineBook Multiplex"}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <MapPin className="h-3.5 w-3.5 text-cinebook-accent" />
                <span>{theatre?.address || theatre?.location || "Ahmedabad, Gujarat"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Screening Specification Breakdown */}
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-cinebook-dark p-3.5 border border-cinebook-border">
              <span className="text-[11px] text-zinc-500 block">Date</span>
              <span className="text-sm font-bold text-white mt-0.5 block flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-cinebook-accent" />
                {show.date}
              </span>
            </div>

            <div className="rounded-xl bg-cinebook-dark p-3.5 border border-cinebook-border">
              <span className="text-[11px] text-zinc-500 block">Showtime</span>
              <span className="text-sm font-bold text-white mt-0.5 block flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-cinebook-accent" />
                {formattedTime}
              </span>
            </div>

            <div className="rounded-xl bg-cinebook-dark p-3.5 border border-cinebook-border">
              <span className="text-[11px] text-zinc-500 block">Auditorium</span>
              <span className="text-sm font-bold text-white mt-0.5 block truncate">
                {screen?.name || "Screen 1"}
              </span>
            </div>

            <div className="rounded-xl bg-cinebook-dark p-3.5 border border-cinebook-border">
              <span className="text-[11px] text-zinc-500 block">Ticket Base Price</span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                ₹{show.basePrice}
              </span>
            </div>
          </div>

          {/* Phase 5 Callout */}
          <div className="rounded-2xl border border-cinebook-accent/40 bg-cinebook-accent/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Armchair className="h-4 w-4 text-cinebook-accent" />
                Interactive Seat Selection
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-lg">
                Auditorium seat-map selection, tier selection (Recliner, Premium, Standard), and real-time seat locking are coming in <strong>Phase 5</strong>.
              </p>
            </div>

            <Button
              size="sm"
              className="gap-1.5 font-semibold text-xs shrink-0 cursor-default opacity-90 shadow-md"
            >
              <Ticket className="h-3.5 w-3.5" />
              Select Seats (Phase 5)
            </Button>
          </div>

          {/* Amenities and Cancellation info */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 pt-2 border-t border-cinebook-border">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-cinebook-accent" />
              <span>Verified CineBook Multiplex Partner</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Info className="h-4 w-4 text-zinc-500" />
              <span>Free cancellation up to 20 minutes before showtime</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
