# CineBook

CineBook is a modern movie discovery and ticket-booking Single Page Application (SPA) featuring a cinematic dark interface and seamless booking workflow.

## Technology Stack

- **HTML5**: Semantic markup and SPA view containers
- **CSS3**: Custom design system with CSS custom properties
- **Bootstrap 5 (v5.3.3)**: Grid system, components, modals, and responsive utilities
- **Bootstrap Icons (v1.11.3)**: Iconography
- **jQuery (v3.7.1)**: SPA DOM manipulation, event management, and dynamic rendering
- **JavaScript (ES6+)**: Modular client-side architecture and localStorage persistence

## Planned Features

- **Movie Catalogue & Discovery**: Browse trending, currently screening, and upcoming movies with genre/language filters.
- **Search & Filter**: Real-time client-side movie filtering and search.
- **Movie Details**: Rich movie synopsis, trailer previews, runtime, ratings, and cast information.
- **Showtime & Seat Selection**: Interactive theater screen layout with dynamic seat reservation.
- **Ticket Booking & Checkout**: Instant booking simulation with ticket summary and price calculation.
- **Booking Management**: View past and active reservations with cancellation support.
- **User Profile**: Manage user preferences and booking history.

## Project Structure

```text
cinebook/
├── index.html          # Main SPA entry point and layout shell
├── css/
│   └── style.css       # CineBook design tokens, typography, and custom styles
├── js/
│   ├── app.js          # Application bootstrapper and event wireup
│   ├── data.js         # Data models and mock dataset definitions
│   ├── ui.js           # UI rendering helpers, modals, and notifications
│   └── storage.js      # LocalStorage abstraction layer
├── assets/
│   ├── images/         # Image assets and banners
│   └── icons/          # Custom icons
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

## Design System

CineBook implements a restrained, SADCN-inspired cinematic dark design:
- **Backgrounds**: Deep obsidian palette (`#0B0B0F`, `#111116`, `#18181F`)
- **Surfaces**: Elevated dark panels (`#15151B`) with subtle borders (`#27272A`)
- **Accent**: High-impact cinematic red (`#E50914`) for primary calls to action
- **Typography**: Clean, readable sans-serif hierarchy using Inter (400, 500, 600, 700)

## How to Run the Application

Since CineBook is built entirely as a client-side Single Page Application with no backend dependencies:

1. Clone or open the repository folder.
2. Open `index.html` directly in any modern web browser, or serve it using any local HTTP server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Or using VS Code Live Server extension
   ```
3. Navigate to `http://localhost:8000` (or your local server address).

## Git Workflow

- Main branch: `main`
- Commit conventions: Standard conventional commits (e.g. `chore(...)`, `feat(...)`, `fix(...)`, `docs(...)`)
- Clean commits without committing environment files, credentials, or OS artifacts.
