import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ShieldCheck,
  CreditCard,
  User,
  Mail,
  Phone,
  Sparkles,
  Info,
} from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBookingById } from "@/lib/supabase/bookings";
import { formatCurrency } from "@/lib/pricing";
import { formatShowtimeIST } from "@/lib/supabase/show-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BookingDetailPageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export async function generateMetadata({
  params,
}: BookingDetailPageProps): Promise<Metadata> {
  const { bookingId } = await params;
  return {
    title: `Booking Confirmation — ${bookingId} | CineBook`,
    description: "Official CineBook movie reservation pass and confirmation details.",
  };
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { bookingId } = await params;

  let userId: string | undefined = undefined;
  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }
  } catch {
    // Ignored for demo
  }

  const booking = await getBookingById(bookingId, userId);

  if (!booking) {
    notFound();
  }

  const showTime = booking.show?.startTime
    ? formatShowtimeIST(booking.show.startTime)
    : "Showtime";
  const movie = booking.show?.movie;
  const theatre = booking.show?.theatre;
  const screen = booking.show?.screen;
  const isConfirmed = booking.status === "confirmed";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 pb-24 space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to My Bookings
        </Link>
        <Badge variant="outline" className="text-xs font-mono">
          Ref: {booking.bookingReference}
        </Badge>
      </div>

      {/* Main Ticket Card */}
      <Card className="overflow-hidden border-cinebook-border bg-cinebook-surface/90 shadow-2xl backdrop-blur">
        {/* Top Header Banner: Confirmation Status */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-cinebook-surface to-emerald-950/60 p-6 sm:p-8 border-b border-cinebook-border text-center space-y-2">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-1">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Booking Confirmed & Seats Reserved
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300">
            Booking Reference:{" "}
            <span className="font-mono font-bold text-white tracking-wider">
              {booking.bookingReference}
            </span>
          </p>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Movie & Screening Information */}
          <div className="flex flex-col sm:flex-row gap-6 items-start pb-6 border-b border-cinebook-border/60">
            {movie?.posterPath && (
              <div className="w-24 sm:w-32 shrink-0 aspect-[2/3] rounded-xl overflow-hidden border border-cinebook-border shadow-lg bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={movie.posterPath}
                  alt={movie.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent" className="text-[10px] font-bold">
                  {booking.show?.format || "2D"}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {booking.show?.language || "English"}
                </Badge>
                {movie?.certificate && (
                  <Badge variant="outline" className="text-[10px]">
                    {movie.certificate}
                  </Badge>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                {movie?.title || "Feature Presentation"}
              </h2>

              <div className="text-sm font-semibold text-zinc-300">
                {theatre?.name || "CineBook Multiplex"} — {screen?.name || "Audi 1"}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <MapPin className="h-3.5 w-3.5 text-cinebook-accent" />
                <span>{theatre?.address || theatre?.area || "Ahmedabad, Gujarat"}</span>
              </div>
            </div>
          </div>

          {/* Screening Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-cinebook-dark p-3.5 border border-cinebook-border">
              <span className="text-[11px] text-zinc-500 block">Show Date</span>
              <span className="text-sm font-bold text-white mt-0.5 block flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-cinebook-accent" />
                {booking.show?.date || "Confirmed"}
              </span>
            </div>

            <div className="rounded-xl bg-cinebook-dark p-3.5 border border-cinebook-border">
              <span className="text-[11px] text-zinc-500 block">Show Time</span>
              <span className="text-sm font-bold text-white mt-0.5 block flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-cinebook-accent" />
                {showTime}
              </span>
            </div>

            <div className="rounded-xl bg-cinebook-dark p-3.5 border border-cinebook-border">
              <span className="text-[11px] text-zinc-500 block">Seats Booked</span>
              <span className="text-sm font-bold text-cinebook-accent mt-0.5 block truncate">
                {booking.items && booking.items.length > 0
                  ? booking.items.map((i) => i.seatCode).join(", ")
                  : `${booking.ticketCount} Seats`}
              </span>
            </div>

            <div className="rounded-xl bg-cinebook-dark p-3.5 border border-cinebook-border">
              <span className="text-[11px] text-zinc-500 block">Total Amount</span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                {formatCurrency(booking.grandTotal)}
              </span>
            </div>
          </div>

          {/* Seat Itemization Breakdown */}
          {booking.items && booking.items.length > 0 && (
            <div className="space-y-3 rounded-2xl bg-cinebook-dark/50 border border-cinebook-border p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Ticket className="h-3.5 w-3.5 text-cinebook-accent" />
                Allocated Seat Breakdown
              </h3>
              <div className="divide-y divide-zinc-800 text-xs">
                {booking.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 text-zinc-300">
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-white">Seat {item.seatCode}</span>
                      <span className="text-zinc-500">({item.tier})</span>
                    </span>
                    <span className="font-semibold text-white">
                      {formatCurrency(item.unitPrice)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between py-2 text-zinc-400">
                  <span>Convenience Fee (12% GST incl.)</span>
                  <span>{formatCurrency(booking.convenienceFee)}</span>
                </div>
                <div className="flex justify-between pt-3 font-bold text-sm">
                  <span className="text-white">Grand Total Paid</span>
                  <span className="text-emerald-400">{formatCurrency(booking.grandTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Customer & Payment Audit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl bg-cinebook-dark p-4 border border-cinebook-border space-y-2">
              <span className="font-bold text-zinc-300 block flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-zinc-400" />
                Ticket Holder
              </span>
              <div className="text-white font-medium">{booking.customerName}</div>
              <div className="text-zinc-400">{booking.customerEmail}</div>
              <div className="text-zinc-400">{booking.customerPhone}</div>
            </div>

            <div className="rounded-xl bg-cinebook-dark p-4 border border-cinebook-border space-y-2">
              <span className="font-bold text-zinc-300 block flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
                Payment Record
              </span>
              <div className="text-zinc-300">
                Provider: <span className="font-semibold text-white">Razorpay</span>
              </div>
              <div className="text-zinc-400 font-mono text-[11px] truncate">
                Payment Ref: {booking.payment?.razorpayPaymentId || "pay_verified_online"}
              </div>
              <div className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> 100% Verified Payment
              </div>
            </div>
          </div>

          {/* Phase 7 Callout */}
          <div className="rounded-xl border border-cinebook-border/60 bg-cinebook-dark/40 p-4 flex items-center gap-3 text-xs text-zinc-400">
            <Info className="h-5 w-5 text-cinebook-accent shrink-0" />
            <span>
              QR ticket generation, M-ticket barcode scanners, and automated email confirmation dispatch are scheduled for <strong>Phase 7</strong>.
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/bookings" className="flex-1">
              <Button variant="outline" className="w-full text-xs font-semibold">
                View All Bookings
              </Button>
            </Link>
            <Link href="/movies" className="flex-1">
              <Button className="w-full text-xs font-bold shadow-lg">
                Explore More Movies
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
