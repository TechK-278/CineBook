import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const isForwardingToRelative = next.startsWith("/");
        const destination = isForwardingToRelative ? `${origin}${next}` : `${origin}/`;
        return NextResponse.redirect(destination);
      }
    }
  }

  // Return the user to an error page or login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
