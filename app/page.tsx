import React from "react";
import Link from "next/link";
import {
  Film,
  Clapperboard,
  MapPin,
  ChevronRight,
  Sparkles,
  Ticket,
  Tag,
  Star,
} from "lucide-react";
import {
  getRecommendedMovies,
  getNowShowingMovies,
  getUpcomingMovies,
  getCinemasByCity,
  OFFERS,
} from "@/lib/mock-data";
import { MovieCarousel } from "@/components/movies/MovieCarousel";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { CinemaCard } from "@/components/cinemas/CinemaCard";
import { SearchBar } from "@/components/discovery/SearchBar";
import { GenrePills } from "@/components/discovery/GenrePills";
import { LanguagePills } from "@/components/discovery/LanguagePills";
import { OffersCard } from "@/components/discovery/OffersCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const recommendedMovies = getRecommendedMovies();
  const nowShowingMovies = getNowShowingMovies().slice(0, 8);
  const upcomingMovies = getUpcomingMovies();
  const popularCinemas = getCinemasByCity("ahmedabad").slice(0, 4);

  return (
    <div className="flex flex-col gap-14 pb-20">
      {/* 1. Hero / Discovery Section */}
      <section className="relative border-b border-cinebook-border bg-gradient-to-b from-cinebook-surface via-cinebook-dark to-cinebook-dark px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center flex flex-col items-center">
          <Badge variant="accent" className="mb-4 gap-1.5 px-3 py-1 text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Location-Aware Cinema Marketplace
          </Badge>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            FIND YOUR NEXT <br />
            <span className="text-cinebook-accent">MOVIE NIGHT</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm sm:text-base text-zinc-400">
            Discover latest blockbusters, explore luxury IMAX screens, and book tickets across Ahmedabad.
          </p>

          {/* Hero Search Bar */}
          <div className="mt-8 w-full max-w-2xl">
            <SearchBar variant="hero" placeholder="Search movies, multiplexes, genres, languages..." />
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-400">
              <MapPin className="h-3.5 w-3.5 text-cinebook-accent" />
              <span>Showing cinema showtimes for <strong className="text-white">Ahmedabad</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Recommended Movies (Horizontal Carousel) */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              Recommended Movies
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Top-rated blockbusters screening now</p>
          </div>
          <Link
            href="/movies"
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-cinebook-accent hover:underline"
          >
            See All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <MovieCarousel movies={recommendedMovies} />
      </section>

      {/* 3. Movies Now Showing in Ahmedabad */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Clapperboard className="h-5 w-5 text-cinebook-accent" />
              Movies Now Showing in Ahmedabad
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Explore current theatrical screenings and formats</p>
          </div>
          <Link
            href="/movies"
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-cinebook-accent hover:underline"
          >
            See All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <MovieGrid movies={nowShowingMovies} />
      </section>

      {/* 4. Upcoming Releases */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-cinebook-border bg-cinebook-surface/60 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Ticket className="h-5 w-5 text-cinebook-accent" />
                Upcoming Blockbusters
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Advance booking and upcoming releases</p>
            </div>
            <Link href="/movies?category=upcoming">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                View All Upcoming <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <MovieGrid movies={upcomingMovies} />
        </div>
      </section>

      {/* 5. Browse by Genre */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Browse by Genre</h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Filter cinema experiences by your favorite themes</p>
        </div>
        <GenrePills />
      </section>

      {/* 6. Browse by Language */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Browse by Language</h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Explore movies available in your preferred language</p>
        </div>
        <LanguagePills />
      </section>

      {/* 7. Popular Cinemas in Ahmedabad */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Film className="h-5 w-5 text-cinebook-accent" />
              Popular Cinemas in Ahmedabad
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">IMAX, LUXE, 4DX & luxury auditoriums</p>
          </div>
          <Link
            href="/cinemas"
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-cinebook-accent hover:underline"
          >
            See All Cinemas <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {popularCinemas.map((cinema) => (
            <CinemaCard key={cinema.id} cinema={cinema} />
          ))}
        </div>
      </section>

      {/* 8. Offers & Promotions Preview */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Tag className="h-5 w-5 text-cinebook-accent" />
              Offers & Promo Codes
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Save with bank discounts and companion tickets</p>
          </div>
          <Link
            href="/offers"
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-cinebook-accent hover:underline"
          >
            All Offers <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OFFERS.map((offer) => (
            <OffersCard key={offer.id} offer={offer} />
          ))}
        </div>
      </section>
    </div>
  );
}
