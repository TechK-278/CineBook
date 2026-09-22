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
 * Calculate pricing for a collection of seats with individual tier multipliers
 */
export function calculateSeatsPricing(
  basePrice: number,
  seats: Array<{ tier?: string; priceMultiplier?: number }>
): PricingBreakdown & {
  tierBreakdown: Array<{ tier: string; count: number; unitPrice: number; subtotal: number }>;
} {
  const safeBase = Math.max(0, Number(basePrice) || 0);
  const count = seats.length;

  if (count === 0) {
    return {
      unitPrice: safeBase,
      seatCount: 0,
      subtotal: 0,
      convenienceFee: 0,
      grandTotal: 0,
      tierBreakdown: [],
    };
  }

  // Calculate tier subtotals
  const tierMap = new Map<string, { count: number; unitPrice: number; subtotal: number }>();
  let subtotal = 0;

  seats.forEach((seat) => {
    const tier = seat.tier || "Standard";
    const multiplier = Number(seat.priceMultiplier) || (tier === "Recliner" ? 1.5 : tier === "Premium" ? 1.2 : 1.0);
    const unitPrice = Math.round(safeBase * multiplier);
    subtotal += unitPrice;

    if (!tierMap.has(tier)) {
      tierMap.set(tier, { count: 0, unitPrice, subtotal: 0 });
    }
    const entry = tierMap.get(tier)!;
    entry.count += 1;
    entry.subtotal += unitPrice;
  });

  const convenienceFee = Math.round(subtotal * CONVENIENCE_FEE_RATE);
  const grandTotal = subtotal + convenienceFee;
  const avgUnitPrice = Math.round(subtotal / count);

  return {
    unitPrice: avgUnitPrice,
    seatCount: count,
    subtotal,
    convenienceFee,
    grandTotal,
    tierBreakdown: Array.from(tierMap.entries()).map(([tier, data]) => ({
      tier,
      count: data.count,
      unitPrice: data.unitPrice,
      subtotal: data.subtotal,
    })),
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
