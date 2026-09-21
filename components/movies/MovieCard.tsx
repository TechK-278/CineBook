import React from "react";
import Link from "next/link";
import { Star, Ticket } from "lucide-react";
import { MovieDetail } from "@/lib/mock-data/movies";
import { CineMovie } from "@/lib/tmdb/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: CineMovie | MovieDetail;
  className?: string;
  showBookButton?: boolean;
}

export function MovieCard({
  movie,
  className,
  showBookButton = true,
}: MovieCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-cinebook-border bg-cinebook-surface transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl",
        className
      )}
    >
      {/* Poster Wrap (2:3 Aspect Ratio) */}
      <Link
        href={`/movies/${movie.id}`}
        className="aspect-[2/3] relative w-full overflow-hidden bg-cinebook-dark block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinebook-accent"
        aria-label={`View details for ${movie.title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={movie.posterPath}
          alt={`Poster of ${movie.title}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          <span className="rounded bg-cinebook-dark/90 px-1.5 py-0.5 text-[11px] font-bold text-white border border-cinebook-border backdrop-blur">
            {movie.certificate}
          </span>
          {movie.format && movie.format.length > 0 && (
            <span className="rounded bg-cinebook-accent/90 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur">
              {movie.format[0]}
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-cinebook-dark/90 px-2 py-1 text-xs font-semibold text-white border border-cinebook-border backdrop-blur">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span>{movie.rating}</span>
          <span className="text-[10px] text-zinc-400">/10</span>
        </div>
      </Link>

      {/* Details & CTA */}
      <div className="flex flex-1 flex-col justify-between p-3.5">
        <div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span className="font-medium text-zinc-300">{movie.language}</span>
            <span>{movie.durationMinutes}m</span>
          </div>

          <Link
            href={`/movies/${movie.id}`}
            className="font-bold text-white text-sm sm:text-base line-clamp-1 hover:text-cinebook-accent transition-colors block"
            title={movie.title}
          >
            {movie.title}
          </Link>

          <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
            {movie.genres.join(" • ")}
          </p>
        </div>

        {showBookButton && (
          <div className="mt-3 pt-2.5 border-t border-cinebook-border/80 flex items-center justify-between gap-2">
            <div className="text-xs text-zinc-300">
              From <span className="font-semibold text-white">₹{movie.basePrice}</span>
            </div>
            <Link href={`/movies/${movie.id}#showtimes`}>
              <Button size="sm" className="h-7 text-xs px-2.5 gap-1">
                <Ticket className="h-3 w-3" />
                Book Tickets
              </Button>
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
