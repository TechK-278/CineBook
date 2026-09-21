# CineBook v2 — Full-Stack Cinema Discovery & Ticket Booking Platform

CineBook v2 is a modern, production-grade movie discovery and ticket booking platform built with **Next.js (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Supabase**, **PostgreSQL**, **Zod**, and **Vitest**.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Server-side rendering, Server Components, Route Handlers |
| **Language** | TypeScript (Strict mode) | Type-safe domain models, API contracts, and component props |
| **Styling & UI** | Tailwind CSS + shadcn/ui | Dark cinematic design system, accessible UI primitives |
| **Database & Auth** | Supabase & PostgreSQL | Relational schema, Row-Level Security (RLS), Auth & Realtime |
| **External APIs** | TMDB API | Live movie metadata, trailers, ratings, genres (server-side only) |
| **Payments** | Razorpay Gateway | Order generation, checkout, and webhook signature verification |
| **Validation** | Zod | Server and client schema validation for forms & API payloads |
| **State Management** | React / Zustand | Ephemeral client UI state (seat selection, stepper progress) |
| **Testing** | Vitest & Playwright | Fast unit tests (pricing, domain logic) and E2E automation |

---

## 📂 Project Structure

```text
CineBook/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root HTML shell & metadata
│   ├── page.tsx                # Platform overview & architecture landing
│   ├── globals.css             # Tailwind & CSS custom properties
│   ├── movies/                 # Movie discovery & catalogue
│   ├── theatres/               # Theatre & screen showcase
│   ├── bookings/               # User reservations & passes
│   └── profile/                # User profile & account preferences
│
├── components/
│   ├── layout/                 # Navbar, Footer, Navigation landmarks
│   └── ui/                     # Button, Badge, Card, primitives
│
├── lib/
│   ├── pricing/                # Centralized pricing engine & Vitest suite
│   ├── supabase/               # Browser & server Supabase client factories
│   ├── tmdb/                   # Server-side TMDB API service abstraction
│   ├── razorpay/               # Razorpay payment gateway integration stubs
│   ├── validations/            # Zod validation schemas
│   └── utils.ts                # Class merging utility (`cn`)
│
├── types/                      # Centralized strict TypeScript domain models
├── supabase/
│   ├── migrations/             # Relational SQL schema with RLS policies
│   └── seed.sql                # Initial development seed data
│
├── legacy/                     # Preserved v1 Bootstrap reference implementation
├── .env.example                # Documented environment variable template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts
└── README.md
```

---

## 💾 Database Schema (PostgreSQL / Supabase)

The database schema is organized into relational tables with strict foreign keys and Row Level Security:

1. **`profiles`**: User details (full name, phone, city, avatar, role `customer`/`admin`).
2. **`movies`**: Titles, overviews, ratings, certificates, runtimes, base pricing, TMDB IDs.
3. **`theatres`**: Multiplex locations, cities, addresses, amenities.
4. **`screens`**: Auditoriums per theatre (Standard, IMAX, 4DX, Dolby Atmos, Insignia Luxe).
5. **`seats`**: Standardized seating map (Rows A–F, 6 cols) categorized into Standard, Premium, Recliner.
6. **`shows`**: Scheduled movie screenings at specific dates, screens, and base prices.
7. **`show_seats`**: Real-time seat status per show (`available`, `held`, `booked`).
8. **`bookings`**: Customer ticket reservations, reference codes (`CB-XXXXXX`), financial totals, statuses (`pending`, `confirmed`, `cancelled`).
9. **`booking_items`**: Individual seats reserved per booking with historical price snapshot.
10. **`payments`**: Payment transaction logs, Razorpay order IDs, payment signatures.

---

## 💰 Centralized Pricing Engine

All ticket pricing logic is encapsulated in `lib/pricing/index.ts`:

- **Subtotal**: `unitPrice × seatCount`
- **Convenience Fee**: `Math.round(subtotal × 0.12)` (12% standard rate)
- **Grand Total**: `Subtotal + ConvenienceFee`

Example calculations:
- `1 ticket @ ₹320`: Subtotal = ₹320, Fee = ₹38, Grand Total = **₹358**
- `3 tickets @ ₹320`: Subtotal = ₹960, Fee = ₹115, Grand Total = **₹1075**
- `8 tickets @ ₹320`: Subtotal = ₹2560, Fee = ₹307, Grand Total = **₹2867**

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` to configure environment variables:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server only)
- `TMDB_API_KEY`: TMDB v3 API Key
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Razorpay key identifier
- `RAZORPAY_KEY_SECRET`: Razorpay secret key (server only)

> **Security Note**: Never commit `.env` or `.env.local` files containing real API credentials into source control.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Tests & Typecheck
```bash
# Run Vitest unit tests
npm test

# Run TypeScript typecheck
npm run typecheck

# Build production bundle
npm run build
```

---

## 📌 Implementation Status (Phase 0 Complete)

- [x] **Phase 0: Architecture & Foundation**: Next.js App Router, TypeScript strict mode, Tailwind CSS design system, domain types, pricing engine, Zod validation, Supabase & PostgreSQL migration structure, TMDB & Razorpay client abstractions, Vitest suite, and production build verification.
- [ ] **Phase 1**: Authentication & User Profiles (Supabase Auth, SSR session middleware).
- [ ] **Phase 2**: Database Seed & Remote Synchronization.
- [ ] **Phase 3**: TMDB Live Integration & Movie Catalogue Discovery.
- [ ] **Phase 4**: Theatres, Screens & Showtime Scheduling.
- [ ] **Phase 5**: Real-Time Seat Selection & Lock Engine.
- [ ] **Phase 6**: Razorpay Checkout & Webhook Processing.
- [ ] **Phase 7**: Digital Pass, My Bookings & Cancellation Engine.
- [ ] **Phase 8**: Admin Management Portal.
- [ ] **Phase 9**: Production E2E Testing & Vercel Deployment.
