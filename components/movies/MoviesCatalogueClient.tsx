"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Clapperboard, X, ArrowUpDown, Search, Filter } from "lucide-react";
import { CineMovie } from "@/lib/tmdb/types";
import { GENRES } from "@/lib/mock-data/genres";
import { LANGUAGES } from "@/lib/mock-data/languages";
import { MovieCard } from "./MovieCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MoviesCatalogueClientProps {
  initialMovies: CineMovie[];
}

export function MoviesCatalogueClient({ initialMovies }: MoviesCatalogueClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlSearch = searchParams.get("search") || "";
  const urlGenre = searchParams.get("genre") || "";
  const urlLanguage = searchParams.get("language") || "";
  const urlCategory = searchParams.get("category") || "all";

  const [search, setSearch] = useState(urlSearch);
  const [selectedGenre, setSelectedGenre] = useState(urlGenre);
  const [selectedLanguage, setSelectedLanguage] = useState(urlLanguage);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [sortBy, setSortBy] = useState<"popularity" | "rating" | "newest" | "title">("popularity");

  // Derive unique genres present in dataset
  const availableGenres = useMemo(() => {
    const genreSet = new Set<string>();
    GENRES.forEach((g) => genreSet.add(g.name));
    initialMovies.forEach((m) => {
      m.genres.forEach((g) => genreSet.add(g));
    });
    return Array.from(genreSet).sort();
  }, [initialMovies]);

  // Derive unique languages present in dataset
  const availableLanguages = useMemo(() => {
    const langSet = new Set<string>();
    LANGUAGES.forEach((l) => langSet.add(l.name));
    initialMovies.forEach((m) => {
      if (m.language) langSet.add(m.language);
    });
    return Array.from(langSet).sort();
  }, [initialMovies]);

  // Filtering & Sorting
  const filteredMovies = useMemo(() => {
    let list = [...initialMovies];

    // 1. Text Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q)) ||
          m.language.toLowerCase().includes(q)
      );
    }

    // 2. Genre Filter
    if (selectedGenre) {
      list = list.filter((m) =>
        m.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
      );
    }

    // 3. Language Filter
    if (selectedLanguage) {
      list = list.filter(
        (m) => m.language.toLowerCase() === selectedLanguage.toLowerCase()
      );
    }

    // 4. Category Filter (now-showing / upcoming)
    if (selectedCategory === "now-showing") {
      list = list.filter((m) => m.isNowShowing);
    } else if (selectedCategory === "upcoming") {
      list = list.filter((m) => m.isUpcoming);
    }

    // 5. Sorting
    switch (sortBy) {
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
      case "title":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "popularity":
      default:
        list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0) || b.rating - a.rating);
        break;
    }

    return list;
  }, [initialMovies, search, selectedGenre, selectedLanguage, selectedCategory, sortBy]);

  const hasActiveFilters = Boolean(
    search || selectedGenre || selectedLanguage || selectedCategory !== "all"
  );

  const handleClearAll = () => {
    setSearch("");
    setSelectedGenre("");
    setSelectedLanguage("");
    setSelectedCategory("all");
    router.push("/movies");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cinebook-border mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Clapperboard className="h-7 w-7 text-cinebook-accent" />
            Explore Movies in Ahmedabad
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Live theatrical releases, advance bookings, and regional cinema
          </p>
        </div>

        {/* Category Toggle Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl bg-cinebook-surface p-1 border border-cinebook-border self-start md:self-auto">
          {[
            { id: "all", label: "All Movies" },
            { id: "now-showing", label: "Now Showing" },
            { id: "upcoming", label: "Upcoming" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                selectedCategory === tab.id
                  ? "bg-cinebook-accent text-white shadow"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
        {/* Genre Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedGenre("")}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors border",
              !selectedGenre
                ? "bg-cinebook-accent text-white border-cinebook-accent"
                : "bg-cinebook-surface text-zinc-300 border-cinebook-border hover:border-zinc-600"
            )}
          >
            All Genres
          </button>
          {availableGenres.slice(0, 10).map((genreName) => (
            <button
              key={genreName}
              type="button"
              onClick={() => setSelectedGenre(selectedGenre === genreName ? "" : genreName)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                selectedGenre.toLowerCase() === genreName.toLowerCase()
                  ? "bg-cinebook-accent text-white border-cinebook-accent"
                  : "bg-cinebook-surface text-zinc-300 border-cinebook-border hover:border-zinc-600"
              )}
            >
              {genreName}
            </button>
          ))}
        </div>

        {/* Language & Sort Controls */}
        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="rounded-lg border border-cinebook-border bg-cinebook-surface px-3 py-1.5 text-xs text-white focus:border-cinebook-accent focus:outline-none"
            aria-label="Filter by language"
          >
            <option value="">All Languages</option>
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-cinebook-border bg-cinebook-surface px-3 py-1.5 text-xs text-white focus:border-cinebook-accent focus:outline-none"
            aria-label="Sort movies"
          >
            <option value="popularity">Popularity</option>
            <option value="rating">Top Rated</option>
            <option value="newest">Release Date</option>
            <option value="title">Title (A-Z)</option>
          </select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-8 text-xs text-zinc-400 hover:text-white gap-1 px-2"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-4">
        <span>
          Showing <strong className="text-white">{filteredMovies.length}</strong> movies
        </span>
      </div>

      {/* Movie Grid */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-cinebook-border bg-cinebook-surface/40 p-16 text-center">
          <Clapperboard className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No Movies Found</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, genre tags, or language filters.
          </p>
          <Button variant="outline" size="sm" onClick={handleClearAll} className="mt-4">
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
