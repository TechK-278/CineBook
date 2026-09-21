import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Star,
  Clock,
  Calendar,
  Film,
  MapPin,
  ChevronLeft,
  Ticket,
  Info,
  User,
  Clapperboard,
} from "lucide-react";
import { getMovieDetails } from "@/lib/tmdb/movies";
import { getShowsForMovie, getTodayDateIST } from "@/lib/supabase/shows";
import { ShowtimeButton } from "@/components/movies/ShowtimeButton";
import { DateSelector } from "@/components/discovery/DateSelector";
import { TrailerModal } from "@/components/movies/TrailerModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MovieDetailsPageProps {
  params: Promise<{
    movieId: string;
  }>;
  searchParams: Promise<{
    date?: string;
  }>;
}

export async function generateMetadata({
  params,
}: MovieDetailsPageProps): Promise<Metadata> {
  const { movieId } = await params;
  const movie = await getMovieDetails(movieId);

  if (!movie) {
    return {
      title: "Movie Not Found | CineBook",
      description: "Explore theatrical movies and cinema tickets on CineBook.",
    };
  }

  return {
    title: `${movie.title} (${movie.releaseYear}) — Tickets & Showtimes | CineBook`,
    description: movie.overview.slice(0, 160),
    openGraph: {
      title: `${movie.title} | CineBook`,
      description: movie.overview.slice(0, 160),
      images: movie.backdropPath ? [{ url: movie.backdropPath }] : [],
    },
  };
}

export default async function MovieDetailsPage({
  params,
  searchParams,
}: MovieDetailsPageProps) {
  const { movieId } = await params;
  const { date } = await searchParams;

  const targetDate = date || getTodayDateIST();
  const movie = await getMovieDetails(movieId);

  if (!movie) {
    notFound();
  }

  // Fetch real CineBook showtimes for this movie and selected date
  const movieShowGroups = await getShowsForMovie(movie.id || movie.tmdbId, targetDate);

  const hasShowtimes = movieShowGroups.length > 0;

  return (
    <div className="pb-20">
      {/* 1. Hero Backdrop Banner */}
      <div className="relative w-full bg-cinebook-dark border-b border-cinebook-border overflow-hidden min-h-[440px]">
        {/* Backdrop Image with gradient overlay */}
        <div className="absolute inset-0 z-0 opacity-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={movie.backdropPath || movie.posterPath}
            alt=""
            className="h-full w-full object-cover filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinebook-dark via-cinebook-dark/85 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/movies"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Movies
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster Card */}
            <div className="w-48 sm:w-64 shrink-0 overflow-hidden rounded-2xl border-2 border-cinebook-border shadow-2xl bg-cinebook-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={movie.posterPath}
                alt={`Poster of ${movie.title}`}
                className="h-auto w-full object-cover aspect-[2/3]"
              />
            </div>

            {/* Movie Metadata Info */}
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
                {movie.isUpcoming && (
                  <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-xs font-semibold">
                    Upcoming Release
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-xs sm:text-sm text-zinc-400 italic mt-1 font-medium">
                    &ldquo;{movie.tagline}&rdquo;
                  </p>
                )}
              </div>

              {/* Rating, Genres, Release Date */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300">
                <div className="flex items-center gap-1.5 rounded-lg bg-cinebook-surface/80 border border-cinebook-border px-3 py-1.5 font-semibold text-white">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{movie.rating} / 10</span>
                  {movie.voteCount > 0 && (
                    <span className="text-xs text-zinc-400 font-normal">
                      ({movie.voteCount.toLocaleString()} votes)
                    </span>
                  )}
                </div>
                <span>{movie.genres.join(" • ")}</span>
                <span>•</span>
                <span className="text-zinc-400">{movie.releaseDate}</span>
              </div>

              {/* Action Buttons: Trailer & Book */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {hasShowtimes && (
                  <a href="#showtimes">
                    <Button className="gap-2 text-xs sm:text-sm font-semibold shadow-lg">
                      <Ticket className="h-4 w-4" />
                      <span>Book Tickets</span>
                    </Button>
                  </a>
                )}
                {movie.trailerYoutubeId && (
                  <TrailerModal
                    trailerYoutubeId={movie.trailerYoutubeId}
                    movieTitle={movie.title}
                  />
                )}
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

              {/* Director & Top Cast */}
              <div className="pt-4 border-t border-cinebook-border/60">
                <div className="text-xs text-zinc-400 mb-2">
                  <strong className="text-white">Director:</strong> {movie.director}
                </div>

                {movie.cast && movie.cast.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                      Top Cast
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-2xl">
                      {movie.cast.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2.5 rounded-lg bg-cinebook-surface/60 border border-cinebook-border p-2"
                        >
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-800 border border-cinebook-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={member.image}
                              alt={member.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1 text-left">
                            <div className="text-xs font-semibold text-white truncate">
                              {member.name}
                            </div>
                            <div className="text-[11px] text-zinc-400 truncate">
                              {member.role}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
            Real CineBook multiplex screenings & auditorium schedules
          </p>
        </div>

        {/* Date Selector */}
        <DateSelector selectedDate={targetDate} />

        {hasShowtimes ? (
          /* Cinema Showtimes Listing */
          <div className="space-y-6">
            {movieShowGroups.map((group) => (
              <Card
                key={group.theatre.id}
                className="p-5 sm:p-6 border border-cinebook-border bg-cinebook-surface"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cinebook-border/80">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/cinemas/${group.theatre.slug || group.theatre.id}?date=${targetDate}`}
                        className="text-base sm:text-lg font-bold text-white hover:text-cinebook-accent transition-colors"
                      >
                        {group.theatre.name}
                      </Link>
                      <Badge variant="outline" className="text-[10px]">
                        {group.theatre.chain}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <MapPin className="h-3.5 w-3.5 text-cinebook-accent" />
                      <span>{group.theatre.area || group.theatre.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Info className="h-3.5 w-3.5" />
                    <span>Cancellation Available</span>
                  </div>
                </div>

                {/* Formats & Showtimes Grid for this cinema */}
                <div className="pt-4 space-y-3">
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
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State for TMDB movies that do not have CineBook showtimes yet */
          <div className="rounded-2xl border border-dashed border-cinebook-border bg-cinebook-surface/40 p-12 text-center">
            <Clapperboard className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">
              No CineBook Showtimes Currently Scheduled
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              Screenings for {movie.title} are not scheduled in CineBook multiplexes for the selected date. Please check back closer to release or browse active theatrical screenings.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/movies?category=now-showing">
                <Button variant="default" size="sm" className="text-xs">
                  Browse Now Showing Movies
                </Button>
              </Link>
              <Link href="/cinemas">
                <Button variant="outline" size="sm" className="text-xs">
                  Explore Multiplexes
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
