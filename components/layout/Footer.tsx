import React from "react";
import Link from "next/link";
import { Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-cinebook-border bg-cinebook-surface/50 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-white">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-cinebook-accent text-white">
              <Film className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight">
              Cine<span className="text-cinebook-accent">Book</span> v2
            </span>
          </div>
          <p className="text-xs text-zinc-500 text-center md:text-right">
            Production Architecture & Ticket Booking Platform. Built with Next.js, TypeScript & Tailwind.
          </p>
        </div>
      </div>
    </footer>
  );
}
