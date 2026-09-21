import { describe, it, expect } from "vitest";
import { calculatePricing, formatCurrency } from "./index";

describe("Pricing Engine", () => {
  it("calculates 0 seats pricing correctly", () => {
    const result = calculatePricing(320, 0);
    expect(result.seatCount).toBe(0);
    expect(result.subtotal).toBe(0);
    expect(result.convenienceFee).toBe(0);
    expect(result.grandTotal).toBe(0);
  });

  it("calculates 1 ticket at ₹320 (₹320 + ₹38 = ₹358)", () => {
    const result = calculatePricing(320, 1);
    expect(result.seatCount).toBe(1);
    expect(result.subtotal).toBe(320);
    expect(result.convenienceFee).toBe(38);
    expect(result.grandTotal).toBe(358);
  });

  it("calculates 3 tickets at ₹320 (₹960 + ₹115 = ₹1075)", () => {
    const result = calculatePricing(320, 3);
    expect(result.seatCount).toBe(3);
    expect(result.subtotal).toBe(960);
    expect(result.convenienceFee).toBe(115);
    expect(result.grandTotal).toBe(1075);
  });

  it("calculates 8 tickets at ₹320 (₹2560 + ₹307 = ₹2867)", () => {
    const result = calculatePricing(320, 8);
    expect(result.seatCount).toBe(8);
    expect(result.subtotal).toBe(2560);
    expect(result.convenienceFee).toBe(307);
    expect(result.grandTotal).toBe(2867);
  });

  it("formats currency accurately in INR", () => {
    expect(formatCurrency(358)).toBe("₹358");
    expect(formatCurrency(2867)).toBe("₹2,867");
    expect(formatCurrency(0)).toBe("₹0");
  });
});
