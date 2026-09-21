import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Film,
  Clapperboard,
  MapPin,
  Star,
  ChevronLeft,
  Sparkles,
  Ticket,
  Clock,
  Info,
} from "lucide-react";
import { getCinemaById, CINEMAS, MOVIES, MOCK_DATES, MOCK_SHOWTIMES_SAMPLE } from "@/lib/mock-data";
import { ShowtimeButton } from "@/components/movies/ShowtimeButton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface CinemaDetailsPageProps {
  params: Promise<{
    cinemaId: string;
  }>;
}

export async function generateStaticParams() {
  return CINEMAS.map((cinema) => ({
    cinemaId: cinema.id,
  }));
}

export default async function CinemaDetailsPage({ params }: CinemaDetailsPageProps) {
  const { cinemaId } = await params;
  const cinema = getCinemaById(cinemaId);

  if (!cinema) {
    notFound();
  }

  // Movies playing at this cinema (demo subset)
  const moviesPlaying = MOVIES.slice(0, 5);

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
                  {cinema.rating} / 5
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {cinema.name}
              </h1>
              <div className="mt-1.5 flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                <MapPin className="h-4 w-4 text-cinebook-accent shrink-0" />
                <span>{cinema.address}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 self-start md:self-auto">
              {cinema.amenities.map((amenity, i) => (
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
        {/* Date Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-cinebook-border">
          {MOCK_DATES.map((dateObj, i) => (
            <button
              key={i}
              type="button"
              className={`flex flex-col items-center justify-center rounded-xl border px-4 py-2.5 min-w-[85px] transition-all ${
                i === 0
                  ? "bg-cinebook-accent text-white border-cinebook-accent shadow-md"
                  : "bg-cinebook-surface text-zinc-300 border-cinebook-border hover:border-zinc-600 hover:text-white"
              }`}
            >
              <span className="text-xs font-medium">{dateObj.day}</span>
              <span className="text-sm font-bold">{dateObj.date}</span>
            </button>
          ))}
        </div>

        {/* Movies Playing List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Clapperboard className="h-5 w-5 text-cinebook-accent" />
              Movies Playing Today
            </h2>
            <span className="text-xs text-zinc-400">{moviesPlaying.length} Movies Available</span>
          </div>

          {moviesPlaying.map((movie) => (
            <Card key={movie.id} className="p-5 sm:p-6 border border-cinebook-border bg-cinebook-surface">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {/* Poster Thumbnail */}
                <Link
                  href={`/movies/${movie.id}`}
                  className="w-20 sm:w-24 shrink-0 aspect-[2/3] rounded-lg overflow-hidden border border-cinebook-border bg-cinebook-dark block hover:opacity-90"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={movie.posterPath}
                    alt={`Poster of ${movie.title}`}
                    className="h-full w-full object-cover"
                  />
                </Link>

                {/* Movie Details & Showtimes */}
                <div className="flex-1 w-full space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <Link
                        href={`/movies/${movie.id}`}
                        className="text-lg font-bold text-white hover:text-cinebook-accent transition-colors"
                      >
                        {movie.title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span className="font-semibold text-zinc-300">{movie.certificate}</span>
                        <span>•</span>
                        <span>{movie.language}</span>
                        <span>•</span>
                        <span>{movie.durationMinutes}m</span>
                        <span>•</span>
                        <span>{movie.genres.join(", ")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-yellow-400 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      {movie.rating} / 10
                    </div>
                  </div>

                  {/* Showtimes slots */}
                  <div className="pt-2 border-t border-cinebook-border/80">
                    <div className="flex flex-wrap gap-3">
                      {MOCK_SHOWTIMES_SAMPLE.map((slot) => (
                        <ShowtimeButton key={slot.id} slot={slot} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
