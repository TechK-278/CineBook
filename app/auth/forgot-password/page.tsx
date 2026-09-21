"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Film, Mail, ArrowRight, AlertCircle, CheckCircle, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/status";
import { forgotPasswordSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldError(null);

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setFieldError(validation.error.errors[0]?.message || "Invalid email");
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMessage(
        "Supabase credentials are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
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
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      });

      if (error) {
        setErrorMessage(error.message || "Unable to send reset instructions.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);
    } catch {
      setErrorMessage("An unexpected network error occurred.");
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
            Password Reset Email Dispatched
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
            If an account exists with <strong className="text-white">{email}</strong>, we have sent a secure password reset link to your inbox.
          </CardDescription>
          <Link href="/auth/login">
            <Button className="w-full text-xs sm:text-sm">Return to Sign In</Button>
          </Link>
        </Card>
      </div>
    );
  }

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
            Reset Password
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-zinc-400">
            Enter your email address to receive password recovery instructions
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="forgot-email"
                className="block text-xs font-semibold text-zinc-300"
              >
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input
                  id="forgot-email"
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
              {fieldError && (
                <p className="text-[11px] text-red-400 font-medium">{fieldError}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2 text-sm font-semibold h-10 mt-2"
            >
              {isLoading ? "Sending link..." : "Send Reset Link"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex items-center justify-center border-t border-cinebook-border/80 pt-4 pb-6 text-center text-xs text-zinc-400">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1 font-semibold text-cinebook-accent hover:underline"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
