import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay/verify";
import { confirmBookingPayment, failBookingPayment, getBookingById } from "@/lib/supabase/bookings";

/**
 * Razorpay Webhook Handler
 * Reconciles payments asynchronously and idempotently using HMAC-SHA256 signature verification.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Read raw text body before parsing JSON
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    // 2. Verify webhook signature
    const isValid = verifyRazorpayWebhookSignature({
      rawBody,
      signature,
    });

    if (!isValid) {
      console.warn("[Razorpay Webhook] Invalid webhook signature received.");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    // 3. Parse JSON event payload
    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payload = event.payload?.payment?.entity || event.payload?.order?.entity;

    if (!payload) {
      return NextResponse.json({ received: true, status: "ignored" });
    }

    const orderId = payload.order_id || payload.id;
    const paymentId = payload.id;
    const bookingId = payload.notes?.bookingId;

    if (!bookingId) {
      console.warn("[Razorpay Webhook] Event missing bookingId in notes:", eventType);
      return NextResponse.json({ received: true, status: "missing_booking_id" });
    }

    // 4. Handle Event Types
    if (eventType === "payment.captured" || eventType === "order.paid") {
      await confirmBookingPayment({
        bookingId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        rawResponse: {
          webhookEvent: eventType,
          eventTimestamp: event.created_at,
          amount: payload.amount,
        },
      });

      return NextResponse.json({
        received: true,
        status: "confirmed",
        bookingId,
      });
    }

    if (eventType === "payment.failed") {
      const errorDesc = payload.error_description || "Payment failed";
      await failBookingPayment(bookingId, errorDesc);

      return NextResponse.json({
        received: true,
        status: "failed",
        bookingId,
      });
    }

    return NextResponse.json({ received: true, status: "unhandled_event" });
  } catch (err: any) {
    console.warn("[Razorpay Webhook] Processing error:", err);
    return NextResponse.json(
      { error: "Internal webhook processing error" },
      { status: 500 }
    );
  }
}
