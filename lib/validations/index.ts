/**
 * CineBook v2 — Zod Validation Schemas
 * Type-safe input validations for authentication, profiles, and booking
 */

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(60),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

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

export const profileEditSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(60),
  phone: z
    .string()
    .regex(/^(\+91\s?)?[6-9]\d{9}$/, "Please enter a valid mobile number (e.g. +91 9876543210)")
    .optional()
    .or(z.literal("")),
  city: z.string().min(2, "City name must be at least 2 characters").max(50).optional().or(z.literal("")),
});

export type ProfileEditInput = z.infer<typeof profileEditSchema>;

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
