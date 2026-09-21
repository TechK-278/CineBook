/**
 * CineBook v2 — Supabase Environment Status
 * Checks whether Supabase is configured via valid environment variables
 */

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;
  if (url.includes("your-project.supabase.co") || anonKey.includes("your-supabase-anon-key")) {
    return false;
  }
  return true;
}
