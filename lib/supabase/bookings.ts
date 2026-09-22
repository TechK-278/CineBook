/**
 * CineBook v2 — Supabase Bookings & Payments Data Layer
 * Server-authoritative booking management, historical snapshots, and atomic state transitions.
 */

import { createServerSupabaseClient } from "./server";
import { isSupabaseConfigured } from "./status";
import { Booking, BookingItem, Payment, BookingStatus, PaymentStatus } from "@/types";

// In-memory fallback booking store for offline / unit tests
export interface InMemBookingStore {
  bookings: Map<string, Booking>;
}

export const inMemBookingStore: InMemBookingStore = {
  bookings: new Map(),
};

/**
 * Maps database booking row and relations to Booking domain model
 */
export function mapDbRowToBooking(row: any): Booking {
  const items: BookingItem[] = (row.booking_items || row.items || []).map((item: any) => ({
    id: item.id,
    bookingId: item.booking_id,
    seatId: item.seat_id,
    seatCode: item.seat_code,
    tier: item.seat_tier || item.tier || "Standard",
    unitPrice: Number(item.unit_price || 0),
  }));

  const payment: Payment | undefined = row.payments
    ? Array.isArray(row.payments) && row.payments.length > 0
      ? {
          id: row.payments[0].id,
          bookingId: row.id,
          razorpayOrderId: row.payments[0].razorpay_order_id,
          razorpayPaymentId: row.payments[0].razorpay_payment_id,
          razorpaySignature: row.payments[0].razorpay_signature,
          amount: Number(row.payments[0].amount || row.grand_total),
          currency: row.payments[0].currency || "INR",
          status: (row.payments[0].status || "paid") as PaymentStatus,
          createdAt: row.payments[0].created_at,
          updatedAt: row.payments[0].updated_at,
        }
      : {
          id: row.payments.id,
          bookingId: row.id,
          razorpayOrderId: row.payments.razorpay_order_id,
          razorpayPaymentId: row.payments.razorpay_payment_id,
          razorpaySignature: row.payments.razorpay_signature,
          amount: Number(row.payments.amount || row.grand_total),
          currency: row.payments.currency || "INR",
          status: (row.payments.status || "paid") as PaymentStatus,
          createdAt: row.payments.created_at,
          updatedAt: row.payments.updated_at,
        }
    : undefined;

  // Use show relation or construct from historical snapshot
  const show = row.show || {
    id: row.show_id,
    movieId: "snapshot-movie",
    theatreId: "snapshot-theatre",
    screenId: "snapshot-screen",
    date: row.show_time_snapshot
      ? new Date(row.show_time_snapshot).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    startTime: row.show_time_snapshot || new Date().toISOString(),
    endTime: row.show_time_snapshot || new Date().toISOString(),
    basePrice: Number(row.subtotal / Math.max(1, row.ticket_count)),
    format: row.show_format_snapshot || "2D",
    language: row.show_language_snapshot || "English",
    status: "scheduled",
    movie: {
      id: "snapshot-movie",
      title: row.movie_title_snapshot || "Feature Film",
      overview: "Confirmed CineBook Ticket Reservation",
      posterPath: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500",
      genres: ["Cinema"],
      durationMinutes: 120,
      rating: 8.5,
      language: row.show_language_snapshot || "English",
      certificate: "UA",
      releaseDate: "2026",
      basePrice: 300,
      isFeatured: true,
    },
    theatre: {
      id: "snapshot-theatre",
      name: row.theatre_name_snapshot || "CineBook Multiplex",
      slug: "cinebook-multiplex",
      chain: "PVR",
      area: "Ahmedabad",
      location: "Ahmedabad",
      city: "Ahmedabad",
      amenities: ["Dolby Atmos", "Recliners"],
      isActive: true,
    },
    screen: {
      id: "snapshot-screen",
      theatreId: "snapshot-theatre",
      name: row.screen_name_snapshot || "Screen 1",
      screenType: "Standard",
      totalSeats: 36,
      isActive: true,
    },
  };

  const status = (row.status || "pending").toLowerCase() as BookingStatus;

  return {
    id: row.id,
    bookingReference: row.booking_reference,
    userId: row.user_id,
    showId: row.show_id,
    ticketCount: Number(row.ticket_count || items.length),
    subtotal: Number(row.subtotal || 0),
    convenienceFee: Number(row.convenience_fee || 0),
    grandTotal: Number(row.grand_total || 0),
    status,
    customerName: row.customer_name || "CineBook Guest",
    customerEmail: row.customer_email || "guest@cinebook.com",
    customerPhone: row.customer_phone || "+91 9876543210",
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    show,
    items,
    payment,
  };
}

/**
 * Fetch all bookings for a user, sorted newest first
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  const cleanUserId = userId?.trim();
  if (!cleanUserId) return [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            *,
            booking_items (*),
            payments (*),
            show:shows (*, movie:movies(*), theatre:theatres(*), screen:screens(*))
          `)
          .eq("user_id", cleanUserId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          return data.map(mapDbRowToBooking);
        }
      }
    } catch (err) {
      console.warn("[Bookings Service] Supabase getUserBookings failed:", err);
    }
  }

  // Fallback in-memory store
  return Array.from(inMemBookingStore.bookings.values())
    .filter((b) => b.userId === cleanUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Fetch single booking by ID or reference with strict authorization check
 */
