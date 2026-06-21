# Wslny Admin Dashboard — Tasks

## Phase 0 — Setup

- [ ] **T-0.1** Scaffold Vite + React 18 + TypeScript project in repo root
  - Acceptance: `pnpm dev` runs, `pnpm build` succeeds
  - Complexity: low
- [ ] **T-0.2** Install and configure Tailwind CSS 3 with custom theme tokens
  - Acceptance: `bg-primary` etc. resolve to brand colors
  - Complexity: low
- [ ] **T-0.3** Install all runtime + dev dependencies (see plan.md)
  - Complexity: low
- [ ] **T-0.4** Configure ESLint + TSConfig strict
  - Complexity: low
- [ ] **T-0.5** Set up base file structure (folders + placeholder index files)
  - Complexity: low
- [ ] **T-0.6** Add `.env.example` with `VITE_API_BASE_URL`
  - Complexity: low

## Phase 1 — Core Infrastructure

- [ ] **T-1.1** Create Tailwind theme with all `AppColors` tokens
  - Complexity: low
- [ ] **T-1.2** Build `lib/utils/cn.ts` (clsx + tailwind-merge) and `lib/utils/format.ts` (date, duration, number)
  - Complexity: low
- [ ] **T-1.3** Build `lib/api/client.ts` Axios instance with interceptors + refresh logic
  - Complexity: medium
- [ ] **T-1.4** Build `lib/auth/store.ts` Zustand store with `persist` for tokens + user
  - Complexity: medium
- [ ] **T-1.5** Build `lib/hooks/useDebounce.ts`, `useMediaQuery.ts`, `useDirection.ts`
  - Complexity: low
- [ ] **T-1.6** Build `lib/constants/paths.ts`, `roles.ts`, `filters.ts`
  - Complexity: low
- [ ] **T-1.7** Build `types/` — `User`, `AuthResponse`, `RouteAnalytics`, `Feedback`, etc.
  - Complexity: medium
- [ ] **T-1.8** Build `components/ui/` — Button, Card, Input, Select, Modal, Badge, Skeleton, EmptyState, Tabs, Tooltip, Avatar
  - Complexity: high

## Phase 2 — Layout & Auth

- [ ] **T-2.1** Build `AdminLayout` with sidebar slot + topbar slot + main
  - Complexity: medium
- [ ] **T-2.2** Build `Sidebar` (desktop) with all nav items, active highlight, role badge
  - Complexity: medium
- [ ] **T-2.3** Build `MobileDrawer` (slide-in, overlay, body-scroll lock)
  - Complexity: medium
- [ ] **T-2.4** Build `Topbar` (hamburger on mobile, page title, search slot, avatar dropdown)
  - Complexity: medium
- [ ] **T-2.5** Build `RequireAuth` + `RequireAdmin` route guards
  - Complexity: low
- [ ] **T-2.6** Build `Login` page (email/password, validation, error toast, Google button)
  - Complexity: medium
- [ ] **T-2.7** Wire `routes.tsx` and `App.tsx` with providers (QueryClient, Toaster, BrowserRouter)
  - Complexity: medium

## Phase 3 — Dashboard & Charts

- [ ] **T-3.1** Build `KPICard` component (title, value, trend arrow, icon)
  - Complexity: low
- [ ] **T-3.2** Build chart wrappers (`LineChartCard`, `BarChartCard`, `DonutChart`) using Recharts
  - Complexity: medium
- [ ] **T-3.3** Build `Dashboard` page (4 KPIs + 2 charts + recent activity)
  - Complexity: medium

## Phase 4 — User Management

- [ ] **T-4.1** Build `DataTable` + `Pagination` components (with mobile card mode)
  - Complexity: high
- [ ] **T-4.2** Build `UsersList` page (table, search, role filter, status filter)
  - Complexity: medium
- [ ] **T-4.3** Build `UserDetail` page (header + stats + edit modal + role change + deactivate)
  - Complexity: medium

## Phase 5 — Analytics

- [ ] **T-5.1** Build `RouteAnalytics` page (Overview tab with KPIs + charts)
  - Complexity: medium
- [ ] **T-5.2** Build Top Routes tab
  - Complexity: low
- [ ] **T-5.3** Build Filter Statistics tab
  - Complexity: low
- [ ] **T-5.4** Build Unresolved Queries tab
  - Complexity: low
- [ ] **T-5.5** Build `QueryBuilder` page (advanced composable analytics)
  - Complexity: medium
- [ ] **T-5.6** Build `UserAnalytics` page
  - Complexity: medium
- [ ] **T-5.7** Build `FeedbackAnalytics` page (list + summary + distribution chart)
  - Complexity: medium

## Phase 6 — Profile, Health, Polish

- [ ] **T-6.1** Build `Profile` page + Edit Profile modal + Change Password modal
  - Complexity: medium
- [ ] **T-6.2** Build `SystemHealth` page (status pills, auto-refresh, last-checked)
  - Complexity: low
- [ ] **T-6.3** Build `NotFound` page
  - Complexity: low
- [ ] **T-6.4** Add loading skeletons, error boundaries, empty states
  - Complexity: medium
- [ ] **T-6.5** Mobile responsive QA pass at 375 / 768 / 1024 / 1440
  - Complexity: medium
- [ ] **T-6.6** Final lint + build pass, fix all warnings
  - Complexity: low

---

## Remaining Work

_(filled in by `/speckit.converge` after implementation)_
