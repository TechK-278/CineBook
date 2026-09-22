"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  ShieldCheck,
  CreditCard,
  User,
  Mail,
  Phone,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Lock,
} from "lucide-react";
import { Show, ShowSeat } from "@/types";
import { formatShowtimeIST } from "@/lib/supabase/show-utils";
import { calculateSeatsPricing, formatCurrency } from "@/lib/pricing";
import { createCheckoutOrderAction, verifyPaymentAndConfirmAction } from "@/app/actions/checkout";
import { SeatCountdownBanner } from "@/components/seats/SeatCountdownBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutClientProps {
  show: Show;
  lockedSeats: ShowSeat[];
  initialCustomer?: {
    name: string;
    email: string;
    phone: string;
  };
}

export function CheckoutClient({
  show,
  lockedSeats,
  initialCustomer,
}: CheckoutClientProps) {
  const router = useRouter();

  const [customerName, setCustomerName] = useState(initialCustomer?.name || "");
  const [customerEmail, setCustomerEmail] = useState(initialCustomer?.email || "");
  const [customerPhone, setCustomerPhone] = useState(initialCustomer?.phone || "");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayReady, setRazorpayReady] = useState(false);

  // Check expiration timestamp
  const expiresAt = lockedSeats.length > 0 && lockedSeats[0].lockExpiresAt
    ? lockedSeats[0].lockExpiresAt
    : null;

  const seatsForPricing = lockedSeats.map((s) => ({
    tier: s.seat?.tier || "Standard",
    priceMultiplier: s.seat?.priceMultiplier,
  }));

  const pricing = calculateSeatsPricing(show.basePrice, seatsForPricing);
  const formattedTime = formatShowtimeIST(show.startTime);

  const handleExpired = () => {
    setError("Your seat lock has expired. Please select seats again.");
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setError("Please fill in your name, email, and phone number.");
      return;
    }

    if (lockedSeats.length === 0) {
      setError("No seats selected. Please go back and select seats.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create Order on Server
      const orderRes = await createCheckoutOrderAction({
        showId: show.id,
        seatIds: lockedSeats.map((s) => s.seatId),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
      });

      if (!orderRes.success || !orderRes.razorpayOrderId || !orderRes.bookingId) {
        setError(orderRes.error || "Failed to initialize payment order.");
        setIsLoading(false);
        return;
      }

      const bookingId = orderRes.bookingId;
      const orderId = orderRes.razorpayOrderId;
      const keyId = orderRes.keyId || "rzp_test_demo";

      // 2. Open Razorpay Checkout Modal (or simulate for test/offline environments)
      if (typeof window !== "undefined" && window.Razorpay && !keyId.includes("demo")) {
        const options = {
          key: keyId,
          amount: orderRes.amountInPaise,
          currency: orderRes.currency || "INR",
          name: "CineBook",
          description: `${show.movie?.title} — ${lockedSeats.length} Tickets`,
          image: "/logo.png",
          order_id: orderId,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: "#E50914",
          },
          handler: async (response: any) => {
            try {
              // 3. Verify Payment Signature on Server
              const verifyRes = await verifyPaymentAndConfirmAction({
                bookingId,
                razorpayOrderId: response.razorpay_order_id || orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                router.push(`/bookings/${bookingId}`);
              } else {
                setError(verifyRes.error || "Payment verification failed.");
                setIsLoading(false);
              }
            } catch (vErr: any) {
              setError(vErr.message || "Error verifying payment signature.");
              setIsLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          setError(response.error?.description || "Payment failed. Please try again.");
          setIsLoading(false);
        });
        rzp.open();
      } else {
        // Fallback Simulation for offline test/demo environments
        setTimeout(async () => {
          const mockPaymentId = `pay_mock_${Date.now()}`;
          const crypto = await import("crypto");
          const secret = "cinebook_test_razorpay_secret_key_2026";
          const signature = crypto
            .createHmac("sha256", secret)
            .update(`${orderId}|${mockPaymentId}`)
            .digest("hex");

          const verifyRes = await verifyPaymentAndConfirmAction({
            bookingId,
            razorpayOrderId: orderId,
            razorpayPaymentId: mockPaymentId,
            razorpaySignature: signature,
          });

          if (verifyRes.success) {
            router.push(`/bookings/${bookingId}`);
          } else {
            setError(verifyRes.error || "Payment confirmation failed.");
            setIsLoading(false);
          }
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during checkout.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayReady(true)}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header & Back Link */}
        <div className="flex items-center justify-between border-b border-cinebook-border pb-4">
          <Link
            href={`/shows/${show.id}/seats`}
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Change Seats
          </Link>
          <Badge variant="outline" className="text-xs">
            Checkout & Payment
          </Badge>
        </div>

        {/* Lock Expiration Alert */}
        {expiresAt && (
          <SeatCountdownBanner expiresAt={expiresAt} onExpire={handleExpired} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Screening summary & customer details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Movie & Showtime Card */}
            <Card className="border-cinebook-border bg-cinebook-surface/70 shadow-xl overflow-hidden backdrop-blur">
              <div className="flex gap-4 p-5 sm:p-6 items-start border-b border-cinebook-border/60">
                {show.movie?.posterPath && (
                  <div className="w-20 sm:w-24 shrink-0 aspect-[2/3] rounded-xl overflow-hidden border border-cinebook-border shadow-md bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={show.movie.posterPath}
                      alt={show.movie.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="accent" className="text-[10px] font-bold">
                      {show.format}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {show.language}
                    </Badge>
                    {show.movie?.certificate && (
                      <Badge variant="outline" className="text-[10px]">
                        {show.movie.certificate}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    {show.movie?.title}
                  </h2>
                  <div className="text-xs font-semibold text-zinc-300">
                    {show.theatre?.name}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                    <MapPin className="h-3 w-3 text-cinebook-accent" />
                    <span>{show.theatre?.area || show.theatre?.city || "Ahmedabad"}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-cinebook-border/60 bg-cinebook-dark/60 p-3.5 text-center text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Date</span>
                  <span className="font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3 text-cinebook-accent" />
                    {show.date}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Time</span>
                  <span className="font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3 text-cinebook-accent" />
                    {formattedTime}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Screen</span>
                  <span className="font-bold text-white mt-0.5 block truncate px-1">
                    {show.screen?.name || "Audi 1"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Customer Details Form */}
            <Card className="border-cinebook-border bg-cinebook-surface/70 shadow-xl backdrop-blur">
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-cinebook-border/60 pb-3">
                  <User className="h-4 w-4 text-cinebook-accent" />
                  <h3 className="text-sm font-bold text-white">Contact & Ticket Delivery Details</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={customerName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                        className="bg-cinebook-dark border-zinc-700 text-white text-xs h-9"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-zinc-300 mb-1">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="email"
                          required
                          placeholder="john@example.com"
                          value={customerEmail}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerEmail(e.target.value)}
                          className="bg-cinebook-dark border-zinc-700 text-white text-xs h-9"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-300 mb-1">
                        Mobile Number <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={customerPhone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerPhone(e.target.value)}
                          className="bg-cinebook-dark border-zinc-700 text-white text-xs h-9"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-1">
                  <Mail className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Your booking confirmation & M-Ticket will be sent to this email and phone.</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Pricing Breakdown & Payment Action (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-cinebook-border bg-cinebook-surface/90 shadow-2xl backdrop-blur">
              <CardContent className="p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-cinebook-border/60 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-cinebook-accent" />
                    Seats & Order Summary
                  </h3>
                  <Badge variant="accent" className="text-xs">
                    {lockedSeats.length} {lockedSeats.length === 1 ? "Ticket" : "Tickets"}
                  </Badge>
                </div>

                {/* Selected Seats Badges */}
                <div className="space-y-1.5">
                  <span className="text-xs text-zinc-400">Reserved Seats:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {lockedSeats.map((s) => (
                      <span
                        key={s.seatId}
                        className="inline-flex items-center gap-1 rounded-md bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-xs font-semibold text-white"
                      >
                        <span>{s.seat?.seatCode}</span>
                        <span className="text-[10px] text-zinc-400">({s.seat?.tier})</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 border-t border-cinebook-border/60 pt-4 text-xs">
                  {pricing.tierBreakdown.map((item) => (
                    <div key={item.tier} className="flex justify-between text-zinc-300">
                      <span>
                        {item.tier} ({item.count} × {formatCurrency(item.unitPrice)})
                      </span>
                      <span className="font-medium text-white">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}

                  <div className="flex justify-between text-zinc-400 pt-1">
                    <span>Convenience Fee (12% GST incl.)</span>
                    <span>{formatCurrency(pricing.convenienceFee)}</span>
                  </div>

                  <div className="flex justify-between border-t border-cinebook-border/60 pt-3 text-base font-black">
                    <span className="text-white">Amount Payable</span>
                    <span className="text-emerald-400">{formatCurrency(pricing.grandTotal)}</span>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Pay Button */}
                <div className="space-y-2 pt-2">
                  <Button
                    type="button"
                    onClick={handlePay}
                    disabled={isLoading || lockedSeats.length === 0}
                    className="w-full h-11 text-sm font-bold shadow-xl gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Pay {formatCurrency(pricing.grandTotal)} via Razorpay
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 pt-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-cinebook-accent" />
                    <span>100% Safe & Secure 256-bit Encrypted Payment</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
