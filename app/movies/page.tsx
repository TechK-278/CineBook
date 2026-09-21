import React, { Suspense } from "react";
import {
  getNowPlayingMovies,
  getUpcomingMovies,
  getPopularMovies,
} from "@/lib/tmdb/movies";
import { CineMovie } from "@/lib/tmdb/types";
import { MoviesCatalogueClient } from "@/components/movies/MoviesCatalogueClient";

export const revalidate = 3600; // 1 hour revalidation

export default async function MoviesPage() {
  // Fetch live movie data from TMDB
  const [nowPlaying, upcoming, popular] = await Promise.all([
    getNowPlayingMovies(),
    getUpcomingMovies(),
    getPopularMovies(),
  ]);

  // Merge uniquely by tmdbId or id
  const seenIds = new Set<string>();
  const allMovies: CineMovie[] = [];

  [...nowPlaying, ...popular, ...upcoming].forEach((movie) => {
    const key = movie.tmdbId ? String(movie.tmdbId) : movie.id;
    if (!seenIds.has(key)) {
      seenIds.add(key);
      allMovies.push(movie);
    }
  });

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-zinc-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cinebook-accent border-r-transparent mb-4" />
          <p className="text-sm">Loading live movie catalogue...</p>
        </div>
      }
    >
      <MoviesCatalogueClient initialMovies={allMovies} />
    </Suspense>
  );
}
