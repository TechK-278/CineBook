"use client";

import React from "react";
import { Ticket, ArrowRight, ShieldCheck, RefreshCw, X, AlertCircle } from "lucide-react";
import { ShowSeat, Show } from "@/types";
import { calculateSeatsPricing, formatCurrency } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface SeatSelectionSummaryProps {
  show: Show;
  selectedSeats: ShowSeat[];
  isLocked: boolean;
  isLoading: boolean;
  error?: string | null;
  onLockSeats: () => void;
  onReleaseSeats: () => void;
  onProceedToCheckout: () => void;
}

export function SeatSelectionSummary({
  show,
  selectedSeats,
  isLocked,
  isLoading,
  error,
  onLockSeats,
  onReleaseSeats,
  onProceedToCheckout,
}: SeatSelectionSummaryProps) {
  const seatCount = selectedSeats.length;

  const seatsForPricing = selectedSeats.map((s) => ({
    tier: s.seat?.tier || "Standard",
    priceMultiplier: s.seat?.priceMultiplier,
  }));

  const pricing = calculateSeatsPricing(show.basePrice, seatsForPricing);

  return (
    <Card className="border-cinebook-border bg-cinebook-surface/90 shadow-2xl backdrop-blur">
      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Title & Ticket Count */}
        <div className="flex items-center justify-between border-b border-cinebook-border/60 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Ticket className="h-4 w-4 text-cinebook-accent" />
              Booking Summary
            </h3>
            <span className="text-xs text-zinc-400">
              {show.format} • {show.language}
            </span>
          </div>

          <Badge variant={seatCount > 0 ? "accent" : "outline"} className="text-xs">
            {seatCount} / 8 {seatCount === 1 ? "Seat" : "Seats"}
          </Badge>
        </div>

        {/* Selected Seats Badges */}
        {seatCount > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Selected Seats</span>
              {!isLocked && (
                <button
                  type="button"
                  onClick={onReleaseSeats}
                  className="text-xs text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {selectedSeats.map((s) => (
                <span
                  key={s.seatId}
                  className="inline-flex items-center gap-1 rounded-md bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-xs font-semibold text-white"
                >
                  <span>{s.seat?.seatCode}</span>
                  <span className="text-[10px] text-zinc-400">({s.seat?.tier})</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-400">
            Click on available seats on the map to start your reservation.
          </div>
        )}

        {/* Pricing Breakdown */}
        {seatCount > 0 && (
          <div className="space-y-2.5 border-t border-cinebook-border/60 pt-4 text-xs">
            {pricing.tierBreakdown.map((item) => (
              <div key={item.tier} className="flex justify-between text-zinc-300">
                <span>
                  {item.tier} ({item.count} × {formatCurrency(item.unitPrice)})
                </span>
                <span className="font-medium text-white">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}

            <div className="flex justify-between text-zinc-400 pt-1">
              <span>Convenience Fee (12%)</span>
              <span>{formatCurrency(pricing.convenienceFee)}</span>
            </div>

            <div className="flex justify-between border-t border-cinebook-border/60 pt-3 text-sm font-bold">
              <span className="text-white">Grand Total</span>
              <span className="text-emerald-400">{formatCurrency(pricing.grandTotal)}</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-2">
          {isLocked ? (
            <Button
              type="button"
              onClick={onProceedToCheckout}
              disabled={isLoading || seatCount === 0}
              className="w-full gap-2 font-bold shadow-lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Securing Reservation...
                </>
              ) : (
                <>
                  Continue to Checkout
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onLockSeats}
              disabled={isLoading || seatCount === 0}
              className="w-full gap-2 font-bold shadow-lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Locking Seats...
                </>
              ) : (
                <>
                  Lock Seats & Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}

          {isLocked && (
            <Button
              type="button"
              variant="outline"
              onClick={onReleaseSeats}
              disabled={isLoading}
              className="w-full text-xs text-zinc-400 hover:text-white"
            >
              Release & Change Seats
            </Button>
          )}
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 pt-1">
          <ShieldCheck className="h-3.5 w-3.5 text-cinebook-accent" />
          <span>Authoritative 10-Minute Seat Reservation</span>
        </div>
      </CardContent>
    </Card>
  );
}
