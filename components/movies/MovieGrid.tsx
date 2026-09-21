import React from "react";
import { MovieDetail } from "@/lib/mock-data/movies";
import { MovieCard } from "./MovieCard";

interface MovieGridProps {
  movies: MovieDetail[];
}

export function MovieGrid({ movies }: MovieGridProps) {
  if (!movies || movies.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-cinebook-border bg-cinebook-surface/40 p-12 text-center">
        <p className="text-zinc-400 text-sm">No movies match the selected criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
