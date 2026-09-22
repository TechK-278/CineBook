import crypto from "crypto";

export interface VerifyPaymentSignatureParams {
  orderId: string;
  paymentId: string;
  signature: string;
  secret?: string;
}

export interface VerifyWebhookSignatureParams {
  rawBody: string;
  signature: string;
  secret?: string;
}

/**
 * Verifies Razorpay payment signature from client checkout callback
 * signature = HMAC_SHA256(order_id + "|" + payment_id, secret)
 */
export function verifyRazorpayPaymentSignature({
  orderId,
  paymentId,
  signature,
  secret,
}: VerifyPaymentSignatureParams): boolean {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const keySecret =
    secret ||
    process.env.RAZORPAY_KEY_SECRET ||
    "cinebook_test_razorpay_secret_key_2026";

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(payload)
    .digest("hex");

  try {
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expectedSignature, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return signature === expectedSignature;
  }
}

/**
 * Verifies Razorpay webhook signature header (x-razorpay-signature) against raw request body
 */
export function verifyRazorpayWebhookSignature({
  rawBody,
  signature,
  secret,
}: VerifyWebhookSignatureParams): boolean {
  if (!rawBody || !signature) {
    return false;
  }

  const webhookSecret =
    secret ||
    process.env.RAZORPAY_WEBHOOK_SECRET ||
    "cinebook_test_webhook_secret_2026";

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  try {
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expectedSignature, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return signature === expectedSignature;
  }
}
