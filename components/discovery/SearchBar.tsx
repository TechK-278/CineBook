"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Film, MapPin, Loader2 } from "lucide-react";
import { CinemaDetail } from "@/lib/mock-data/cinemas";
import { CineMovie } from "@/lib/tmdb/types";
import { searchEntities } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  variant?: "header" | "hero";
}

interface SearchResultsState {
  movies: CineMovie[];
  cinemas: CinemaDetail[];
}

export function SearchBar({
  className,
  placeholder = "Search movies, cinemas, genres...",
  variant = "header",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResultsState>({ movies: [], cinemas: [] });
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ movies: [], cinemas: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Cancel any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/movies/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setResults({
            movies: data.movies || [],
            cinemas: data.cinemas || [],
          });
        } else {
          // Fallback to local synchronous search
          const local = searchEntities(trimmed);
          setResults({
            movies: (local.movies as any[]) || [],
            cinemas: local.cinemas || [],
          });
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          const local = searchEntities(trimmed);
          setResults({
            movies: (local.movies as any[]) || [],
            cinemas: local.cinemas || [],
          });
        }
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelectMovie = (id: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/movies/${id}`);
  };

  const handleSelectCinema = (id: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/cinemas/${id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/movies?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const hasResults = results.movies.length > 0 || results.cinemas.length > 0;

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <label htmlFor={`search-input-${variant}`} className="sr-only">
          Search movies, cinemas, genres
        </label>
        <div className="relative flex items-center">
          {isLoading ? (
            <Loader2
              className={cn(
                "absolute left-3.5 text-cinebook-accent animate-spin pointer-events-none",
                variant === "hero" ? "h-5 w-5" : "h-4 w-4"
              )}
              aria-hidden="true"
            />
          ) : (
            <Search
              className={cn(
                "absolute left-3.5 text-zinc-400 pointer-events-none",
                variant === "hero" ? "h-5 w-5" : "h-4 w-4"
              )}
              aria-hidden="true"
            />
          )}
          <input
            id={`search-input-${variant}`}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className={cn(
              "w-full rounded-xl border border-cinebook-border bg-cinebook-surface/90 text-white placeholder-zinc-500 transition-all focus:border-cinebook-accent focus:bg-cinebook-dark focus:outline-none focus:ring-1 focus:ring-cinebook-accent",
              variant === "hero"
                ? "h-12 pl-11 pr-10 text-base shadow-xl"
                : "h-9 pl-9 pr-8 text-xs sm:text-sm"
            )}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="absolute right-2.5 p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute left-0 top-full mt-2 w-full rounded-xl border border-cinebook-border bg-cinebook-surface p-2 shadow-2xl z-50 max-h-96 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-150">
          {isLoading && !hasResults ? (
            <div className="py-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin text-cinebook-accent" />
              <span>Searching live movie catalogue...</span>
            </div>
          ) : hasResults ? (
            <div className="space-y-3 p-1">
              {/* Matched Movies */}
              {results.movies.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <Film className="h-3.5 w-3.5 text-cinebook-accent" />
                    Live Movies
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.movies.slice(0, 5).map((movie) => (
                      <button
                        key={movie.id}
                        type="button"
                        onClick={() => handleSelectMovie(movie.id)}
                        className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-cinebook-surfaceHover transition-colors group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={movie.posterPath}
                          alt=""
                          className="h-10 w-7 rounded object-cover border border-cinebook-border shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white group-hover:text-cinebook-accent transition-colors truncate">
                            {movie.title}
                          </div>
                          <div className="text-xs text-zinc-400 flex items-center gap-2">
                            <span>{movie.language}</span>
                            <span>•</span>
                            <span>{movie.genres.slice(0, 2).join(", ")}</span>
                            <span>•</span>
                            <span className="text-yellow-400 font-medium">★ {movie.rating}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Cinemas */}
              {results.cinemas.length > 0 && (
                <div className={results.movies.length > 0 ? "pt-2 border-t border-cinebook-border" : ""}>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <MapPin className="h-3.5 w-3.5 text-cinebook-accent" />
                    CineBook Multiplexes
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.cinemas.slice(0, 3).map((cinema) => (
                      <button
                        key={cinema.id}
                        type="button"
                        onClick={() => handleSelectCinema(cinema.id)}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left hover:bg-cinebook-surfaceHover transition-colors group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-cinebook-accent transition-colors">
                            {cinema.name}
                          </div>
                          <div className="text-xs text-zinc-400">{cinema.locationArea}</div>
                        </div>
                        <span className="text-xs text-zinc-500">{cinema.screenCount} Screens</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-xs sm:text-sm text-zinc-400">
              No movies or cinemas found matching &quot;<span className="text-white font-medium">{query}</span>&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
