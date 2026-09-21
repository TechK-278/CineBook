import React from "react";
import Link from "next/link";
import { Film, Clapperboard, Tag, Shield, HelpCircle, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-cinebook-border bg-cinebook-surface/70 text-zinc-400 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-cinebook-border">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cinebook-accent text-white">
                <Film className="h-4 w-4" />
              </div>
              <span className="text-lg font-black tracking-wider">
                CINE<span className="text-cinebook-accent">BOOK</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your destination for discovering blockbusters, exploring luxury cinema screens, and instant movie-ticket reservations.
            </p>
          </div>

          {/* Col 2: Marketplace */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Marketplace</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/movies" className="hover:text-white transition-colors">
                  Now Showing Movies
                </Link>
              </li>
              <li>
                <Link href="/movies?category=upcoming" className="hover:text-white transition-colors">
                  Upcoming Releases
                </Link>
              </li>
              <li>
                <Link href="/cinemas" className="hover:text-white transition-colors">
                  Ahmedabad Cinemas
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-white transition-colors">
                  Exclusive Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Account & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">My Account</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/bookings" className="hover:text-white transition-colors">
                  My Reservations
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  Profile & Preferences
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-white transition-colors">
                  Promo Codes
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Platform & Trust</h4>
            <div className="space-y-2 text-xs text-zinc-400">
              <p className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-cinebook-accent" />
                Zero-Trust Secure Checkout
              </p>
              <p className="flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5 text-cinebook-accent" />
                Certified Multiplex Partners
              </p>
              <p className="text-[11px] text-zinc-500 pt-1">
                Demo Platform. Built for cinema marketplace simulation.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} CineBook Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-400 cursor-pointer">Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
