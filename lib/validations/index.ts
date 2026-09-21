/**
 * CineBook v2 — Zod Validation Schemas
 * Type-safe input validations for forms and API routes
 */

import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(60),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^(\+91\s?)?[6-9]\d{9}$/, "Please enter a valid Indian mobile number (e.g. +91 9876543210)")
    .optional()
    .or(z.literal("")),
  city: z.string().min(2, "City name must be at least 2 characters").max(50).optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const checkoutCustomerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^(\+91\s?)?[6-9]\d{9}$/, "Please enter a valid mobile number"),
});

export type CheckoutCustomerInput = z.infer<typeof checkoutCustomerSchema>;

export const seatSelectionSchema = z.object({
  showId: z.string().uuid("Invalid show identifier"),
  seatIds: z.array(z.string().uuid()).min(1, "Select at least 1 seat").max(8, "Maximum 8 seats allowed per booking"),
});

export type SeatSelectionInput = z.infer<typeof seatSelectionSchema>;

export const bookingCreationSchema = z.object({
  showId: z.string().uuid(),
  seatIds: z.array(z.string().uuid()).min(1).max(8),
  customer: checkoutCustomerSchema,
});

export type BookingCreationInput = z.infer<typeof bookingCreationSchema>;
