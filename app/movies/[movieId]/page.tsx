import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  Clock,
  Calendar,
  Shield,
  Film,
  MapPin,
  ChevronLeft,
  Ticket,
  Sparkles,
  Info,
} from "lucide-react";
import { getMovieById, MOVIES, CINEMAS, MOCK_DATES, MOCK_SHOWTIMES_SAMPLE } from "@/lib/mock-data";
import { ShowtimeButton } from "@/components/movies/ShowtimeButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MovieDetailsPageProps {
  params: Promise<{
    movieId: string;
  }>;
}

export async function generateStaticParams() {
  return MOVIES.map((movie) => ({
    movieId: movie.id,
  }));
}

export default async function MovieDetailsPage({ params }: MovieDetailsPageProps) {
  const { movieId } = await params;
  const movie = getMovieById(movieId);

  if (!movie) {
    notFound();
  }

  // Filter cinemas that have this movie playing (demo data)
  const availableCinemas = CINEMAS.filter((c) => c.cityId === "ahmedabad");

  return (
    <div className="pb-20">
      {/* 1. Backdrop Banner Header */}
      <div className="relative w-full bg-cinebook-dark border-b border-cinebook-border overflow-hidden">
        {/* Backdrop Image with gradient overlay */}
        <div className="absolute inset-0 z-0 opacity-25">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={movie.backdropPath || movie.posterPath}
            alt=""
            className="h-full w-full object-cover filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinebook-dark via-cinebook-dark/80 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/movies"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Movies
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster Card */}
            <div className="w-48 sm:w-60 shrink-0 overflow-hidden rounded-2xl border-2 border-cinebook-border shadow-2xl bg-cinebook-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={movie.posterPath}
                alt={`Poster of ${movie.title}`}
                className="h-auto w-full object-cover"
              />
            </div>

            {/* Movie Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent" className="font-bold">
                  {movie.certificate}
                </Badge>
                {movie.format?.map((fmt, i) => (
                  <span
                    key={i}
                    className="rounded bg-cinebook-surface px-2 py-0.5 text-xs font-semibold text-zinc-300 border border-cinebook-border"
                  >
                    {fmt}
                  </span>
                ))}
                <span className="text-xs text-zinc-400">
                  {movie.language} • {movie.durationMinutes} mins
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {movie.title}
              </h1>

              {/* Rating and Genre */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300">
                <div className="flex items-center gap-1.5 rounded-lg bg-cinebook-surface/80 border border-cinebook-border px-3 py-1.5 font-semibold text-white">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{movie.rating} / 10</span>
                  <span className="text-xs text-zinc-400 font-normal">(User Rating)</span>
                </div>
                <span>{movie.genres.join(" • ")}</span>
                <span>•</span>
                <span className="text-zinc-400">{movie.releaseDate}</span>
              </div>

              {/* Synopsis */}
              <div className="pt-2">
                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  About the Movie
                </h2>
                <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
                  {movie.overview}
                </p>
              </div>

              {/* Director & Cast */}
              <div className="pt-2 flex flex-wrap gap-6 text-xs border-t border-cinebook-border/60">
                <div>
                  <span className="text-zinc-500 block">Director</span>
                  <span className="font-semibold text-white">{movie.director}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Starring</span>
                  <span className="font-semibold text-white">
                    {movie.cast.map((c) => c.name).join(", ")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Cinema Showtimes Discovery Section */}
      <section id="showtimes" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Ticket className="h-6 w-6 text-cinebook-accent" />
            Available Cinemas & Showtimes in Ahmedabad
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Select a cinema and preferred showtime slot to proceed with booking
          </p>
        </div>

        {/* Date Selector Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-cinebook-border">
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

        {/* Cinema Showtimes Listing */}
        <div className="space-y-6">
          {availableCinemas.map((cinema) => (
            <Card key={cinema.id} className="p-5 sm:p-6 border border-cinebook-border bg-cinebook-surface">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cinebook-border/80">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/cinemas/${cinema.id}`}
                      className="text-base sm:text-lg font-bold text-white hover:text-cinebook-accent transition-colors"
                    >
                      {cinema.name}
                    </Link>
                    <Badge variant="outline" className="text-[10px]">
                      {cinema.chain}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <MapPin className="h-3.5 w-3.5 text-cinebook-accent" />
                    <span>{cinema.locationArea}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Info className="h-3.5 w-3.5" />
                  <span>Cancellation Available</span>
                </div>
              </div>

              {/* Showtimes Grid for this cinema */}
              <div className="pt-4">
                <div className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
                  Available Screenings
                </div>
                <div className="flex flex-wrap gap-3">
                  {MOCK_SHOWTIMES_SAMPLE.map((slot) => (
                    <ShowtimeButton key={slot.id} slot={slot} />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
