/**
 * CineBook v2 — Booking Transaction & Payment Architecture Test Suite
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  createBookingIntent,
  confirmBookingPayment,
  failBookingPayment,
  getUserBookings,
  getBookingById,
  resetInMemoryBookings,
} from "@/lib/supabase/bookings";
import { lockShowSeats, resetInMemoryLocks } from "@/lib/supabase/show-seats";

describe("Phase 6: Booking Transaction & Payment Pipeline", () => {
  const SHOW_ID = "show-pvr-acropolis-test-1";
  const USER_ALICE = "user-alice-123";
  const USER_BOB = "user-bob-456";

  beforeEach(() => {
    resetInMemoryLocks();
    resetInMemoryBookings();
  });

  describe("1. Server-Side Price Calculation & Booking Intent", () => {
    it("creates a server-authoritative booking intent with 12% convenience fee", async () => {
      // Step 1: Alice locks Recliner A1 (1.5x of 300 = 450) and Standard C1 (1.0x of 300 = 300)
      const seatIds = [`${SHOW_ID}-seat-A1`, `${SHOW_ID}-seat-C1`];
      await lockShowSeats(SHOW_ID, seatIds, USER_ALICE);

      // Step 2: Create booking intent
      const intent = await createBookingIntent({
        showId: SHOW_ID,
        seatIds,
        userId: USER_ALICE,
        customerName: "Alice Smith",
        customerEmail: "alice@example.com",
        customerPhone: "+91 9876543210",
      });

      expect(intent.bookingId).toBeDefined();
      expect(intent.bookingReference).toMatch(/^CB-[A-Z0-9]{8}$/);
      expect(intent.ticketCount).toBe(2);

      // Subtotal = 450 + 300 = 750
      expect(intent.subtotal).toBe(750);
      // Convenience fee = 12% of 750 = 90
      expect(intent.convenienceFee).toBe(90);
      // Grand total = 840
      expect(intent.grandTotal).toBe(840);
    });

    it("persists booking in pending status initially", async () => {
      const seatIds = [`${SHOW_ID}-seat-B1`];
      await lockShowSeats(SHOW_ID, seatIds, USER_ALICE);

      const intent = await createBookingIntent({
        showId: SHOW_ID,
        seatIds,
        userId: USER_ALICE,
        customerName: "Alice Smith",
        customerEmail: "alice@example.com",
        customerPhone: "+91 9876543210",
      });

      const booking = await getBookingById(intent.bookingId, USER_ALICE);
      expect(booking).not.toBeNull();
      expect(booking?.status).toBe("pending");
      expect(booking?.customerName).toBe("Alice Smith");
      expect(booking?.items).toHaveLength(1);
      expect(booking?.items?.[0].seatCode).toBe("B1");
    });
  });

  describe("2. Atomic Payment Confirmation & Idempotency", () => {
    it("atomically confirms booking payment and attaches verified payment record", async () => {
      const seatIds = [`${SHOW_ID}-seat-A2`];
      await lockShowSeats(SHOW_ID, seatIds, USER_ALICE);

      const intent = await createBookingIntent({
        showId: SHOW_ID,
        seatIds,
        userId: USER_ALICE,
        customerName: "Alice Smith",
        customerEmail: "alice@example.com",
        customerPhone: "+91 9876543210",
      });

      const confirmRes = await confirmBookingPayment({
        bookingId: intent.bookingId,
        razorpayOrderId: "order_12345",
        razorpayPaymentId: "pay_67890",
        razorpaySignature: "valid_signature_abc",
      });

      expect(confirmRes.status).toBe("confirmed");
      expect(confirmRes.bookingId).toBe(intent.bookingId);

      // Verify updated booking record
      const confirmedBooking = await getBookingById(intent.bookingId, USER_ALICE);
      expect(confirmedBooking?.status).toBe("confirmed");
      expect(confirmedBooking?.payment?.status).toBe("paid");
      expect(confirmedBooking?.payment?.razorpayPaymentId).toBe("pay_67890");
    });

    it("prevents double confirmation and operates idempotently", async () => {
      const seatIds = [`${SHOW_ID}-seat-A3`];
      await lockShowSeats(SHOW_ID, seatIds, USER_ALICE);

      const intent = await createBookingIntent({
        showId: SHOW_ID,
        seatIds,
        userId: USER_ALICE,
        customerName: "Alice Smith",
        customerEmail: "alice@example.com",
        customerPhone: "+91 9876543210",
      });

      // Call 1: Success
      const firstConfirm = await confirmBookingPayment({
        bookingId: intent.bookingId,
        razorpayOrderId: "order_12345",
        razorpayPaymentId: "pay_67890",
        razorpaySignature: "valid_sig",
      });

      // Call 2 (Duplicate / Webhook retry): Must succeed idempotently
      const secondConfirm = await confirmBookingPayment({
        bookingId: intent.bookingId,
        razorpayOrderId: "order_12345",
        razorpayPaymentId: "pay_67890",
        razorpaySignature: "valid_sig",
      });

      expect(firstConfirm.status).toBe("confirmed");
      expect(secondConfirm.status).toBe("confirmed");
    });
  });

  describe("3. Security & Authorization Enforcement", () => {
    it("prevents User Bob from viewing or accessing User Alice's booking details", async () => {
      const seatIds = [`${SHOW_ID}-seat-B2`];
      await lockShowSeats(SHOW_ID, seatIds, USER_ALICE);

      const intent = await createBookingIntent({
        showId: SHOW_ID,
        seatIds,
        userId: USER_ALICE,
        customerName: "Alice Smith",
        customerEmail: "alice@example.com",
        customerPhone: "+91 9876543210",
      });

      // Alice can view her own booking
      const aliceView = await getBookingById(intent.bookingId, USER_ALICE);
      expect(aliceView).not.toBeNull();

      // Bob attempting to view Alice's booking receives null (unauthorized)
      const bobView = await getBookingById(intent.bookingId, USER_BOB);
      expect(bobView).toBeNull();
    });

    it("retrieves only bookings belonging to the requesting user", async () => {
      // Alice creates 2 bookings
      await lockShowSeats(SHOW_ID, [`${SHOW_ID}-seat-A4`], USER_ALICE);
      await createBookingIntent({
        showId: SHOW_ID,
        seatIds: [`${SHOW_ID}-seat-A4`],
        userId: USER_ALICE,
        customerName: "Alice Smith",
        customerEmail: "alice@example.com",
        customerPhone: "+91 9876543210",
      });

      // Bob creates 1 booking
      await lockShowSeats(SHOW_ID, [`${SHOW_ID}-seat-B4`], USER_BOB);
      await createBookingIntent({
        showId: SHOW_ID,
        seatIds: [`${SHOW_ID}-seat-B4`],
        userId: USER_BOB,
        customerName: "Bob Jones",
        customerEmail: "bob@example.com",
        customerPhone: "+91 9876543211",
      });

      const aliceBookings = await getUserBookings(USER_ALICE);
      const bobBookings = await getUserBookings(USER_BOB);

      expect(aliceBookings).toHaveLength(1);
      expect(bobBookings).toHaveLength(1);
      expect(aliceBookings[0].userId).toBe(USER_ALICE);
      expect(bobBookings[0].userId).toBe(USER_BOB);
    });
  });
});
