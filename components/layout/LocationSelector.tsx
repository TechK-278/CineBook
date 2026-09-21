"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Check, Search, X } from "lucide-react";
import { CITIES, City, DEFAULT_CITY } from "@/lib/mock-data/cities";
import { cn } from "@/lib/utils";

interface LocationSelectorProps {
  currentCity?: City;
  onSelectCity?: (city: City) => void;
}

export function LocationSelector({
  currentCity = DEFAULT_CITY,
  onSelectCity,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City>(currentCity);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (city: City) => {
    setSelectedCity(city);
    onSelectCity?.(city);
    setIsOpen(false);
    setSearchQuery("");
  };

  const popularCities = CITIES.filter((c) => c.isPopular);
  const filteredCities = CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg border border-cinebook-border bg-cinebook-surface/80 px-3 py-1.5 text-xs sm:text-sm font-medium text-white transition-all hover:border-zinc-600 hover:bg-cinebook-surfaceHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinebook-accent"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Select city. Currently selected: ${selectedCity.name}`}
      >
        <MapPin className="h-4 w-4 text-cinebook-accent shrink-0" aria-hidden="true" />
        <span className="font-semibold text-white tracking-wide">{selectedCity.name}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-zinc-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {/* City Selector Modal / Dropdown */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Select City"
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-cinebook-border bg-cinebook-surface p-4 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-3 border-b border-cinebook-border">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <MapPin className="h-4 w-4 text-cinebook-accent" />
              Select Your City
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-zinc-400 hover:bg-cinebook-surfaceHover hover:text-white"
              aria-label="Close city selector"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mt-3 mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search for your city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-cinebook-border bg-cinebook-dark pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-cinebook-accent focus:outline-none focus:ring-1 focus:ring-cinebook-accent"
              autoFocus
            />
          </div>

          {/* Popular Cities Grid */}
          {!searchQuery && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Popular Cities
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {popularCities.map((city) => {
                  const isCurrent = city.id === selectedCity.id;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelect(city)}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors text-left",
                        isCurrent
                          ? "bg-cinebook-accent text-white font-semibold"
                          : "bg-cinebook-dark/60 text-zinc-300 hover:bg-cinebook-surfaceHover hover:text-white"
                      )}
                    >
                      <span className="truncate">{city.name}</span>
                      {isCurrent && <Check className="h-3.5 w-3.5 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Results / All Cities */}
          {searchQuery && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelect(city)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-300 hover:bg-cinebook-surfaceHover hover:text-white"
                  >
                    <span>
                      {city.name}, <span className="text-xs text-zinc-500">{city.state}</span>
                    </span>
                    {city.id === selectedCity.id && <Check className="h-4 w-4 text-cinebook-accent" />}
                  </button>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-zinc-500">
                  No cities found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
