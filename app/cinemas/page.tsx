"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Film, MapPin, Search, X } from "lucide-react";
import { CINEMAS, CinemaDetail } from "@/lib/mock-data/cinemas";
import { CinemaCard } from "@/components/cinemas/CinemaCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function CinemasContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get("city") || "ahmedabad";

  const [search, setSearch] = useState("");
  const [selectedChain, setSelectedChain] = useState<string>("all");

  const chains = ["all", "PVR", "INOX", "Cinépolis", "Independent"];

  const filteredCinemas = useMemo(() => {
    return CINEMAS.filter((cinema) => {
      // 1. City Match
      const matchesCity =
        cinema.cityId.toLowerCase() === initialCity.toLowerCase() ||
        cinema.cityName.toLowerCase() === initialCity.toLowerCase();

      // 2. Search text match
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        cinema.name.toLowerCase().includes(q) ||
        cinema.locationArea.toLowerCase().includes(q) ||
        cinema.address.toLowerCase().includes(q);

      // 3. Chain match
      const matchesChain =
        selectedChain === "all" || cinema.chain.toLowerCase() === selectedChain.toLowerCase();

      return matchesCity && matchesSearch && matchesChain;
    });
  }, [initialCity, search, selectedChain]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cinebook-border mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Film className="h-7 w-7 text-cinebook-accent" />
            Cinemas & Multiplexes in Ahmedabad
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Discover luxury IMAX, 4DX, Insignia, and Dolby Atmos auditoriums near you
          </p>
        </div>
        <Badge variant="secondary" className="self-start md:self-auto">
          {filteredCinemas.length} Cinemas Found
        </Badge>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by cinema name, mall, or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-cinebook-border bg-cinebook-surface pl-9 pr-9 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-cinebook-accent focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2.5 p-0.5 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Chain Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {chains.map((chain) => (
            <button
              key={chain}
              type="button"
              onClick={() => setSelectedChain(chain)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors border capitalize",
                selectedChain === chain
                  ? "bg-cinebook-accent text-white border-cinebook-accent"
                  : "bg-cinebook-surface text-zinc-300 border-cinebook-border hover:border-zinc-600"
              )}
            >
              {chain === "all" ? "All Cinemas" : chain}
            </button>
          ))}
        </div>
      </div>

      {/* Cinemas Grid */}
      {filteredCinemas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCinemas.map((cinema) => (
            <CinemaCard key={cinema.id} cinema={cinema} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-cinebook-border bg-cinebook-surface/40 p-16 text-center">
          <Film className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No Cinemas Found</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            No multiplexes match your search in this city.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setSelectedChain("all");
            }}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CinemasPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-zinc-400">Loading cinemas...</div>}>
      <CinemasContent />
    </Suspense>
  );
}
