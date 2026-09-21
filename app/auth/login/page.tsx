"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Film, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/status";
import { loginSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/profile";
  const verifiedParam = searchParams.get("verified");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // Validate with Zod
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors: { email?: string; password?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "email") errors.email = err.message;
        if (err.path[0] === "password") errors.password = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMessage(
        "Supabase is not configured yet. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable live authentication."
      );
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setErrorMessage("Authentication client failed to initialize.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message || "Invalid email or password.");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        router.push(nextUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-16rem)] w-full max-w-md items-center justify-center px-4 py-12">
      <Card className="w-full border-cinebook-border bg-cinebook-surface/90 shadow-2xl backdrop-blur">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto relative flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden shadow-lg mb-2">
            <Image
              src="/logo.png"
              alt="CineBook"
              width={56}
              height={56}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-white">
            Welcome to <span className="text-cinebook-accent">CineBook</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-zinc-400">
            Sign in to access your bookings, personalized showtimes, and profile
          </CardDescription>
        </CardHeader>

        <CardContent>
          {verifiedParam && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Email verified successfully! You can now log in.</span>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-300 animate-in fade-in duration-150"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-zinc-300"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="w-full rounded-lg border border-cinebook-border bg-cinebook-dark pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 transition-colors focus:border-cinebook-accent focus:outline-none focus:ring-1 focus:ring-cinebook-accent disabled:opacity-50"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-400 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-cinebook-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="w-full rounded-lg border border-cinebook-border bg-cinebook-dark pl-9 pr-10 py-2 text-sm text-white placeholder-zinc-500 transition-colors focus:border-cinebook-accent focus:outline-none focus:ring-1 focus:ring-cinebook-accent disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 p-0.5 text-zinc-500 hover:text-zinc-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-400 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2 text-sm font-semibold h-10 mt-2"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center border-t border-cinebook-border/80 pt-4 pb-6 text-center text-xs text-zinc-400">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href={`/auth/signup${nextUrl !== "/profile" ? `?next=${encodeURIComponent(nextUrl)}` : ""}`}
              className="font-semibold text-cinebook-accent hover:underline ml-1"
            >
              Create Account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-zinc-400">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
