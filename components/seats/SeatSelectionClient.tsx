"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Film,
  Sparkles,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { Show, ShowSeat, SeatLockResult } from "@/types";
import {
  lockSeatsAction as lockShowSeats,
  releaseSeatsAction as releaseShowSeats,
  getShowSeatsAction as getShowSeats,
} from "@/app/actions/seats";
import {
  normalizeSeatStatus,
  MAX_SEAT_SELECTION_LIMIT,
} from "@/lib/supabase/show-seats-utils";
import { formatShowtimeIST } from "@/lib/supabase/show-utils";
import { formatCurrency, calculateSeatsPricing } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/client";
import { SeatMap } from "./SeatMap";
import { SeatLegend } from "./SeatLegend";
import { SeatCountdownBanner } from "./SeatCountdownBanner";
import { SeatSelectionSummary } from "./SeatSelectionSummary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SeatSelectionClientProps {
  show: Show;
  initialSeats: ShowSeat[];
  initialUserLocks?: ShowSeat[];
  currentUserId?: string;
}

export function SeatSelectionClient({
  show,
  initialSeats,
  initialUserLocks = [],
  currentUserId = "demo-customer",
}: SeatSelectionClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Seat Inventory State
  const [seats, setSeats] = useState<ShowSeat[]>(initialSeats);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>(
    initialUserLocks.map((s) => s.seatId)
  );
  const [lockedByMeSeatIds, setLockedByMeSeatIds] = useState<string[]>(
    initialUserLocks.map((s) => s.seatId)
  );
  const [expiresAt, setExpiresAt] = useState<string | null>(
    initialUserLocks.length > 0 && initialUserLocks[0].lockExpiresAt
      ? initialUserLocks[0].lockExpiresAt
      : null
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);

  const isLocked = lockedByMeSeatIds.length > 0 && !!expiresAt;

  // Sync / Reconcile seats from authoritative server
  const refreshInventory = useCallback(async () => {
    try {
      const updatedSeats = await getShowSeats(show.id);
      setSeats(updatedSeats);
    } catch (err) {
      console.warn("[SeatSelectionClient] Failed to refresh inventory:", err);
    }
  }, [show.id]);

  // Realtime Supabase Subscription
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channelName = `show_seats:${show.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "show_seats",
          filter: `show_id=eq.${show.id}`,
        },
        (payload) => {
          const newRecord = payload.new as any;
          if (!newRecord || !newRecord.seat_id) {
            refreshInventory();
            return;
          }

          setSeats((prev) =>
            prev.map((s) => {
              if (s.seatId === newRecord.seat_id) {
                const updatedStatus = normalizeSeatStatus(
                  newRecord.status,
                  newRecord.lock_expires_at || newRecord.held_until
                );
                return {
                  ...s,
                  status: updatedStatus,
                  lockedBy: newRecord.locked_by || newRecord.held_by_user_id || null,
                  lockExpiresAt: newRecord.lock_expires_at || newRecord.held_until || null,
                };
              }
              return s;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [show.id, refreshInventory]);

  // Handle countdown expiration
  const handleLockExpired = useCallback(() => {
    setLockedByMeSeatIds([]);
    setSelectedSeatIds([]);
    setExpiresAt(null);
    setError("Your 10-minute hold has expired. Please select seats again.");
    refreshInventory();
  }, [refreshInventory]);

  // Toggle seat selection
  const handleToggleSeat = (seatId: string) => {
    setError(null);

    // If currently holding locked seats, user must release or confirm
    if (isLocked) {
      setError("You currently have locked seats. Click 'Release & Change Seats' to choose different seats.");
      return;
    }

    if (selectedSeatIds.includes(seatId)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seatId));
      return;
    }

    // Check limit
    if (selectedSeatIds.length >= MAX_SEAT_SELECTION_LIMIT) {
      setError(`You can select a maximum of ${MAX_SEAT_SELECTION_LIMIT} seats per booking.`);
      return;
    }

    setSelectedSeatIds((prev) => [...prev, seatId]);
  };

  // Lock selected seats
  const handleLockSeats = async () => {
    if (selectedSeatIds.length === 0) {
      setError("Please select at least one seat.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res: SeatLockResult = await lockShowSeats(
        show.id,
        selectedSeatIds,
        currentUserId
      );

      if (res.success && res.lockedSeats) {
        setLockedByMeSeatIds(selectedSeatIds);
        setExpiresAt(res.expiresAt || new Date(Date.now() + 600 * 1000).toISOString());
        await refreshInventory();
      } else {
        setError(res.error || "Selected seats are no longer available.");
        setSelectedSeatIds([]);
        await refreshInventory();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while locking seats.");
    } finally {
      setIsLoading(false);
    }
  };

  // Release locked seats
  const handleReleaseSeats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await releaseShowSeats(show.id, lockedByMeSeatIds, currentUserId);
      setLockedByMeSeatIds([]);
      setSelectedSeatIds([]);
      setExpiresAt(null);
      await refreshInventory();
    } catch (err) {
      console.warn("Failed to release seats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Proceed to Phase 6 Checkout Handoff
  const handleProceedToCheckout = () => {
    setShowCheckoutModal(true);
  };

  // Derived selected show seats with complete metadata
  const selectedShowSeats = seats.filter((s) => selectedSeatIds.includes(s.seatId));
  const formattedTime = formatShowtimeIST(show.startTime);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cinebook-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/shows/${show.id}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-cinebook-border bg-cinebook-surface text-zinc-300 hover:text-white transition-colors"
            title="Back to Show Details"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Film className="h-5 w-5 text-cinebook-accent" />
              {show.movie?.title || "Movie Selection"}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-0.5">
              <span>{show.theatre?.name || "Multiplex"}</span>
              <span>•</span>
              <span>{show.screen?.name || "Screen 1"}</span>
              <span>•</span>
              <span className="text-cinebook-accent font-semibold">{show.format}</span>
            </div>
          </div>
        </div>

        {/* Screening Details Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1 text-xs py-1">
            <Calendar className="h-3 w-3 text-cinebook-accent" />
            {show.date}
          </Badge>
          <Badge variant="outline" className="gap-1 text-xs py-1">
            <Clock className="h-3 w-3 text-cinebook-accent" />
            {formattedTime}
          </Badge>
        </div>
      </div>

      {/* Active Lock Countdown Alert */}
      {isLocked && (
        <SeatCountdownBanner expiresAt={expiresAt} onExpire={handleLockExpired} />
      )}

      {/* Main Seat Map & Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Seat Map & Legend (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          <SeatLegend />

          <div className="rounded-2xl border border-cinebook-border bg-cinebook-surface/60 p-6 backdrop-blur shadow-xl">
            <SeatMap
              seats={seats}
              basePrice={show.basePrice}
              selectedSeatIds={selectedSeatIds}
              lockedByMeSeatIds={lockedByMeSeatIds}
              currentUserId={currentUserId}
              onToggleSeat={handleToggleSeat}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Right Column: Sticky Summary & Checkout (4 cols on desktop) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <SeatSelectionSummary
            show={show}
            selectedSeats={selectedShowSeats}
            isLocked={isLocked}
            isLoading={isLoading}
            error={error}
            onLockSeats={handleLockSeats}
            onReleaseSeats={handleReleaseSeats}
            onProceedToCheckout={handleProceedToCheckout}
          />
        </div>
      </div>

      {/* Phase 6 Checkout Handoff Modal */}
      {showCheckoutModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-cinebook-border bg-cinebook-surface p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-cinebook-border pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Seats Confirmed & Locked</h3>
                <p className="text-xs text-zinc-400">
                  Ready for Phase 6 Checkout & Razorpay Integration
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-xl bg-cinebook-dark p-4 border border-cinebook-border text-xs">
              <div className="flex justify-between text-zinc-300">
                <span>Movie:</span>
                <span className="font-bold text-white">{show.movie?.title}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Cinema:</span>
                <span className="text-white">{show.theatre?.name}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Date & Time:</span>
                <span className="text-white">{show.date} at {formattedTime}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Seats Locked:</span>
                <span className="font-bold text-cinebook-accent">
                  {selectedShowSeats.map((s) => s.seat?.seatCode).join(", ")}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-800 pt-2 text-sm font-bold text-emerald-400">
                <span>Grand Total:</span>
                <span>
                  {formatCurrency(
                    calculateSeatsPricing(
                      show.basePrice,
                      selectedShowSeats.map((s) => ({
                        tier: s.seat?.tier,
                        priceMultiplier: s.seat?.priceMultiplier,
                      }))
                    ).grandTotal
                  )}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-cinebook-accent/10 border border-cinebook-accent/30 p-3 text-xs text-zinc-300 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-cinebook-accent" />
                Phase 5 Milestone Reached
              </div>
              <p className="text-[11px] text-zinc-400">
                Real-time seat locking is authoritative in the Supabase PostgreSQL database. Booking creation, checkout flows, and Razorpay payments will be connected in <strong>Phase 6</strong>.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 text-xs"
              >
                Back to Seat Map
              </Button>
              <Button
                onClick={() => {
                  setShowCheckoutModal(false);
                  router.push(`/shows/${show.id}`);
                }}
                className="flex-1 text-xs font-bold"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
