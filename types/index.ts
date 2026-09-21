/**
 * CineBook v2 — Domain Types & Data Models
 * Centralized, strict TypeScript domain definitions
 */

export type UserRole = "customer" | "admin";

export type MovieCertificate = "U" | "UA" | "UA 13+" | "UA 16+" | "A";

export type SeatTier = "Standard" | "Premium" | "Recliner";

export type SeatStatus = "available" | "held" | "booked";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "expired";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  city?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Movie {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath?: string | null;
  genres: string[];
  durationMinutes: number;
  rating: number;
  language: string;
  certificate: MovieCertificate;
  releaseDate: string;
  basePrice: number;
  isFeatured: boolean;
  tmdbId?: number | null;
  createdAt?: string;
}

export type ShowStatus = "scheduled" | "cancelled" | "completed";

export interface Theatre {
  id: string;
  name: string;
  slug: string;
  chain: string;
  area: string;
  location: string;
  city: string;
  state?: string;
  pincode?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  amenities: string[];
  screenCount?: number;
  formats?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Screen {
  id: string;
  theatreId: string;
  name: string;
  screenNumber?: number;
  screenType: "Standard" | "IMAX" | "4DX" | "Dolby Atmos" | "Insignia Luxe";
  format?: string;
  totalSeats: number;
  capacity?: number;
  isActive?: boolean;
  theatre?: Theatre;
  createdAt?: string;
  updatedAt?: string;
}

export interface Seat {
  id: string;
  screenId: string;
  rowLabel: string;
  seatNumber: number;
  seatCode: string; // e.g. "A1", "C4"
  tier: SeatTier;
  priceMultiplier: number;
  position?: number;
  isActive?: boolean;
}

export interface Show {
  id: string;
  movieId: string;
  screenId: string;
  theatreId: string;
  startTime: string;
  endTime: string;
  date: string; // YYYY-MM-DD
  basePrice: number;
  format: string; // e.g. "2D", "IMAX 2D", "4DX"
  language: string; // e.g. "English", "Hindi", "Gujarati"
  status: ShowStatus;
  movie?: Movie;
  screen?: Screen;
  theatre?: Theatre;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShowSeat {
  id: string;
  showId: string;
  seatId: string;
  status: SeatStatus;
  heldUntil?: string | null;
  heldByUserId?: string | null;
  seat?: Seat;
}

export interface BookingItem {
  id: string;
  bookingId: string;
  seatId: string;
  seatCode: string;
  tier: SeatTier;
  unitPrice: number;
}

export interface Booking {
  id: string;
  bookingReference: string; // e.g. "CB-123456"
  userId: string;
  showId: string;
  ticketCount: number;
  subtotal: number;
  convenienceFee: number;
  grandTotal: number;
  status: BookingStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  show?: Show;
  items?: BookingItem[];
  payment?: Payment;
}

export interface Payment {
  id: string;
  bookingId: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PricingBreakdown {
  subtotal: number;
  convenienceFee: number;
  grandTotal: number;
  seatCount: number;
  unitPrice: number;
}
