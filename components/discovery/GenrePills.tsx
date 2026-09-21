import React from "react";
import Link from "next/link";
import { GENRES } from "@/lib/mock-data/genres";
import { cn } from "@/lib/utils";

interface GenrePillsProps {
  activeGenre?: string;
  className?: string;
}

export function GenrePills({ activeGenre, className }: GenrePillsProps) {
  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none", className)}>
      <Link
        href="/movies"
        className={cn(
          "shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all border",
          !activeGenre
            ? "bg-cinebook-accent text-white border-cinebook-accent shadow-sm"
            : "bg-cinebook-surface text-zinc-300 border-cinebook-border hover:border-zinc-600 hover:text-white"
        )}
      >
        All Genres
      </Link>
      {GENRES.map((genre) => {
        const isSelected = activeGenre?.toLowerCase() === genre.id.toLowerCase();
        return (
          <Link
            key={genre.id}
            href={`/movies?genre=${genre.id}`}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all border",
              isSelected
                ? "bg-cinebook-accent text-white border-cinebook-accent shadow-sm"
                : "bg-cinebook-surface text-zinc-300 border-cinebook-border hover:border-zinc-600 hover:text-white"
            )}
          >
            {genre.name}
          </Link>
        );
      })}
    </div>
  );
}
