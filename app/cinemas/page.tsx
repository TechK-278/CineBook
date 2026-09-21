import React, { Suspense } from "react";
import { getActiveTheatres } from "@/lib/supabase/theatres";
import { CinemasDirectoryClient } from "@/components/cinemas/CinemasDirectoryClient";

export const revalidate = 3600; // 1-hour cache

export default async function CinemasPage() {
  const theatres = await getActiveTheatres({ city: "ahmedabad" });

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-zinc-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cinebook-accent border-r-transparent mb-4" />
          <p className="text-sm">Loading Ahmedabad cinema directory...</p>
        </div>
      }
    >
      <CinemasDirectoryClient initialTheatres={theatres} />
    </Suspense>
  );
}
