"use client";

import React from "react";
import { ShowSeat, UiSeatState, SeatTier } from "@/types";
import { SeatButton } from "./SeatButton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/pricing";

interface SeatMapProps {
  seats: ShowSeat[];
  basePrice: number;
  selectedSeatIds: string[];
  lockedByMeSeatIds: string[];
  currentUserId?: string;
  onToggleSeat: (seatId: string) => void;
  disabled?: boolean;
}

export function SeatMap({
  seats,
  basePrice,
  selectedSeatIds,
  lockedByMeSeatIds,
  currentUserId,
  onToggleSeat,
  disabled = false,
}: SeatMapProps) {
  // Group seats by tier, and within tier by row
  const tiersOrder: SeatTier[] = ["Recliner", "Premium", "Standard"];

  // Organize data
  const tierGroups = new Map<SeatTier, Map<string, ShowSeat[]>>();

  // Populate maps
  seats.forEach((showSeat) => {
    const seat = showSeat.seat;
    if (!seat) return;

    const tier = (seat.tier as SeatTier) || "Standard";
    const row = seat.rowLabel || "A";

    if (!tierGroups.has(tier)) {
      tierGroups.set(tier, new Map());
    }
    const rowMap = tierGroups.get(tier)!;
    if (!rowMap.has(row)) {
      rowMap.set(row, []);
    }
    rowMap.get(row)!.push(showSeat);
  });

  // Calculate tier prices
  const getTierPrice = (tier: SeatTier): number => {
    const multiplier = tier === "Recliner" ? 1.5 : tier === "Premium" ? 1.2 : 1.0;
    return Math.round(basePrice * multiplier);
  };

  // Helper to determine UI seat state
  const getSeatState = (showSeat: ShowSeat): UiSeatState => {
    const isSelected = selectedSeatIds.includes(showSeat.seatId);
    const isLockedByMe =
      lockedByMeSeatIds.includes(showSeat.seatId) ||
      (showSeat.status === "LOCKED" &&
        showSeat.lockedBy &&
        currentUserId &&
        showSeat.lockedBy === currentUserId);

    if (isSelected) return "selected";
    if (isLockedByMe) return "locked_by_me";

    if (showSeat.status === "BOOKED" || showSeat.status === "booked") return "booked";
    if (showSeat.status === "BLOCKED" || showSeat.status === "blocked") return "blocked";
    if (showSeat.status === "LOCKED" || showSeat.status === "held" || showSeat.status === "locked") {
      return "locked_by_other";
    }

    return "available";
  };

  return (
    <div className="w-full space-y-8">
      {/* Screen Curved Direction Banner */}
      <div className="relative mx-auto max-w-lg text-center pt-2">
        <div className="mx-auto h-2.5 w-4/5 rounded-t-full bg-gradient-to-r from-cinebook-accent/10 via-cinebook-accent to-cinebook-accent/10 shadow-[0_-4px_16px_rgba(229,9,20,0.5)] border-t border-cinebook-accent/60" />
        <div className="mt-2.5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">
          <span>Screen This Way</span>
        </div>
      </div>

      {/* Seat Map Grid with controlled horizontal scroll on small mobile */}
      <div className="overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[420px] max-w-2xl mx-auto space-y-6">
          {tiersOrder.map((tier) => {
            const rowMap = tierGroups.get(tier);
            if (!rowMap || rowMap.size === 0) return null;

            const tierPrice = getTierPrice(tier);
            const rows = Array.from(rowMap.keys()).sort();

            return (
              <div
                key={tier}
                className="rounded-2xl border border-cinebook-border/60 bg-cinebook-surface/40 p-4 sm:p-5 backdrop-blur space-y-3"
              >
                {/* Tier Title and Price */}
                <div className="flex items-center justify-between border-b border-cinebook-border/40 pb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white tracking-wide">{tier}</span>
                    <Badge
                      variant={tier === "Recliner" ? "accent" : "outline"}
                      className="text-[10px] px-2 py-0"
                    >
                      {tier === "Recliner" ? "Luxury Recliners" : tier === "Premium" ? "Prime View" : "Standard"}
                    </Badge>
                  </div>
                  <span className="font-semibold text-emerald-400">
                    {formatCurrency(tierPrice)}
                  </span>
                </div>

                {/* Rows Grid */}
                <div className="space-y-2.5 pt-1">
                  {rows.map((rowLabel) => {
                    const rowSeats = rowMap.get(rowLabel) || [];
                    // Sort by seat number
                    rowSeats.sort((a, b) => (a.seat?.seatNumber || 0) - (b.seat?.seatNumber || 0));

                    return (
                      <div key={rowLabel} className="flex items-center justify-center gap-2 sm:gap-3">
                        {/* Left Row Label */}
                        <span className="w-5 text-center text-xs font-bold text-zinc-400">
                          {rowLabel}
                        </span>

                        {/* Seat Row */}
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          {rowSeats.map((showSeat, idx) => {
                            const seat = showSeat.seat!;
                            const state = getSeatState(showSeat);

                            // Insert visual aisle gap in the middle (e.g. after seat 6)
                            const isAisle = idx === 5 && rowSeats.length > 6;

                            return (
                              <React.Fragment key={showSeat.seatId}>
                                <SeatButton
                                  seatId={showSeat.seatId}
                                  seatCode={seat.seatCode}
                                  rowLabel={seat.rowLabel}
                                  seatNumber={seat.seatNumber}
                                  tier={tier}
                                  price={tierPrice}
                                  state={state}
                                  onToggle={onToggleSeat}
                                  disabled={disabled}
                                />
                                {isAisle && (
                                  <div className="w-3 sm:w-6" aria-hidden="true" />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        {/* Right Row Label */}
                        <span className="w-5 text-center text-xs font-bold text-zinc-400">
                          {rowLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
