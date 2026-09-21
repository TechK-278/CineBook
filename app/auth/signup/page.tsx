"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Film, Eye, EyeOff, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/status";
import { signupSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/profile";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // Validate with Zod
    const validation = signupSchema.safeParse({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const errors: typeof fieldErrors = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof fieldErrors;
        if (field) errors[field] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMessage(
        "Supabase credentials are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable live signup."
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
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("user already registered")) {
          setErrorMessage("An account with this email address already exists. Please sign in instead.");
        } else {
          setErrorMessage(error.message || "Failed to create account. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // If user is returned with active session (email confirmation off)
      if (data.session) {
        router.push(nextUrl);
        router.refresh();
        return;
      }

      // If confirmation email was dispatched
      setIsSuccess(true);
      setIsLoading(false);
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-16rem)] w-full max-w-md items-center justify-center px-4 py-12">
        <Card className="w-full border-cinebook-border bg-cinebook-surface/90 shadow-2xl backdrop-blur text-center p-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 mb-4">
            <CheckCircle className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl font-bold text-white mb-2">
            Verification Email Sent!
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
            We have dispatched a confirmation link to <strong className="text-white">{email}</strong>.
            Please verify your email address to activate your CineBook account and sign in.
          </CardDescription>
          <Link href="/auth/login">
            <Button className="w-full text-xs sm:text-sm">Proceed to Sign In</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-16rem)] w-full max-w-md items-center justify-center px-4 py-12">
      <Card className="w-full border-cinebook-border bg-cinebook-surface/90 shadow-2xl backdrop-blur">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cinebook-accent text-white shadow-lg mb-2">
            <Film className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-white">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-zinc-400">
            Join CineBook to book tickets, save favorite cinemas, and access exclusive offers
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-300 animate-in fade-in duration-150"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label
                htmlFor="signup-name"
                className="block text-xs font-semibold text-zinc-300"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input
                  id="signup-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  autoComplete="name"
                  required
                  disabled={isLoading}
                  className="w-full rounded-lg border border-cinebook-border bg-cinebook-dark pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 transition-colors focus:border-cinebook-accent focus:outline-none focus:ring-1 focus:ring-cinebook-accent disabled:opacity-50"
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-[11px] text-red-400 font-medium">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label
                htmlFor="signup-email"
                className="block text-xs font-semibold text-zinc-300"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input
                  id="signup-email"
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

            {/* Password */}
            <div className="space-y-1">
              <label
                htmlFor="signup-password"
                className="block text-xs font-semibold text-zinc-300"
              >
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="space-y-1">
              <label
                htmlFor="signup-confirm-password"
                className="block text-xs font-semibold text-zinc-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input
                  id="signup-confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  className="w-full rounded-lg border border-cinebook-border bg-cinebook-dark pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 transition-colors focus:border-cinebook-accent focus:outline-none focus:ring-1 focus:ring-cinebook-accent disabled:opacity-50"
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] text-red-400 font-medium">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2 text-sm font-semibold h-10 mt-3"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center border-t border-cinebook-border/80 pt-4 pb-6 text-center text-xs text-zinc-400">
          <p>
            Already have an account?{" "}
            <Link
              href={`/auth/login${nextUrl !== "/profile" ? `?next=${encodeURIComponent(nextUrl)}` : ""}`}
              className="font-semibold text-cinebook-accent hover:underline ml-1"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-zinc-400">Loading signup...</div>}>
      <SignupForm />
    </Suspense>
  );
}
