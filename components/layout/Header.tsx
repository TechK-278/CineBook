"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Film,
  Clapperboard,
  Tag,
  User,
  Menu,
  X,
  Ticket,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/status";
import { LocationSelector } from "./LocationSelector";
import { SearchBar } from "@/components/discovery/SearchBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email?: string; name?: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: "/movies", label: "Movies", icon: Clapperboard },
    { href: "/cinemas", label: "Cinemas", icon: Film },
    { href: "/offers", label: "Offers", icon: Tag },
  ];

  // Subscribe to Supabase Auth state
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthChecked(true);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setAuthChecked(true);
      return;
    }

    // Get current user session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser({
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        });
      } else {
        setCurrentUser(null);
      }
      setAuthChecked(true);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
        });
      } else {
        setCurrentUser(null);
      }
      setAuthChecked(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    setCurrentUser(null);
    router.push("/");
    router.refresh();
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cinebook-border bg-cinebook-dark/95 backdrop-blur supports-[backdrop-filter]:bg-cinebook-dark/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center shrink-0 overflow-hidden rounded-xl transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="CineBook"
                width={36}
                height={36}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <span className="text-xl font-black tracking-wider text-white">
              CINE<span className="text-cinebook-accent">BOOK</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-cinebook-surface text-white border border-cinebook-border"
                      : "text-zinc-400 hover:bg-cinebook-surfaceHover hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <SearchBar variant="header" />
        </div>

        {/* Right Action Items: Location & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Location Selector */}
          <LocationSelector />

          {/* Authentication State Control */}
          {authChecked && currentUser ? (
            /* Logged In User Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-cinebook-border bg-cinebook-surface px-2.5 py-1.5 text-xs sm:text-sm font-medium text-white hover:border-zinc-600 hover:bg-cinebook-surfaceHover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinebook-accent"
                aria-expanded={userDropdownOpen}
                aria-haspopup="menu"
                aria-label={`User account menu for ${currentUser.name}`}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cinebook-accent text-[11px] font-bold text-white">
                  {getInitials(currentUser.name)}
                </div>
                <span className="hidden sm:inline-block max-w-[100px] truncate font-medium">
                  {currentUser.name}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-cinebook-border bg-cinebook-surface p-2 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 duration-150"
                >
                  <div className="px-3 py-2 border-b border-cinebook-border mb-1">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{currentUser.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-cinebook-surfaceHover hover:text-white transition-colors"
                  >
                    <User className="h-4 w-4 text-cinebook-accent" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-cinebook-surfaceHover hover:text-white transition-colors"
                  >
                    <Ticket className="h-4 w-4 text-cinebook-accent" />
                    <span>My Bookings</span>
                  </Link>

                  <div className="pt-1 mt-1 border-t border-cinebook-border">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      role="menuitem"
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : authChecked ? (
            /* Logged Out: Sign In Trigger */
            <Link href={`/auth/login${pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : ""}`}>
              <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm h-8 sm:h-9">
                <User className="h-3.5 w-3.5 text-zinc-400" />
                <span>Sign In</span>
              </Button>
            </Link>
          ) : (
            /* Loading placeholder */
            <div className="h-8 w-20 rounded-lg bg-cinebook-surface animate-pulse" />
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-400 hover:bg-cinebook-surface hover:text-white lg:hidden border border-cinebook-border"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-cinebook-border bg-cinebook-surface px-4 py-4 lg:hidden animate-in slide-in-from-top duration-150">
          <div className="mb-4">
            <SearchBar variant="header" />
          </div>
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-cinebook-accent text-white"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <Ticket className="h-4 w-4" />
              My Bookings
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <User className="h-4 w-4" />
              {currentUser ? "My Profile" : "Sign In / Profile"}
            </Link>
            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/40 text-left"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
