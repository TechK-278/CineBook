/**
 * CineBook v2 — Supabase Movie Synchronization Layer
 * Safely upserts TMDB metadata into PostgreSQL public.movies without overwriting operational relationships.
 */

import { createServerSupabaseClient } from "./server";
import { CineMovie } from "@/lib/tmdb/types";

export interface SyncMovieResult {
  success: boolean;
  movieId?: string;
  action?: "inserted" | "updated" | "skipped";
  error?: string;
}

/**
 * Server-only utility to synchronize a TMDB movie into Supabase database
 */
export async function syncMovieFromTmdb(movie: CineMovie): Promise<SyncMovieResult> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase client not configured" };
  }

  try {
    // 1. Check if movie already exists by tmdb_id
    const { data: existing, error: selectError } = await supabase
      .from("movies")
      .select("id, tmdb_id, title, base_price, is_featured")
      .eq("tmdb_id", movie.tmdbId)
      .maybeSingle();

    if (selectError) {
      return { success: false, error: selectError.message };
    }

    if (existing) {
      // 2. Update metadata fields safely, keeping operational fields (base_price, is_featured) intact if set
      const { error: updateError } = await supabase
        .from("movies")
        .update({
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.posterPath,
          backdrop_path: movie.backdropPath,
          genres: movie.genres,
          rating: movie.rating,
          language: movie.language,
          certificate: movie.certificate,
          release_date: movie.releaseDate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return {
        success: true,
        movieId: existing.id,
        action: "updated",
      };
    }

    // 3. Insert new record
    const { data: inserted, error: insertError } = await supabase
      .from("movies")
      .insert({
        tmdb_id: movie.tmdbId,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.posterPath,
        backdrop_path: movie.backdropPath,
        genres: movie.genres,
        duration_minutes: movie.durationMinutes,
        rating: movie.rating,
        language: movie.language,
        certificate: movie.certificate,
        release_date: movie.releaseDate,
        base_price: movie.basePrice,
        is_featured: movie.isFeatured,
      })
      .select("id")
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return {
      success: true,
      movieId: inserted.id,
      action: "inserted",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error during sync",
    };
  }
}
