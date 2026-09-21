import { describe, it, expect } from "vitest";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  profileEditSchema,
} from "@/lib/validations";
import { isSupabaseConfigured } from "@/lib/supabase/status";

describe("Phase 2 — Supabase Authentication & Profile Validations", () => {
  describe("Login Validation Schema", () => {
    it("accepts valid email and password (>= 6 chars)", () => {
      const valid = loginSchema.safeParse({
        email: "alex.morgan@example.com",
        password: "secretpassword123",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects malformed email address", () => {
      const invalid = loginSchema.safeParse({
        email: "not-an-email",
        password: "secretpassword123",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.errors[0].message).toContain("valid email");
      }
    });

    it("rejects password shorter than 6 characters", () => {
      const invalid = loginSchema.safeParse({
        email: "alex@example.com",
        password: "123",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.errors[0].message).toContain("at least 6 characters");
      }
    });
  });

  describe("Signup Validation Schema", () => {
    it("accepts valid full name, email, and matching passwords", () => {
      const valid = signupSchema.safeParse({
        fullName: "Alex Morgan",
        email: "alex.morgan@example.com",
        password: "SecurePassword123",
        confirmPassword: "SecurePassword123",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects mismatched confirm password", () => {
      const invalid = signupSchema.safeParse({
        fullName: "Alex Morgan",
        email: "alex.morgan@example.com",
        password: "SecurePassword123",
        confirmPassword: "DifferentPassword456",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.errors[0].message).toBe("Passwords do not match");
      }
    });

    it("rejects name shorter than 2 characters", () => {
      const invalid = signupSchema.safeParse({
        fullName: "A",
        email: "alex.morgan@example.com",
        password: "SecurePassword123",
        confirmPassword: "SecurePassword123",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.errors[0].message).toContain("at least 2 characters");
      }
    });
  });

  describe("Forgot Password Validation Schema", () => {
    it("validates correct email address", () => {
      const valid = forgotPasswordSchema.safeParse({ email: "user@domain.com" });
      expect(valid.success).toBe(true);
    });

    it("rejects empty or invalid email address", () => {
      const invalid = forgotPasswordSchema.safeParse({ email: "invalid-email" });
      expect(invalid.success).toBe(false);
    });
  });

  describe("Profile Edit Validation Schema", () => {
    it("validates full name with valid mobile phone and city", () => {
      const valid = profileEditSchema.safeParse({
        fullName: "Krushn Kachhadiya",
        phone: "+91 9876543210",
        city: "Ahmedabad",
      });
      expect(valid.success).toBe(true);
    });

    it("allows empty optional phone and city", () => {
      const valid = profileEditSchema.safeParse({
        fullName: "Krushn Kachhadiya",
        phone: "",
        city: "",
      });
      expect(valid.success).toBe(true);
    });

    it("rejects invalid phone number pattern", () => {
      const invalid = profileEditSchema.safeParse({
        fullName: "Krushn Kachhadiya",
        phone: "12345",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("Supabase Configuration Helper", () => {
    it("returns boolean status without throwing exceptions", () => {
      const status = isSupabaseConfigured();
      expect(typeof status).toBe("boolean");
    });
  });
});
