# Wslny Admin Dashboard — Constitution

> Governing principles for the **Wslny Admin Dashboard** (`wslny-admin-reactjs`).

---

## 1. Mission

Build a **fast, beautiful, mobile-friendly admin dashboard** for the Wslny public-transit platform. The dashboard is the **operator cockpit** — it gives admins visibility into users, routing analytics, feedback, and system health, and provides CRUD for user management.

---

## 2. Tech Stack (non-negotiable)

| Concern | Choice | Rationale |
|---|---|---|
| Build tool | **Vite 5** | Fastest dev server, modern ESM-first |
| Framework | **React 18 + TypeScript (strict)** | Type safety, ecosystem |
| Styling | **Tailwind CSS 3** | Utility-first, matches the requested stack |
| Routing | **React Router v6** | De-facto SPA standard |
| Server state | **TanStack Query v5** | Cache, retries, refetch, optimistic updates |
| Auth / global state | **Zustand** (with `persist` for tokens) | Tiny, no boilerplate |
| Forms | **React Hook Form + Zod** | Performant + runtime validation |
| HTTP | **Axios** with interceptors | Easy token refresh, baseURL config |
| Charts | **Recharts** | Composable, React-native, lightweight |
| Icons | **lucide-react** | Tree-shakeable, consistent style |
| Date utils | **date-fns** | Tree-shakeable |
| Toasts | **react-hot-toast** | Lightweight, accessible |
| Package manager | **pnpm** | Fast, deterministic |

> No Redux, no Next.js (this is an SPA, not an SSR app).

---

## 3. Architecture

```
src/
├── main.tsx                  ← entry, providers (QueryClient, Toaster, Router)
├── App.tsx                   ← route tree
├── routes.tsx                ← all route definitions
├── lib/
│   ├── api/
│   │   ├── client.ts         ← Axios instance + interceptors
│   │   ├── auth.ts           ← login / register / profile
│   │   ├── users.ts          ← admin user CRUD
│   │   ├── analytics.ts      ← route + user + feedback analytics
│   │   └── system.ts         ← health check
│   ├── auth/
│   │   └── store.ts          ← Zustand auth store
│   ├── hooks/                ← useDebounce, useMediaQuery, etc.
│   ├── utils/                ← formatDate, formatDuration, cn() etc.
│   └── constants/            ← route paths, roles, filter enum
├── components/
│   ├── ui/                   ← Button, Card, Input, Modal, Badge, Skeleton…
│   ├── layout/               ← Sidebar, Topbar, AdminLayout, MobileDrawer
│   ├── charts/               ← LineChart, BarChart, DonutChart, KPICard
│   └── tables/               ← DataTable, Pagination
├── pages/
│   ├── auth/Login.tsx
│   ├── Dashboard.tsx
│   ├── users/UsersList.tsx
│   ├── users/UserDetail.tsx
│   ├── analytics/RouteAnalytics.tsx
│   ├── analytics/UserAnalytics.tsx
│   ├── analytics/FeedbackAnalytics.tsx
│   ├── analytics/QueryBuilder.tsx
│   ├── Profile.tsx
│   ├── SystemHealth.tsx
│   └── NotFound.tsx
└── types/                    ← shared TS types from API DTOs
```

**Dependency rule:** `pages → components → lib → types`. `lib/` never imports from `components/`. UI primitives are pure and presentation-only.

---

## 4. Design System

### Color tokens (locked from `AppColors`)

All colors are exposed as Tailwind theme tokens (`primary`, `primary-dark`, `primary-light`, `surface`, `text-*`, `success`, `error`, `warning`).

| Token | Hex | Tailwind class | Use |
|---|---|---|---|
| `primary` | `#4DB6AC` | `bg-primary text-primary` | Brand color, primary buttons, active states |
| `primary-dark` | `#00897B` | `bg-primary-dark` | Hover/active brand, sidebar bg in light mode |
| `primary-light` | `#80CBC4` | `bg-primary-light` | Light brand backgrounds, accents |
| `background` | `#F5F5F5` | `bg-background` | Page background |
| `card` | `#FFFFFF` | `bg-card` | Cards, modals, inputs |
| `text-primary` | `#212121` | `text-text-primary` | Main copy |
| `text-secondary` | `#757575` | `text-text-secondary` | Labels, captions |
| `text-hint` | `#9E9E9E` | `text-text-hint` | Placeholders, disabled |
| `border` | `#E0E0E0` | `border-border` | Default borders |
| `error` | `#D32F2F` | `bg-error text-error` | Errors, destructive |
| `success` | `#388E3C` | `bg-success text-success` | Success states |
| `warning` | `#F57C00` | `bg-warning text-warning` | Warnings |

