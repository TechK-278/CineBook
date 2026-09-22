"use client";

import React from "react";
import { Lock, Check, Ban } from "lucide-react";
import { UiSeatState, SeatTier } from "@/types";
import { formatCurrency } from "@/lib/pricing";

interface SeatButtonProps {
  seatId: string;
  seatCode: string;
  rowLabel: string;
  seatNumber: number;
  tier: SeatTier;
  price: number;
  state: UiSeatState;
  onToggle: (seatId: string) => void;
  disabled?: boolean;
}

export function SeatButton({
  seatId,
  seatCode,
  rowLabel,
  seatNumber,
  tier,
  price,
  state,
  onToggle,
  disabled = false,
}: SeatButtonProps) {
  const isAvailable = state === "available";
  const isSelected = state === "selected";
  const isLockedByMe = state === "locked_by_me";
  const isLockedByOther = state === "locked_by_other";
  const isBooked = state === "booked";
  const isBlocked = state === "blocked";

  const isInteractive = isAvailable || isSelected || isLockedByMe;
  const isDisabled = disabled || isLockedByOther || isBooked || isBlocked;

  // Build accessible ARIA description
  const stateLabel = isSelected
    ? "Selected"
    : isLockedByMe
    ? "Locked by you"
    : isLockedByOther
    ? "Locked by another user"
    : isBooked
    ? "Booked"
    : isBlocked
    ? "Blocked"
    : "Available";

  const ariaLabel = `Seat ${seatCode}, ${tier}, ${formatCurrency(price)}, ${stateLabel}`;

  // Styling based on state
  let stateStyles = "bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:border-cinebook-accent hover:text-white hover:bg-zinc-700/80 shadow-sm";

  if (isSelected) {
    stateStyles = "bg-cinebook-accent text-white border-cinebook-accent shadow-[0_0_12px_rgba(229,9,20,0.5)] scale-105";
  } else if (isLockedByMe) {
    stateStyles = "bg-amber-600 text-white border-amber-500 shadow-[0_0_10px_rgba(217,119,6,0.5)]";
  } else if (isLockedByOther) {
    stateStyles = "bg-zinc-900/60 text-amber-500/50 border-zinc-800/60 cursor-not-allowed opacity-50";
  } else if (isBooked) {
    stateStyles = "bg-zinc-900/90 text-zinc-600 border-zinc-900 cursor-not-allowed opacity-40";
  } else if (isBlocked) {
    stateStyles = "bg-zinc-900/90 text-zinc-700 border-zinc-900 cursor-not-allowed opacity-30";
  }

  return (
    <button
      type="button"
      id={`seat-${seatCode}`}
      aria-label={ariaLabel}
      aria-pressed={isSelected || isLockedByMe}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      onClick={() => {
        if (isInteractive && !disabled) {
          onToggle(seatId);
        }
      }}
      className={`relative inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border text-[11px] sm:text-xs font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-cinebook-accent focus:ring-offset-2 focus:ring-offset-cinebook-dark ${stateStyles}`}
      title={`${seatCode} (${tier}) - ${formatCurrency(price)} [${stateLabel}]`}
    >
      {isSelected ? (
        <Check className="h-3.5 w-3.5 stroke-[3]" />
      ) : isLockedByMe ? (
        <span className="text-[10px] font-bold">{seatNumber}</span>
      ) : isLockedByOther ? (
        <Lock className="h-3 w-3" />
      ) : isBooked ? (
        <span className="text-[10px] text-zinc-600">✕</span>
      ) : isBlocked ? (
        <Ban className="h-3 w-3" />
      ) : (
        <span>{seatNumber}</span>
      )}
    </button>
  );
}
