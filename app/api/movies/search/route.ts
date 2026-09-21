/**
 * CineBook v2 — Live Movie & Cinema Search API Route Handler
 * Integrates server-side TMDB live movie searching with CineBook cinema discovery.
 */

import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb/movies";
import { searchEntities } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();

    if (!query || query.length === 0) {
      return NextResponse.json({ movies: [], cinemas: [] });
    }

    // 1. Fetch live TMDB movies matching query
    const moviesPromise = searchMovies(query).catch((err) => {
      console.error("[Search API] Error searching TMDB movies:", err);
      return [];
    });

    // 2. Fetch CineBook Cinemas matching query
    const localSearchResults = searchEntities(query);

    const [tmdbMovies] = await Promise.all([moviesPromise]);

    return NextResponse.json({
      movies: tmdbMovies.slice(0, 6),
      cinemas: localSearchResults.cinemas.slice(0, 4),
    });
  } catch (error) {
    console.error("[Search API] Unexpected error in search route:", error);
    return NextResponse.json(
      { movies: [], cinemas: [], error: "Search failed" },
      { status: 500 }
    );
  }
}
