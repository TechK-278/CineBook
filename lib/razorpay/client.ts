/**
 * CineBook v2 — Razorpay Client Configuration & Status
 */

export function isRazorpayConfigured(): boolean {
  const keyId =
    process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return Boolean(keyId && keySecret && !keyId.includes("placeholder"));
}

export function getRazorpayKeyId(): string {
  return (
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID ||
    "rzp_test_cinebook_demo_key"
  );
}

export function getRazorpayKeySecret(): string {
  return (
    process.env.RAZORPAY_KEY_SECRET || "cinebook_test_razorpay_secret_key_2026"
  );
}
