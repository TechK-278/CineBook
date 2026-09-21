"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Clapperboard, Tag, User, Menu, X, Sparkles } from "lucide-react";
import { LocationSelector } from "./LocationSelector";
import { SearchBar } from "@/components/discovery/SearchBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/movies", label: "Movies", icon: Clapperboard },
    { href: "/cinemas", label: "Cinemas", icon: Film },
    { href: "/offers", label: "Offers", icon: Tag },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cinebook-border bg-cinebook-dark/95 backdrop-blur supports-[backdrop-filter]:bg-cinebook-dark/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cinebook-accent text-white shadow-md transition-transform group-hover:scale-105">
              <Film className="h-5 w-5" />
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

        {/* Right Action Items: Location & Login */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Location Selector */}
          <LocationSelector />

          {/* Profile / Login Trigger */}
          <Link href="/profile" className="hidden sm:inline-flex">
            <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
              <User className="h-4 w-4 text-zinc-400" />
              <span>Sign In</span>
            </Button>
          </Link>

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
              <Film className="h-4 w-4" />
              My Bookings
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <User className="h-4 w-4" />
              Account & Profile
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
