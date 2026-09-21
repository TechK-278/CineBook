/**
 * CineBook v2 — Offers & Promotions Dataset (Demo Data)
 */

export interface OfferItem {
  id: string;
  code: string;
  title: string;
  description: string;
  discountBadge: string;
  validUntil: string;
  category: "Bank Offer" | "Wallet" | "CineBook Special" | "Festival";
  terms: string;
}

export const OFFERS: OfferItem[] = [
  {
    id: "firstshow",
    code: "FIRSTSHOW",
    title: "Flat ₹100 Off on First Booking",
    description: "Enjoy ₹100 discount on your very first movie reservation with CineBook v2.",
    discountBadge: "₹100 OFF",
    validUntil: "31 Dec 2026",
    category: "CineBook Special",
    terms: "Valid once per customer on a minimum booking of 2 tickets.",
  },
  {
    id: "hdfc-weekend",
    code: "HDFCMOVIE",
    title: "Buy 1 Get 1 Free on HDFC Cards",
    description: "Get a complimentary companion ticket on weekends using HDFC Bank credit cards.",
    discountBadge: "BOGO FREE",
    validUntil: "30 Nov 2026",
    category: "Bank Offer",
    terms: "Applicable on IMAX and Premium seats on Saturday and Sunday shows.",
  },
  {
    id: "icici-blockbuster",
    code: "ICICIPASS",
    title: "20% Instant Discount up to ₹150",
    description: "Pay with ICICI Net Banking or Debit Cards for instant savings on all shows.",
    discountBadge: "20% OFF",
    validUntil: "15 Oct 2026",
    category: "Bank Offer",
    terms: "Valid on all shows across Ahmedabad and partner multiplexes.",
  },
  {
    id: "popcorn-combo",
    code: "CINECOMBO",
    title: "Free Regular Popcorn on 4+ Tickets",
    description: "Book 4 or more tickets and receive a complimentary gourmet popcorn voucher.",
    discountBadge: "FREE COMBO",
    validUntil: "31 Oct 2026",
    category: "CineBook Special",
    terms: "Redeemable at PVR, INOX and Cinépolis refreshment counters.",
  },
];
