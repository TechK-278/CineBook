"use client";

import React from "react";
import { Lock, Check } from "lucide-react";

export function SeatLegend() {
  const items = [
    {
      label: "Available",
      box: (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-zinc-700 bg-zinc-800/80" />
      ),
    },
    {
      label: "Selected",
      box: (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-cinebook-accent bg-cinebook-accent text-white shadow-sm">
          <Check className="h-2.5 w-2.5 stroke-[3]" />
        </span>
      ),
    },
    {
      label: "Locked by You",
      box: (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-amber-500 bg-amber-600 text-white shadow-sm">
          <span className="text-[8px] font-bold">●</span>
        </span>
      ),
    },
    {
      label: "Unavailable / Held",
      box: (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-zinc-800/60 bg-zinc-900/60 text-amber-500/70">
          <Lock className="h-2.5 w-2.5" />
        </span>
      ),
    },
    {
      label: "Booked",
      box: (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-zinc-900 bg-zinc-900 text-zinc-600 text-[9px]">
          ✕
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 rounded-xl border border-cinebook-border bg-cinebook-surface/60 px-4 py-3 text-xs text-zinc-400 backdrop-blur">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          {item.box}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
