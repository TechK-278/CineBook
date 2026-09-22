"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createBookingIntent, confirmBookingPayment, failBookingPayment } from "@/lib/supabase/bookings";
import { createRazorpayOrder, verifyRazorpayPaymentSignature, getRazorpayKeyId } from "@/lib/razorpay";
import { Booking } from "@/types";

export interface CreateCheckoutOrderInput {
  showId: string;
  seatIds: string[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  idempotencyKey?: string;
}

export interface CreateCheckoutOrderResult {
  success: boolean;
  bookingId?: string;
  bookingReference?: string;
  razorpayOrderId?: string;
  amountInPaise?: number;
  amountInRupees?: number;
  currency?: string;
  keyId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  error?: string;
}

export interface VerifyPaymentInput {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  bookingId?: string;
  bookingReference?: string;
  grandTotal?: number;
  error?: string;
}

/**
 * Server Action: Creates server-authoritative booking intent & Razorpay order
 */
export async function createCheckoutOrderAction(
  input: CreateCheckoutOrderInput
): Promise<CreateCheckoutOrderResult> {
  try {
    // 1. Authenticate user
    let userId = "demo-customer";
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
      // Allow demo session if unconfigured
    }

    if (!input.showId || !input.seatIds || input.seatIds.length === 0) {
      return { success: false, error: "Please select valid seats for the show." };
    }

    if (!input.customerName || !input.customerEmail || !input.customerPhone) {
      return { success: false, error: "Please provide your complete contact details." };
    }

    // 2. Create authoritative booking intent in Supabase
    const bookingIntent = await createBookingIntent({
      showId: input.showId,
      seatIds: input.seatIds,
      userId,
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail.trim(),
      customerPhone: input.customerPhone.trim(),
      idempotencyKey: input.idempotencyKey,
    });

    // 3. Create Razorpay order for grand_total * 100 paise
    const amountInPaise = Math.round(bookingIntent.grandTotal * 100);
    const razorpayOrder = await createRazorpayOrder({
      amountInPaise,
      currency: bookingIntent.currency || "INR",
      receipt: bookingIntent.bookingReference,
      notes: {
        bookingId: bookingIntent.bookingId,
        bookingReference: bookingIntent.bookingReference,
        showId: input.showId,
        userId,
      },
    });

    return {
      success: true,
      bookingId: bookingIntent.bookingId,
      bookingReference: bookingIntent.bookingReference,
      razorpayOrderId: razorpayOrder.id,
      amountInPaise,
      amountInRupees: bookingIntent.grandTotal,
      currency: bookingIntent.currency,
      keyId: getRazorpayKeyId(),
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
    };
  } catch (err: any) {
    console.warn("[Checkout Action] Order creation failed:", err);
    return {
      success: false,
      error:
        err.message?.includes("SEAT_LOCK_EXPIRED")
          ? "Your seat lock has expired. Please select seats again."
          : err.message?.includes("SHOW_PAST")
          ? "This screening has already commenced."
          : err.message || "Failed to initialize checkout. Please try again.",
    };
  }
}

/**
 * Server Action: Verifies Razorpay HMAC signature and confirms booking atomically
 */
export async function verifyPaymentAndConfirmAction(
  input: VerifyPaymentInput
): Promise<VerifyPaymentResult> {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;

    if (!bookingId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return { success: false, error: "Invalid payment confirmation parameters." };
    }

    // 1. Verify HMAC-SHA256 signature
    const isValidSignature = verifyRazorpayPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValidSignature) {
      console.warn("[Checkout Action] Payment signature verification failed.");
      await failBookingPayment(bookingId, "Signature verification failed");
      return { success: false, error: "Payment verification failed. Invalid signature." };
    }

    // 2. Confirm booking atomically in database
    const confirmedBooking = await confirmBookingPayment({
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      rawResponse: {
        verifiedAt: new Date().toISOString(),
        channel: "client_callback",
      },
    });

    return {
      success: true,
      bookingId: confirmedBooking.bookingId,
      bookingReference: confirmedBooking.bookingReference,
      grandTotal: confirmedBooking.grandTotal,
    };
  } catch (err: any) {
    console.warn("[Checkout Action] Payment confirmation failed:", err);
    return {
      success: false,
      error: err.message || "Failed to confirm booking payment.",
    };
  }
}
