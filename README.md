# CineBook — Cinematic Movie Discovery & Ticket Booking SPA

CineBook is a responsive, accessible, and performant client-side Single Page Application (SPA) for discovering movies, exploring showtimes, reserving cinema seats, and managing movie bookings. Designed with a dark aesthetic, CineBook provides an end-to-end cinema reservation workflow running entirely in the browser.

---

## 🚀 Technology Stack

- **HTML5**: Semantic markup, accessible landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`), and accessible form controls.
- **CSS3**: Custom design system built with CSS custom properties, responsive clamp typography, and micro-interactions.
- **Bootstrap 5 (v5.3.3)**: Responsive grid, containers, buttons, cards, collapsible navbar, forms, modals, utilities, and toast notifications.
- **Bootstrap Icons (v1.11.3)**: High-clarity vector iconography.
- **jQuery (v3.7.1)**: Event delegation, DOM manipulation, and dynamic template rendering.
- **Vanilla JavaScript (ES6+)**: Modular client-side architecture (`CineData`, `Storage`, `UI`, `CineBook`) with robust state management.

---

## 🎯 Key Features

1. **Movie Catalogue & Discovery**:
   - Browse 12 curated movies across multiple genres (Action, Sci-Fi, Drama, Thriller, Animation, Comedy).
   - Real-time case-insensitive search across movie titles, genres, and languages.
   - Dynamic genre filter pills with active toggle states and keyboard activation.
   - Multi-mode sorting (Popularity, Rating, Title A–Z, Release Date).
   - Live result counts with screen-reader status announcements (`aria-live="polite"`).

2. **Movie Details Modal**:
   - Rich movie overview including poster, backdrop, synopsis, certificate, runtime, rating, and language.
   - Direct seamless transition from details modal to booking flow.

3. **Interactive 4-Step Booking Workflow**:
   - **Step 1: Date Selection**: 4 upcoming dates generated dynamically with formatted day and date indicators.
   - **Step 2: Theatre & Showtime Selection**: 4 distinct theatres with multiple showtimes and audio/screen specifications.
   - **Step 3: Interactive Seat Selection**: 36-seat cinema layout (Rows A–F, 6 seats each) across Recliner, Premium, and Standard tiers, with live occupancy protection and an 8-ticket maximum per transaction.
   - **Step 4: Customer Details & Checkout**: Validated customer form pre-filled from user profile with instant summary calculation.

4. **Transparent Pricing Calculation**:
   - Centralized pricing engine: `Subtotal = Ticket Price × Seats`, `Convenience Fee = Math.round(Subtotal × 0.12)`, `Grand Total = Subtotal + Convenience Fee`.

5. **Booking Confirmation & Digital Pass**:
   - Instant booking confirmation with unique reference code (`CB-XXXXXX`).
   - Printable-style digital movie pass showcasing cinema details, showtime, and assigned seats.

6. **My Bookings & Cancellation**:
   - Complete booking history sorted chronologically with confirmed and cancelled visual states.
   - Safe cancellation workflow with confirmation modal and cancellation timestamp tracking.

7. **User Profile & Statistics**:
   - Profile management with edit modal and validation.
   - Real-time synchronized booking metrics (Total Bookings, Active Tickets, Cancelled Bookings).
   - Profile values prefill future booking workflows automatically.

8. **Accessibility & Responsive Experience**:
   - Fully keyboard navigable (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`).
   - ARIA-compliant attributes, explicit label associations, and live announcements.
   - Tailored responsive layouts tested from 320px mobile screens to wide 1440px+ desktop displays.

---

## 📂 Project Structure

```text
CineBook/
├── index.html          # Main SPA entry point and layout shell
├── css/
│   └── style.css       # CineBook design tokens, typography, and custom styles
├── js/
│   ├── app.js          # Application bootstrapper and event wireup
│   ├── data.js         # Data models, mock dataset, and pricing calculations
│   ├── ui.js           # UI rendering helpers, modals, and notifications
│   └── storage.js      # LocalStorage abstraction layer with fallback protection
├── assets/
│   ├── images/         # Image assets and banners
│   └── icons/          # Custom iconography
├── .gitignore          # Git ignore configuration
└── README.md           # Project documentation
```

---

## 💾 LocalStorage Data Persistence

CineBook persists all state client-side using `localStorage` through a defensive abstraction layer (`Storage`) that safely recovers from missing or malformed data:

- **`cinebook_profile`**: Stores the user's name, email, phone number, city, and avatar initials.
- **`cinebook_bookings`**: Stores the array of reservation records including movie details, seat numbers, theatre, showtime, pricing breakdown, status (`Confirmed` / `Cancelled`), and timestamps.

---

## 💻 How to Run the Application

Because CineBook is built as a zero-dependency client-side SPA:

1. Clone or download the repository:
   ```bash
   git clone https://github.com/TechK-278/CineBook.git
   ```
2. Open `index.html` directly in any modern browser, or launch a lightweight local HTTP server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Or using Node http-server
   npx http-server . -p 8000
   ```
3. Open `http://localhost:8000` in your web browser.

---

## 📋 Scope & Limitations

- **Simulation Demo**: CineBook is a frontend demonstration Single Page Application.
- **Client-Side Only**: Does not integrate real payment gateways (e.g., Stripe/Razorpay) or live backend database servers.
- **Single-User Scope**: Seat occupancy states are simulated client-side and do not support multi-user real-time locking across different physical devices.
- **Authentication**: User identity is represented as an editable client-side profile without a remote authentication server.
