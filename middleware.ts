import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup");
  const isProtectedRoute = pathname.startsWith("/profile") || pathname.startsWith("/bookings");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isConfigured =
    Boolean(supabaseUrl && supabaseAnonKey) &&
    !supabaseUrl?.includes("your-project.supabase.co") &&
    !supabaseAnonKey?.includes("your-supabase-anon-key");

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!isConfigured) {
    // If Supabase is unconfigured, allow public routes and let page-level components handle gracefully
    return response;
  }

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated user trying to access protected routes
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated user visiting login or signup back to profile / next
  if (user && isAuthRoute) {
    const nextParam = request.nextUrl.searchParams.get("next");
    const destination = nextParam && nextParam.startsWith("/") ? nextParam : "/profile";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets / images
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
