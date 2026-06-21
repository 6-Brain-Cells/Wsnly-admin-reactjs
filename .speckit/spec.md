# Wslny Admin Dashboard — Specification

## Vision

The **Wslny Admin Dashboard** is the operations control center for the Wslny public-transit platform (Cairo, Egypt). It gives platform operators a single, fast, mobile-friendly interface to **understand usage**, **manage users**, **analyze routing performance**, and **triage feedback** — all driven by the Django REST API documented in `/Wsnly-Backend/docs/`.

The product is an **SPA built with React 18 + Vite + TypeScript + Tailwind CSS**, themed with the existing teal brand palette.

---

## User Stories

### As an Admin
- **US-1** I want to **log in** with email/password or Google so that I can access the dashboard.
- **US-2** I want to **see a high-level dashboard** with KPIs (total users, total routes, success rate, average rating) and trend charts so I can monitor platform health at a glance.
- **US-3** I want to **browse all users** in a searchable, paginated table so I can find any account.
- **US-4** I want to **view a user's detail page** (profile + activity stats) so I can understand their usage.
- **US-5** I want to **edit user fields** (name, phone, role, active status) so I can keep accounts correct.
- **US-6** I want to **change a user's role** (User ↔ Admin) so I can delegate access.
- **US-7** I want to **deactivate a user** so I can prevent abuse without deleting their history.
- **US-8** I want to **see route analytics** (totals, success rate, daily usage, source breakdown, latency) so I can spot regressions.
- **US-9** I want to **see the most popular origin→destination pairs** so I can prioritize infrastructure work.
- **US-10** I want to **see filter usage statistics** (optimal, fastest, cheapest, bus-only, etc.) so I can understand user preferences.
- **US-11** I want to **see failed/unresolved queries** (with reasons) so I can fix data or AI issues.
- **US-12** I want to **run ad-hoc analytics queries** (pick metrics + group-by fields) so I can answer custom questions.
- **US-13** I want to **see user analytics** (total users, growth, top users by routes) so I can measure growth.
- **US-14** I want to **browse all feedback** (paginated, filterable by rating/date) so I can read what users say.
- **US-15** I want to **see feedback summary** (average rating, distribution chart) so I can gauge satisfaction.
- **US-16** I want to **see system health** (database, AI service, routing engine) so I know if the platform is up.
- **US-17** I want to **view and edit my own profile** (name, phone, address) and **change my password**.
- **US-18** I want to **log out** securely.

### As a Mobile User (same admin, on phone)
- **US-19** I want the dashboard to be **fully usable on mobile** — hamburger nav, stacked cards, swipe-friendly tables.

---

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | Login form with email + password, plus a "Sign in with Google" button (uses Google Identity Services SDK, posts `id_token` to `/api/v1/auth/google-login`). |
| FR-2 | JWT access + refresh tokens stored in `localStorage`. Auto-refresh on 401. |
| FR-3 | All admin routes require `Admin` role. Non-admins get redirected to `/login` with a toast. |
| FR-4 | Sidebar navigation with 7 sections: Dashboard, Users, Route Analytics, User Analytics, Feedback, System Health, Profile. |
| FR-5 | Topbar with page title, search (contextual), notifications icon (placeholder), and avatar dropdown (Profile, Logout). |
| FR-6 | Dashboard shows 4 KPI cards + 2 charts (daily usage, source breakdown). |
| FR-7 | Users list is a paginated, searchable table with role + status filters. Clicking a row opens the detail page. |
| FR-8 | User detail shows profile + 3 stat cards (total routes, saved locations, favorites) + a "danger zone" (deactivate, change role). |
| FR-9 | Route Analytics has 4 sub-views (Overview, Top Routes, Filters, Unresolved) accessible via tabs. |
| FR-10 | Query Builder is a form with multi-select for metrics and group-by, plus a results table. |
| FR-11 | Feedback Analytics has a list view (with rating filter) and a summary card (avg rating + bar chart distribution). |
| FR-12 | System Health shows 3 status pills (DB, AI, Routing) auto-refreshing every 30s. |
| FR-13 | Profile page shows the admin's info, with an Edit modal and a Change Password modal. |
| FR-14 | All forms validated with Zod; submit buttons disabled while invalid. |
| FR-15 | All data tables support pagination (server-side) with `limit` / `offset` controls. |
| FR-16 | All async pages show skeletons during loading; toasts on error. |
| FR-17 | All interactive elements have hover + focus states; touch targets ≥ 44px. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Responsive**: Pixel-perfect at 375px, 768px, 1024px, 1440px. |
| NFR-2 | **Fast**: Initial route loads in < 2s on a 3G connection. |
| NFR-3 | **Accessible**: WCAG 2.1 AA — keyboard navigable, focus visible, contrast OK. |
| NFR-4 | **Type-safe**: TypeScript strict, no `any`. |
| NFR-5 | **No secrets in code**: API base URL via `VITE_API_BASE_URL` env var. |
| NFR-6 | **Production build**: `pnpm build` succeeds, no warnings, no dead routes. |
| NFR-7 | **Lint clean**: `pnpm lint` passes. |

---

## Constraints

- Backend is the existing Django API at `/Wsnly-Backend/`. The dashboard **only consumes** — it does not modify backend code.
- API base URL: `VITE_API_BASE_URL` env (default `http://localhost:8000` for dev).
- Initial admin credentials come from backend env (`ADMIN_PASSWORD`); the dashboard must not bake in any password.
- Color palette is **fixed** by `AppColors` Flutter class — do not introduce new brand colors.

---

## Success Criteria

- Admin can sign in and see the dashboard in < 2 seconds.
- Every documented admin endpoint has a corresponding page/control.
- Mobile (375px) and desktop (1440px) layouts are both production-ready.
- The dashboard **looks beautiful** — generous whitespace, consistent spacing, soft shadows, smooth transitions, teal brand color used purposefully.
- `pnpm build` and `pnpm lint` both pass with zero errors.
- The codebase has clear separation: `lib/` (logic) → `components/` (UI) → `pages/` (composition).

---

## Out of Scope (v1)

- Multi-language support (English only).
- Dark mode (light theme only; tokens are ready for it later).
- Server-Sent Events / live tail of route requests.
- Editing stops/lines (transit data is read-only here).
- Map visualization of polylines (admin is text/table-driven).
- 2FA.
