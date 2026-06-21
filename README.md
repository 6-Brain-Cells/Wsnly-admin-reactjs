# Wslny Admin Dashboard

Operations console for the **Wslny** public-transit platform (Cairo, Egypt). A
fast, responsive, mobile-friendly React SPA built with **Vite + TypeScript +
Tailwind CSS** and **shadcn/ui** primitives. It consumes the Django REST API
documented in [`/Wsnly-Backend/docs`](../Wsnly-Backend/docs).

---

## Features

- **Dashboard** — KPIs (users, requests, success rate, avg rating), daily
  usage chart, source breakdown (text vs. map), and at-a-glance performance.
- **User Management** — searchable, filterable, paginated user table;
  detailed user view with stats, edit dialog, role change, and deactivation.
- **Route Analytics** — overview (totals, latency, source, daily usage),
  top routes, filter statistics, and unresolved query analysis.
- **User Analytics** — registration growth, engagement, and top users.
- **Feedback** — average rating, distribution chart, and full review list
  with pagination and rating filter.
- **Query Builder** — composable analytics: pick metrics, group-by, sort,
  order, and limit; see results and the exact request URL.
- **System Health** — live status of the database, AI service, and routing
  engine (auto-refreshes every 30s).
- **Profile** — view/edit your own profile and change your password.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Build tool | Vite 5 |
| Framework | React 18 + TypeScript (strict) |
| Styling | Tailwind CSS 3 with CSS variables (shadcn theme) |
| UI primitives | shadcn/ui (Radix + cva + tailwind-merge) |
| Routing | React Router v6 |
| Server state | TanStack Query v5 |
| Auth / global state | Zustand (with `persist`) |
| Forms | React Hook Form + Zod |
| HTTP | Axios with interceptors + refresh-token queue |
| Charts | Recharts |
| Icons | lucide-react |
| Toasts | react-hot-toast |
| Fonts | Inter (via `@fontsource/inter`) |

---

## Folder Structure

A **feature-based** modular architecture — the modern React best practice.

```
src/
├── main.tsx                  # Entry: React + StrictMode
├── App.tsx                   # Providers + route tree
├── styles/
│   └── globals.css           # Tailwind + shadcn CSS variables
├── components/
│   ├── ui/                   # shadcn primitives (Button, Card, Dialog…)
│   ├── layout/               # AdminLayout, Sidebar, Topbar, MobileDrawer
│   ├── charts/               # KPICard, LineChart, BarChart, DonutChart
│   └── shared/               # ErrorBoundary, ErrorState, EmptyState, Pagination
├── features/                 # Business features (one folder per domain)
│   ├── auth/                 # Login, Profile, guards, store, schemas, API
│   ├── users/                # Users list + detail, keys, API, hooks
│   ├── analytics/            # Route, User, Feedback, QueryBuilder
│   └── system/               # System health
├── pages/                    # Cross-feature pages (Dashboard, NotFound)
├── lib/
│   ├── api/                  # Axios client + QueryClient
│   ├── utils.ts              # cn() helper
│   └── format.ts             # Date, number, duration, distance formatters
├── hooks/                    # useDebounce, useMediaQuery
├── types/                    # Shared TS types (User, Analytics, etc.)
├── constants/                # Routes + enums
└── config/
    └── env.ts                # env-driven config
```

### Folder rules

- `lib/` never imports from `components/` or `features/`.
- `components/ui/` is pure and presentational; it never calls APIs.
- `components/layout/` is the only place that imports the router.
- `features/<name>/` contains everything that feature needs: API, hooks,
  schemas, page, components. A page is the default export.
- `pages/` is for cross-feature pages (Dashboard, NotFound) that pull from
  multiple features.

---

## Getting Started

### Prerequisites

- Node 18+ (tested on 22)
- pnpm 9+ (or npm/yarn)

### Install

```bash
pnpm install
```

### Configure

Edit `.env` (or copy from `.env.example`):

```env
# Deployed production API:
VITE_API_BASE_URL=https://wslny-api.icyforest-4fb366f4.uaenorth.azurecontainerapps.io

# Or local dev:
# VITE_API_BASE_URL=http://localhost:8000

# Optional: Google OAuth client ID
VITE_GOOGLE_CLIENT_ID=
```

### Develop

```bash
pnpm dev          # starts Vite on http://localhost:5173
```

### Build

```bash
pnpm build        # typecheck + production build → dist/
pnpm preview      # preview the production build locally
```

### Lint & typecheck

```bash
pnpm typecheck    # tsc --noEmit
pnpm lint         # ESLint
```

---

## Backend

The dashboard is a **pure consumer** of the Wslny API. It expects the
endpoints documented in `/Wsnly-Backend/docs`, especially:

- `POST /api/v1/auth/login`
- `GET  /api/v1/auth/profile`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/change-password`
- `GET  /api/v1/admin/users` (+ detail, update, delete, change-role)
- `GET  /api/v1/admin/analytics/{routes,users,feedback}/...`
- `GET  /api/health`

The JWT access token (60min) is attached to every request via an Axios
interceptor; on `401` the client tries `POST /api/v1/auth/refresh` once and
retries the original request. If the refresh fails, the user is signed out.

---

## Design System

- **Brand color**: teal (`#4DB6AC`, dark `#00897B`, light `#80CBC4`).
- **Theme tokens** are exposed as CSS variables (`--primary`, `--background`,
  `--success`, …) for future dark mode.
- **Typography**: Inter, fluid sizes via `clamp()`-friendly Tailwind classes.
- **Spacing**: 4-pt grid (`gap-4`, `p-4`, `p-5`, `p-6`, `p-8`).
- **Radii**: `--radius: 0.625rem` (cards), `0.5rem` (inputs/buttons).
- **Shadows**: `shadow-soft` (rest), `shadow-elevated` (hover/promoted).
- **Motion**: 150–300 ms color/transform transitions, page fade-in.

### Responsive

- **Mobile-first**. Tables become stacked cards below `md` (768px).
- Sidebar is a persistent drawer on `lg+`, slide-in drawer below.
- All grids collapse to one column under 768px; KPI cards become 2-up on
  `sm`, 4-up on `lg`.

---

## License

Internal — Wslny © 2026.
