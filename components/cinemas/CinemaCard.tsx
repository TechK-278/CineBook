import React from "react";
import Link from "next/link";
import { MapPin, Film, Sparkles, ChevronRight, Star } from "lucide-react";
import { CinemaDetail } from "@/lib/mock-data/cinemas";
import { Theatre } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CinemaCardProps {
  cinema: Theatre | CinemaDetail;
  className?: string;
}

export function CinemaCard({ cinema, className }: CinemaCardProps) {
  const cinemaSlug = "slug" in cinema ? cinema.slug : cinema.id;
  const cinemaAddress = cinema.address || ("area" in cinema ? cinema.area : cinema.locationArea);
  const rating = "rating" in cinema && typeof cinema.rating === "number" ? cinema.rating : 4.6;
  const screenCount = cinema.screenCount || 6;
  const showCount = "showCount" in cinema && typeof cinema.showCount === "number" ? cinema.showCount : 24;
  const movieCount = "movieCount" in cinema && typeof cinema.movieCount === "number" ? cinema.movieCount : 6;
  const formats = cinema.formats || ["2D", "IMAX", "Dolby Atmos"];
  const amenities = cinema.amenities || [];

  return (
    <article
      className={cn(
        "flex flex-col justify-between rounded-xl border border-cinebook-border bg-cinebook-surface p-5 transition-all duration-200 hover:border-zinc-700 hover:shadow-xl",
        className
      )}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] text-zinc-400">
                {cinema.chain}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-yellow-400 font-semibold">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {rating}
              </div>
            </div>
            <Link
              href={`/cinemas/${cinemaSlug}`}
              className="text-base sm:text-lg font-bold text-white hover:text-cinebook-accent transition-colors block"
            >
              {cinema.name}
            </Link>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-semibold text-zinc-300 block">
              {screenCount} Screens
            </span>
            <span className="text-[11px] text-zinc-500">
              {showCount} Shows Daily
            </span>
          </div>
        </div>

        {/* Location & Address */}
        <div className="mt-2.5 flex items-start gap-1.5 text-xs text-zinc-400">
          <MapPin className="h-3.5 w-3.5 text-cinebook-accent shrink-0 mt-0.5" />
          <span className="line-clamp-2">{cinemaAddress}</span>
        </div>

        {/* Amenities & Formats */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {formats.slice(0, 3).map((fmt, i) => (
            <span
              key={i}
              className="rounded bg-cinebook-dark px-2 py-0.5 text-[10px] font-semibold text-zinc-300 border border-cinebook-border"
            >
              {fmt}
            </span>
          ))}
          {amenities.slice(0, 2).map((amenity, i) => (
            <span
              key={i}
              className="rounded bg-cinebook-surfaceHover px-2 py-0.5 text-[10px] text-zinc-400"
            >
              {amenity}
            </span>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-5 pt-3.5 border-t border-cinebook-border flex items-center justify-between">
        <span className="text-xs text-zinc-400">
          <strong className="text-white">{movieCount}</strong> Movies Playing
        </span>
        <Link href={`/cinemas/${cinemaSlug}`}>
          <Button size="sm" className="gap-1 text-xs">
            View Shows
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </article>
  );
}
