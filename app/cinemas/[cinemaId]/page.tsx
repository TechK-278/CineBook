import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Film,
  Clapperboard,
  MapPin,
  Star,
  ChevronLeft,
  Ticket,
  Clock,
  Info,
} from "lucide-react";
import { getTheatreById } from "@/lib/supabase/theatres";
import { getShowsForTheatre, getTodayDateIST } from "@/lib/supabase/shows";
import { ShowtimeButton } from "@/components/movies/ShowtimeButton";
import { DateSelector } from "@/components/discovery/DateSelector";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CinemaDetailsPageProps {
  params: Promise<{
    cinemaId: string;
  }>;
  searchParams: Promise<{
    date?: string;
  }>;
}

export async function generateMetadata({
  params,
}: CinemaDetailsPageProps): Promise<Metadata> {
  const { cinemaId } = await params;
  const cinema = await getTheatreById(cinemaId);

  if (!cinema) {
    return {
      title: "Cinema Not Found | CineBook",
      description: "Explore multiplexes and movie tickets on CineBook Ahmedabad.",
    };
  }

  return {
    title: `${cinema.name} — Showtimes & Movie Tickets | CineBook Ahmedabad`,
    description: `Book movie tickets at ${cinema.name}, ${cinema.area}, Ahmedabad. Check IMAX, 4DX, Insignia, and Dolby Atmos showtimes.`,
  };
}

export default async function CinemaDetailsPage({
  params,
  searchParams,
}: CinemaDetailsPageProps) {
  const { cinemaId } = await params;
  const { date } = await searchParams;

  const targetDate = date || getTodayDateIST();
  const cinema = await getTheatreById(cinemaId);

  if (!cinema) {
    notFound();
  }

  const movieShowGroups = await getShowsForTheatre(cinema.id, targetDate);

  return (
    <div className="pb-20">
      {/* 1. Cinema Banner Header */}
      <div className="bg-cinebook-surface/70 border-b border-cinebook-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/cinemas"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Cinemas
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="accent" className="font-bold text-[10px]">
                  {cinema.chain}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-yellow-400 font-semibold">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  {(cinema as any).rating || 4.6} / 5
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {cinema.name}
              </h1>
              <div className="mt-1.5 flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                <MapPin className="h-4 w-4 text-cinebook-accent shrink-0" />
                <span>{cinema.address || cinema.location}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 self-start md:self-auto">
              {(cinema.amenities || []).map((amenity, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-cinebook-dark border border-cinebook-border px-2.5 py-1 text-xs text-zinc-300"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Date Selection & Movies Schedule */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Interactive Date Selector */}
        <DateSelector selectedDate={targetDate} />

        {/* Movies Playing List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Clapperboard className="h-5 w-5 text-cinebook-accent" />
              Scheduled Movies
            </h2>
            <span className="text-xs text-zinc-400">
              {movieShowGroups.length} Titles Screening
            </span>
          </div>

          {movieShowGroups.length > 0 ? (
            movieShowGroups.map((group) => (
              <Card
                key={group.movie.id}
                className="p-5 sm:p-6 border border-cinebook-border bg-cinebook-surface"
              >
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Poster Thumbnail */}
                  <Link
                    href={`/movies/${group.movie.id}`}
                    className="w-20 sm:w-24 shrink-0 aspect-[2/3] rounded-lg overflow-hidden border border-cinebook-border bg-cinebook-dark block hover:opacity-90 transition-opacity"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={group.movie.posterPath}
                      alt={`Poster of ${group.movie.title}`}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  {/* Movie Details & Showtimes */}
                  <div className="flex-1 w-full space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <Link
                          href={`/movies/${group.movie.id}`}
                          className="text-lg font-bold text-white hover:text-cinebook-accent transition-colors"
                        >
                          {group.movie.title}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                          <span className="font-semibold text-zinc-300">
                            {group.movie.certificate}
                          </span>
                          <span>•</span>
                          <span>{group.movie.language}</span>
                          <span>•</span>
                          <span>{group.movie.durationMinutes}m</span>
                          <span>•</span>
                          <span>{group.movie.genres.join(", ")}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-yellow-400 font-semibold">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        {group.movie.rating} / 10
                      </div>
                    </div>

                    {/* Formats & Showtime slots */}
                    <div className="pt-3 border-t border-cinebook-border/80 space-y-3">
                      {group.formats.map((fmtGroup, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-2">
                            <span className="rounded bg-cinebook-dark px-1.5 py-0.5 text-[10px] text-cinebook-accent border border-cinebook-border">
                              {fmtGroup.format}
                            </span>
                            <span>{fmtGroup.screenName}</span>
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                            {fmtGroup.slots.map((show) => (
                              <ShowtimeButton key={show.id} show={show} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-cinebook-border bg-cinebook-surface/40 p-16 text-center">
              <Ticket className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">
                No Showtimes Scheduled For This Date
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                No screenings are currently available at {cinema.name} for the selected date. Please choose another date or explore other multiplexes in Ahmedabad.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link href="/cinemas">
                  <Button variant="outline" size="sm" className="text-xs">
                    Browse Other Cinemas
                  </Button>
                </Link>
                <Link href="/movies">
                  <Button variant="default" size="sm" className="text-xs">
                    View All Movies
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
