"use client";

import React, { useState } from "react";
import { ShowtimeSlot } from "@/lib/mock-data/shows";
import { cn } from "@/lib/utils";

interface ShowtimeButtonProps {
  slot: ShowtimeSlot;
  onSelect?: (slot: ShowtimeSlot) => void;
  isSelected?: boolean;
}

export function ShowtimeButton({
  slot,
  onSelect,
  isSelected = false,
}: ShowtimeButtonProps) {
  const isSoldOut = slot.status === "sold-out";
  const isFastFilling = slot.status === "fast-filling";

  const statusColorClass = {
    available: "text-emerald-400 border-cinebook-border hover:border-emerald-500",
    "fast-filling": "text-amber-400 border-cinebook-border hover:border-amber-500",
    "sold-out": "text-zinc-600 border-zinc-800 bg-zinc-900/50 cursor-not-allowed opacity-60",
  }[slot.status];

  return (
    <button
      type="button"
      disabled={isSoldOut}
      onClick={() => !isSoldOut && onSelect?.(slot)}
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-lg border bg-cinebook-dark px-3 py-2 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinebook-accent",
        statusColorClass,
        isSelected && "bg-cinebook-accent text-white border-cinebook-accent ring-2 ring-cinebook-accent/40"
      )}
      aria-label={`${slot.time} show, ${slot.format}, ₹${slot.price}, ${slot.status}`}
    >
      <span className={cn("text-xs font-bold", isSelected ? "text-white" : "text-white")}>
        {slot.time}
      </span>
      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-zinc-400">
        <span>{slot.format}</span>
        <span>•</span>
        <span>₹{slot.price}</span>
      </div>

      {isFastFilling && !isSelected && (
        <span className="text-[9px] text-amber-400/90 font-medium">Fast Filling</span>
      )}
      {isSoldOut && (
        <span className="text-[9px] text-zinc-500 font-medium">Sold Out</span>
      )}
    </button>
  );
}
