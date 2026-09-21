/**
 * CineBook v2 — Supabase Theatres / Cinema Data Access Layer
 * Provides server-side retrieval of active CineBook cinema locations with graceful fallback.
 */

import { createServerSupabaseClient } from "./server";
import { isSupabaseConfigured } from "./status";
import { Theatre } from "@/types";
import { CINEMAS, CinemaDetail } from "@/lib/mock-data/cinemas";

/**
 * Converts a database row to a strict Theatre domain model
 */
function mapDbRowToTheatre(row: any): Theatre {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || row.id,
    chain: row.chain || "Independent",
    area: row.area || row.location || "Ahmedabad",
    location: row.location || row.area || "Ahmedabad",
    city: row.city || "Ahmedabad",
    state: row.state || "Gujarat",
    pincode: row.pincode || null,
    address: row.address || null,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    description: row.description || null,
    imageUrl: row.image_url || null,
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    screenCount: row.screens ? (Array.isArray(row.screens) ? row.screens.length : Number(row.screens)) : 6,
    formats: ["2D", "3D", "IMAX", "Dolby Atmos"],
    isActive: row.is_active !== undefined ? row.is_active : true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Converts mock CinemaDetail to Theatre domain model
 */
export function mapCinemaDetailToTheatre(c: CinemaDetail): Theatre {
  return {
    id: c.id,
    name: c.name,
    slug: c.id,
    chain: c.chain,
    area: c.locationArea,
    location: c.locationArea,
    city: c.cityName,
    state: "Gujarat",
    pincode: "380015",
    address: c.address,
    amenities: c.amenities,
    screenCount: c.screenCount,
    formats: c.formats,
    isActive: true,
  };
}

/**
 * Fetch all active theatres, optionally filtered by city, chain, or search query
 */
export async function getActiveTheatres(options: {
  city?: string;
  chain?: string;
  search?: string;
} = {}): Promise<Theatre[]> {
  const { city = "ahmedabad", chain, search } = options;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        let query = supabase
          .from("theatres")
          .select("*, screens(id, screen_type, name)")
          .eq("is_active", true);

        if (city && city.toLowerCase() !== "all") {
          query = query.ilike("city", `%${city}%`);
        }

        if (chain && chain.toLowerCase() !== "all") {
          query = query.ilike("chain", `%${chain}%`);
        }

        if (search && search.trim()) {
          query = query.or(`name.ilike.%${search.trim()}%,location.ilike.%${search.trim()}%,area.ilike.%${search.trim()}%`);
        }

        const { data, error } = await query.order("name", { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map(mapDbRowToTheatre);
        }
      }
    } catch (err) {
      console.warn("[Theatres Service] Supabase query failed, using fallback:", err);
    }
  }

  // Fallback to local dataset
  let list = CINEMAS.map(mapCinemaDetailToTheatre);

  if (city && city.toLowerCase() !== "all") {
    list = list.filter((t) => t.city.toLowerCase().includes(city.toLowerCase()));
  }

  if (chain && chain.toLowerCase() !== "all") {
    list = list.filter((t) => t.chain.toLowerCase() === chain.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.area.toLowerCase().includes(q) ||
        t.address?.toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Fetch a single theatre by UUID or slug
 */
export async function getTheatreById(idOrSlug: string): Promise<Theatre | null> {
  const cleanId = idOrSlug.trim();
  if (!cleanId) return null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        // Attempt match by slug or id
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
        let query = supabase.from("theatres").select("*, screens(*)").eq("is_active", true);

        if (isUuid) {
          query = query.eq("id", cleanId);
        } else {
          query = query.eq("slug", cleanId);
        }

        const { data, error } = await query.maybeSingle();

        if (!error && data) {
          return mapDbRowToTheatre(data);
        }
      }
    } catch (err) {
      console.warn("[Theatres Service] Supabase single theatre query failed:", err);
    }
  }

  // Fallback to local dataset
  const mockMatch = CINEMAS.find((c) => c.id === cleanId);
  if (mockMatch) {
    return mapCinemaDetailToTheatre(mockMatch);
  }

  return null;
}
