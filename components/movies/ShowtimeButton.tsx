"use client";

import React from "react";
import Link from "next/link";
import { Show } from "@/types";
import { ShowtimeSlot } from "@/lib/mock-data/shows";
import { formatShowtimeIST } from "@/lib/supabase/show-utils";
import { cn } from "@/lib/utils";

interface ShowtimeButtonProps {
  slot?: ShowtimeSlot;
  show?: Show;
  onSelect?: (item: Show | ShowtimeSlot) => void;
  isSelected?: boolean;
}

export function ShowtimeButton({
  slot,
  show,
  onSelect,
  isSelected = false,
}: ShowtimeButtonProps) {
  // Normalize properties
  const id = show ? show.id : slot?.id || "show-1";
  const time = show ? formatShowtimeIST(show.startTime) : slot?.time || "10:30 AM";
  const format = show ? show.format : slot?.format || "2D";
  const price = show ? show.basePrice : slot?.price || 300;
  const status = show ? (show.status === "cancelled" ? "sold-out" : "available") : slot?.status || "available";

  const isSoldOut = status === "sold-out";
  const isFastFilling = status === "fast-filling";

  const statusColorClass = {
    available: "text-emerald-400 border-cinebook-border hover:border-emerald-500 hover:bg-zinc-900",
    "fast-filling": "text-amber-400 border-cinebook-border hover:border-amber-500 hover:bg-zinc-900",
    "sold-out": "text-zinc-600 border-zinc-800 bg-zinc-900/50 cursor-not-allowed opacity-60",
  }[status as "available" | "fast-filling" | "sold-out"] || "text-emerald-400 border-cinebook-border";

  const content = (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-lg border bg-cinebook-dark px-3 py-2 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinebook-accent min-w-[95px]",
        statusColorClass,
        isSelected && "bg-cinebook-accent text-white border-cinebook-accent ring-2 ring-cinebook-accent/40"
      )}
      aria-label={`${time} show, ${format}, ₹${price}, ${status}`}
    >
      <span className={cn("text-xs font-bold text-white", isSelected && "text-white")}>
        {time}
      </span>
      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-zinc-400">
        <span>{format}</span>
        <span>•</span>
        <span>₹{price}</span>
      </div>

      {isFastFilling && !isSelected && (
        <span className="text-[9px] text-amber-400/90 font-medium">Fast Filling</span>
      )}
      {isSoldOut && (
        <span className="text-[9px] text-zinc-500 font-medium">Cancelled / Sold Out</span>
      )}
    </div>
  );

  if (isSoldOut) {
    return <button type="button" disabled className="cursor-not-allowed opacity-60">{content}</button>;
  }

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(show || slot!)}
        className="focus:outline-none"
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={`/shows/${id}`} className="block focus:outline-none">
      {content}
    </Link>
  );
}