export async function getBookingById(
  bookingIdOrRef: string,
  userId?: string
): Promise<Booking | null> {
  const cleanId = bookingIdOrRef?.trim();
  if (!cleanId) return null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
        let query = supabase
          .from("bookings")
          .select(`
            *,
            booking_items (*),
            payments (*),
            show:shows (*, movie:movies(*), theatre:theatres(*), screen:screens(*))
          `);

        if (isUuid) {
          query = query.eq("id", cleanId);
        } else {
          query = query.eq("booking_reference", cleanId);
        }

        if (userId) {
          query = query.eq("user_id", userId);
        }

        const { data, error } = await query.maybeSingle();

        if (!error && data) {
          return mapDbRowToBooking(data);
        }
      }
    } catch (err) {
      console.warn("[Bookings Service] Supabase getBookingById failed:", err);
    }
  }

  // Fallback in-memory search
  for (const b of inMemBookingStore.bookings.values()) {
    if (b.id === cleanId || b.bookingReference === cleanId) {
      if (!userId || b.userId === userId) {
        return b;
      }
      return null; // Unauthorized access attempt
    }
  }

  return null;
}

/**
 * Create server-authoritative booking intent via RPC
 */
export async function createBookingIntent({
  showId,
  seatIds,
  userId,
  customerName,
  customerEmail,
  customerPhone,
  idempotencyKey,
}: {
  showId: string;
  seatIds: string[];
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  idempotencyKey?: string;
}): Promise<{
  bookingId: string;
  bookingReference: string;
  ticketCount: number;
  subtotal: number;
  convenienceFee: number;
  grandTotal: number;
  currency: string;
}> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.rpc("create_booking_intent", {
          p_show_id: showId,
          p_seat_ids: seatIds,
          p_user_id: userId,
          p_customer_name: customerName,
          p_customer_email: customerEmail,
          p_customer_phone: customerPhone,
          p_idempotency_key: idempotencyKey || null,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data && data.length > 0) {
          const row = data[0];
          return {
            bookingId: row.booking_id,
            bookingReference: row.booking_reference,
            ticketCount: row.ticket_count,
            subtotal: Number(row.subtotal),
            convenienceFee: Number(row.convenience_fee),
            grandTotal: Number(row.grand_total),
            currency: row.currency || "INR",
          };
        }
      }
    } catch (err: any) {
      console.warn("[Bookings Service] RPC create_booking_intent failed:", err.message);
      throw err;
    }
  }

  // Fallback In-Memory Booking Creation
  const bookingId = `b_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const bookingRef = `CB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  // Calculate pricing based on 300 base price
  let subtotal = 0;
  const items: BookingItem[] = seatIds.map((sId) => {
    const isRecliner = sId.includes("A");
    const isPremium = sId.includes("B");
    const multiplier = isRecliner ? 1.5 : isPremium ? 1.2 : 1.0;
    const tier = isRecliner ? "Recliner" : isPremium ? "Premium" : "Standard";
    const unitPrice = Math.round(300 * multiplier);
    subtotal += unitPrice;

    return {
      id: `bi_${sId}`,
      bookingId,
      seatId: sId,
      seatCode: sId.replace(/.*seat-/, ""),
      tier,
      unitPrice,
    };
  });

  const convenienceFee = Math.round(subtotal * 0.12);
  const grandTotal = subtotal + convenienceFee;

  const newBooking: Booking = {
    id: bookingId,
    bookingReference: bookingRef,
    userId,
    showId,
    ticketCount: seatIds.length,
    subtotal,
    convenienceFee,
    grandTotal,
    status: "pending",
    customerName,
    customerEmail,
    customerPhone,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items,
  };

  inMemBookingStore.bookings.set(bookingId, newBooking);

  return {
    bookingId,
    bookingReference: bookingRef,
    ticketCount: seatIds.length,
    subtotal,
    convenienceFee,
    grandTotal,
    currency: "INR",
  };
}

/**
 * Confirm booking payment atomically via RPC
 */
export async function confirmBookingPayment({
  bookingId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  rawResponse,
}: {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  rawResponse?: any;
}): Promise<{
  bookingId: string;
  bookingReference: string;
  status: string;
  grandTotal: number;
}> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.rpc("confirm_booking_payment", {
          p_booking_id: bookingId,
          p_razorpay_order_id: razorpayOrderId,
          p_razorpay_payment_id: razorpayPaymentId,
          p_razorpay_signature: razorpaySignature,
          p_raw_response: rawResponse || null,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data && data.length > 0) {
          const row = data[0];
          return {
            bookingId: row.booking_id,
            bookingReference: row.booking_reference,
            status: row.status,
            grandTotal: Number(row.grand_total),
          };
        }
      }
    } catch (err: any) {
      console.warn("[Bookings Service] RPC confirm_booking_payment failed:", err.message);
      throw err;
    }
  }

  // Fallback In-Memory Confirmation
  const booking = inMemBookingStore.bookings.get(bookingId);
  if (booking) {
    booking.status = "confirmed";
    booking.updatedAt = new Date().toISOString();
    booking.payment = {
      id: `pay_${Date.now()}`,
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount: booking.grandTotal,
      currency: "INR",
      status: "paid",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      status: "confirmed",
      grandTotal: booking.grandTotal,
    };
  }

  throw new Error("Booking not found");
}

/**
 * Fail booking payment via RPC
 */
export async function failBookingPayment(
  bookingId: string,
  errorMessage?: string
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.rpc("fail_booking_payment", {
          p_booking_id: bookingId,
          p_error_message: errorMessage || null,
        });
        if (!error) return Boolean(data);
      }
    } catch (err) {
      console.warn("[Bookings Service] RPC fail_booking_payment failed:", err);
    }
  }

  const booking = inMemBookingStore.bookings.get(bookingId);
  if (booking && booking.status !== "confirmed") {
    booking.status = "cancelled";
    return true;
  }
  return false;
}

/**
 * Reset in-memory bookings (for tests)
 */
export function resetInMemoryBookings(): void {
  inMemBookingStore.bookings.clear();
}
