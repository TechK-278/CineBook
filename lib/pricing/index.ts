/**
 * CineBook v2 — Centralized Pricing Module
 * Formula:
 *  - Subtotal = unitPrice * seatCount
 *  - ConvenienceFee = round(Subtotal * 0.12)
 *  - GrandTotal = Subtotal + ConvenienceFee
 */

import { PricingBreakdown } from "@/types";

export const CONVENIENCE_FEE_RATE = 0.12;

/**
 * Calculate pricing for a ticket reservation
 * @param unitPrice Base or tier-adjusted price per ticket (₹)
 * @param seatCount Number of selected seats
 * @returns PricingBreakdown
 */
export function calculatePricing(unitPrice: number, seatCount: number): PricingBreakdown {
  const count = Math.max(0, Math.floor(seatCount) || 0);
  const price = Math.max(0, Number(unitPrice) || 0);

  const subtotal = count * price;
  const convenienceFee = count > 0 ? Math.round(subtotal * CONVENIENCE_FEE_RATE) : 0;
  const grandTotal = subtotal + convenienceFee;

  return {
    unitPrice: price,
    seatCount: count,
    subtotal,
    convenienceFee,
    grandTotal,
  };
}

/**
 * Format currency in Indian Rupee format (₹)
 * @param amount 
 * @returns string (e.g. "₹358")
 */
export function formatCurrency(amount: number): string {
  const safeAmount = Math.max(0, Number(amount) || 0);
  return `₹${safeAmount.toLocaleString("en-IN")}`;
}
