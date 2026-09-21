/**
 * CineBook v2 — Razorpay Payment Gateway Foundation
 * Server-side payment helper abstraction.
 * Note: Payment processing and webhook verification will be implemented in a dedicated phase.
 */

export function isRazorpayConfigured(): boolean {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) return false;
  if (keyId.includes("your_key_id") || keySecret.includes("your_razorpay_key_secret")) {
    return false;
  }
  return true;
}

export interface RazorpayOrderOptions {
  amountInPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayVerificationPayload {
  orderId: string;
  paymentId: string;
  signature: string;
}

export const razorpayService = {
  isConfigured: isRazorpayConfigured,
  getKeyId: () => process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || null,
};
