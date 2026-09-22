/**
 * CineBook v2 — Razorpay Integration & Signature Verification Test Suite
 */

import { describe, it, expect } from "vitest";
import crypto from "crypto";
import {
  createRazorpayOrder,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "@/lib/razorpay";

describe("Phase 6: Razorpay Payment & Webhook Signatures", () => {
  const TEST_SECRET = "cinebook_test_razorpay_secret_key_2026";
  const TEST_WEBHOOK_SECRET = "cinebook_test_webhook_secret_2026";

  describe("1. Order Creation & Paise Representation", () => {
    it("creates a Razorpay order with amount correctly converted to paise", async () => {
      const order = await createRazorpayOrder({
        amountInPaise: 80600, // ₹806 in paise
        currency: "INR",
        receipt: "CB-TEST1234",
        notes: { bookingId: "b_123" },
      });

      expect(order.id).toBeDefined();
      expect(order.amount).toBe(80600);
      expect(order.currency).toBe("INR");
      expect(order.receipt).toBe("CB-TEST1234");
      expect(order.status).toBe("created");
    });

    it("enforces minimum order amount in paise", async () => {
      const order = await createRazorpayOrder({
        amountInPaise: 50, // Less than ₹1 (100 paise)
        receipt: "CB-TEST-MIN",
      });

      expect(order.amount).toBe(100);
    });
  });

  describe("2. Payment Signature Verification", () => {
    it("successfully verifies a valid payment HMAC-SHA256 signature", () => {
      const orderId = "order_test_987654";
      const paymentId = "pay_test_123456";
      const expectedSignature = crypto
        .createHmac("sha256", TEST_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const isValid = verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: expectedSignature,
        secret: TEST_SECRET,
      });

      expect(isValid).toBe(true);
    });

    it("rejects an invalid payment signature", () => {
      const isValid = verifyRazorpayPaymentSignature({
        orderId: "order_test_987654",
        paymentId: "pay_test_123456",
        signature: "invalid_tampered_signature_hex_12345",
        secret: TEST_SECRET,
      });

      expect(isValid).toBe(false);
    });

    it("rejects when signature parameters are missing", () => {
      expect(
        verifyRazorpayPaymentSignature({
          orderId: "",
          paymentId: "pay_123",
          signature: "sig_123",
          secret: TEST_SECRET,
        })
      ).toBe(false);
    });
  });

  describe("3. Webhook Signature Verification", () => {
    it("successfully verifies a valid raw body webhook signature", () => {
      const rawBody = JSON.stringify({
        event: "payment.captured",
        payload: {
          payment: { entity: { id: "pay_xyz", amount: 80600 } },
        },
      });

      const signature = crypto
        .createHmac("sha256", TEST_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

      const isValid = verifyRazorpayWebhookSignature({
        rawBody,
        signature,
        secret: TEST_WEBHOOK_SECRET,
      });

      expect(isValid).toBe(true);
    });

    it("rejects webhook signature when payload has been tampered", () => {
      const originalBody = JSON.stringify({ event: "payment.captured", amount: 80600 });
      const tamperedBody = JSON.stringify({ event: "payment.captured", amount: 100 });

      const signature = crypto
        .createHmac("sha256", TEST_WEBHOOK_SECRET)
        .update(originalBody)
        .digest("hex");

      const isValid = verifyRazorpayWebhookSignature({
        rawBody: tamperedBody,
        signature,
        secret: TEST_WEBHOOK_SECRET,
      });

      expect(isValid).toBe(false);
    });
  });
});