### Typography

- Font: **Inter** (variable, via `@fontsource/inter`)
- Scale (mobile-first, fluid): `clamp()` for h1/h2
- h1: `text-2xl sm:text-3xl lg:text-4xl font-bold`
- body: `text-sm sm:text-base`
- caption: `text-xs sm:text-sm text-text-secondary`

### Spacing

- Page padding: `px-4 sm:px-6 lg:px-8 py-4 sm:py-6`
- Card padding: `p-4 sm:p-6`
- Grid gaps: `gap-4 sm:gap-6`

### Components

- All interactive elements have **hover + focus-visible** states
- Touch targets ≥ **44×44px** on mobile
- Border radius: `rounded-lg` for cards, `rounded-md` for inputs/buttons
- Shadows: `shadow-sm` for cards at rest, `shadow-md` on hover for elevated
- Transitions: `transition-colors duration-150` for instant feel

---

## 5. Responsive Strategy

**Mobile-first**, three breakpoints:

| Name | Width | Layout |
|---|---|---|
| Mobile | `<768px` | Single column, hamburger drawer, stacked cards |
| Tablet | `≥768px` | 2-col grids, collapsible sidebar |
| Desktop | `≥1024px` | Persistent sidebar, multi-col KPI grids, wider tables |

The **sidebar** is a persistent drawer on desktop and a slide-in drawer (with overlay) on mobile, toggled by a hamburger in the topbar.

Tables become **card lists** on mobile (<768px) — each row is a tappable card showing the primary fields.

---

## 6. Authentication & Security

- JWT access token (60min) + refresh token (24h), stored in **`localStorage`** via Zustand `persist`
- Axios interceptor: attach `Authorization: Bearer <token>` to all requests
- On `401` response: attempt **refresh**, retry original request once; if refresh fails, redirect to `/login`
- All admin routes are **protected by a `RequireAuth` + `RequireAdmin` guard**
- The login page is the only public route
- Logout clears store and redirects to login
- Never log tokens; never store passwords

---

## 7. Error Handling

- All API calls go through a `Result<T>` pattern OR throw typed `ApiError`
- UI shows toasts for transient errors
- Form errors are inline (React Hook Form + Zod)
- A global `ErrorBoundary` renders a friendly error page with "Try again" + "Go home"
- Loading states use skeletons (no spinners on full pages)

---

## 8. Performance

- Code-split per route via `React.lazy`
- TanStack Query defaults: `staleTime: 30s`, `retry: 1`, `refetchOnWindowFocus: false` (admin use)
- Lists paginated server-side; no virtualized scrolling needed at admin scale
- Chart components are lazy-loaded via `dynamic()`
- Bundle target: **< 350KB gzipped** for initial route

---

## 9. Accessibility

- Semantic HTML (`<nav>`, `<main>`, `<table>`, `<button>`)
- ARIA labels on icon-only buttons
- Focus rings always visible (`focus-visible:ring-2 ring-primary`)
- Color contrast ≥ 4.5:1 for body text
- Modals trap focus, close on `Escape`

---

## 10. Code Quality

- TypeScript **strict** + `noUncheckedIndexedAccess`
- No `any` (use `unknown` and narrow)
- No comments in production code (self-documenting)
- Functions ≤ 40 lines
- Components: container + presentational split (pages fetch, components render)
- Lint passes (`eslint .` clean)
- Build passes (`pnpm build` clean)

---

## 11. Definition of Done

A feature is done when:

1. The route is accessible and protected
2. The page renders with real (or mocked) data
3. Loading + error + empty states are all designed
4. Works at 375px, 768px, 1024px, 1440px
5. No console errors or warnings
6. `pnpm build` succeeds
7. `pnpm lint` passes
