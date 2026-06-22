# Wslny Admin Dashboard — Roadmap & Future Releases

> **Companion docs** (read in this order):
> 1. [`.speckit/constitution.md`](./constitution.md) — governing principles (tech stack is non-negotiable)
> 2. [`.speckit/spec.md`](./spec.md) — what v1 promised, including its **Out of Scope (v1)** list
> 3. [`.speckit/plan.md`](./plan.md) — how v1 was built, including §12 *Open Questions*
> 4. [`.speckit/tasks.md`](./tasks.md) — the original phase-by-phase task list
> 5. [`.speckit/roadmap.md`](./roadmap.md) — **this file** — what's next
>
> **How this file works**: every item is keyed by a stable ID (`R1.x`, `R2.x`, `R3.x`) so we can reference them in commits, PRs, and issues. Acceptance criteria are written so a single contributor can pick up an item, finish it, and mark it done without further questions.

---

## 0. Status of v1

| Item | Status |
|---|---|
| Login (email/password + Google) | ✅ shipped |
| Dashboard with KPIs + charts | ✅ shipped |
| User Management (list, detail, edit, deactivate, change role) | ✅ shipped |
| Route Analytics (4 tabs + Query Builder) | ✅ shipped |
| User Analytics + Feedback Analytics | ✅ shipped |
| System Health | ✅ shipped |
| Profile + Change Password | ✅ shipped |
| Mobile responsive (375 / 768 / 1024 / 1440) | ✅ shipped |
| Token refresh + single-flight refresh queue | ✅ shipped |
| Admin-endpoint allow-list (R11 enforcement) | ✅ shipped |
| Unit tests (63 tests, 4 files) | ✅ shipped |
| `pnpm typecheck` / `lint` / `test` / `build` all green | ✅ shipped |

The current bundle is **~193 KB gzipped** for the initial route (target ≤ 350 KB) and Recharts is lazy-loaded at **~111 KB**.

---

## 1. Release v1.1 — Quality & Hardening (next)

> **Goal**: turn the v1 prototype into something safe to deploy to a production tenant without a "but it works on my machine" disclaimer.
> **Effort**: ~1–2 weeks. Mostly mechanical; no new features for end users.

### R1.1 — Generated TypeScript types from OpenAPI

- **Why**: `src/types/analytics.ts`, `src/types/user.ts` are hand-written mirrors of `endpoints.json` / `Wsnly-Backend/docs/admin-analytics.md`. They drift silently whenever the backend changes. We already have type drift potential in `feedback-analytics-page.tsx` where `feedback.rating` is typed as `number` but is actually a `1..5` integer.
- **Acceptance**:
  - Add `openapi-typescript` as a devDependency
  - Add a `pnpm gen:types` script that fetches `/api/schema/` from the backend (or reads `endpoints.json` offline) and writes to `src/types/api.gen.ts`
  - Replace every manual import from `src/types/{user,analytics}` with the generated module
  - Add `pnpm typecheck` to the script so a CI run fails if the generated file is stale
- **Reference**: plan §12 item 3.

### R1.2 — MSW integration tests for full features

- **Why**: the 63 existing unit tests cover pure logic (formatters, schemas, store, allowlist). They do **not** exercise "user opens Users List → clicks row → sees Detail page" end-to-end on the React side. MSW gives us that without requiring the live backend.
- **Acceptance**:
  - Add `msw` + `@mswjs/data` as devDeps
  - Set up `tests/mocks/handlers.ts` with fixtures for every admin endpoint in `endpoints.json`
  - Write component tests for at least: UsersList (search + filter + paginate), UserDetail (edit + role change), QueryBuilder (run → table renders), FeedbackAnalytics (summary + list + rating filter)
  - Each test mounts the real page through `<MemoryRouter>` + `<QueryClientProvider>` and asserts DOM
- **Reference**: plan §10.3.

### R1.3 — Playwright E2E for the critical user journeys

- **Why**: component tests cannot catch router wiring bugs, `ErrorBoundary` regressions, or auth flow edge cases. A 4-test Playwright suite catches all of these on every PR.
- **Acceptance**:
  - Add `@playwright/test` as devDep
  - Wire `pnpm test:e2e` and add a separate `playwright.config.ts`
  - Four smoke tests:
    1. Login (email/password) → land on Dashboard → see ≥ 1 KPI
    2. Users List → click row → see Detail → toggle `is_active` → assert badge updates
    3. Query Builder → click Run → assert results table renders
    4. System Health → wait for status pill → click Refresh → assert re-render
- **Reference**: plan §10.4.

### R1.4 — CI pipeline (lint + typecheck + test + build + size budget)

- **Why**: today the four quality gates run only locally. We need them enforced on PR.
- **Acceptance**:
  - Add `.github/workflows/ci.yml`
  - Job matrix: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
  - Add `bundlesize` (or rollup-plugin-visualizer) check that fails if `index-*.js` gzipped > 250 KB
  - Upload `dist/` as a build artefact
- **Reference**: constitution §11 (Definition of Done).

### R1.5 — CSP + security headers documentation

- **Why**: R5 in `plan.md` flags XSS exposure of JWT tokens in `localStorage`. The single most important mitigation we can ship without backend changes is a strict CSP in the host page that forbids inline scripts (kills the GIS SDK fallback if misused, blocks any XSS payload). We should at least document the recommended headers.
- **Acceptance**:
  - Add a `docs/deployment.md` (or extend `README.md`) listing the recommended response headers:
    ```
    Content-Security-Policy: default-src 'self'; script-src 'self' https://accounts.google.com; connect-src 'self' <VITE_API_BASE_URL>; img-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-src https://accounts.google.com
    X-Frame-Options: DENY
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
    ```
  - Document Vercel / Netlify / nginx snippets that set these headers
- **Reference**: plan §9 R5.

### R1.6 — Rate-limit (429) handling

- **Why**: `plan.md` R13 acknowledges that the backend allows 60 req/min authenticated and the System Health page refetches every 30s. If the dashboard opens to all admin pages simultaneously we can hit the limit.
- **Acceptance**:
  - In `lib/api/client.ts` response interceptor, when `status === 429`:
    - Show a `react-hot-toast` warning ("Backend rate-limited, slowing down…")
    - For `system.health` queries specifically, bump `refetchInterval` to 60s and back off exponentially (60s → 120s → 240s) until the next successful poll
  - Add a unit test that asserts the toast is shown and `refetchInterval` doubles
- **Reference**: plan §9 R13.

### R1.7 — Cleanup the dashboard "Topbar search" placeholder

- **Why**: the search input in the topbar is currently decorative. Either wire it to a real global search (call `/api/v1/admin/users?search=…` on submit and route to the user detail on click) or remove it.
- **Acceptance**: pick one of:
  - **Option A (recommended)**: remove the decorative input until a real implementation lands; ticket the work as R2.x
  - **Option B**: implement a global user-search that drops results into a `<CommandPalette>` (cmdk) overlay triggered by `Cmd/Ctrl-K`. This is a small feature on its own and is scoped into v1.2.

---

## 2. Release v1.2 — UX polish & operator workflow

> **Goal**: make the dashboard a daily tool rather than a glance-and-leave interface. No backend changes; pure frontend.
> **Effort**: ~2–3 weeks.

### R2.1 — Date-range presets on every chart

- **Why**: every analytics page today shows two `<input type="date">` pickers. Power users want "Last 7 days" / "Last 30 days" / "Last 90 days" / "This month" / "Last month" presets.
- **Acceptance**:
  - New `<DateRangePresets>` shared component in `components/shared/`
  - Wired into: Route Analytics → Overview tab, Route Analytics → Top Routes (when a date range is supported), User Analytics → growth chart, Feedback Analytics → list filter, System Health → tooltip
  - Selecting a preset collapses to the From/To inputs that already exist
- **Reference**: spec FR-15 (server-side pagination context).

### R2.2 — CSV / XLSX export on every table

- **Why**: admins often need to take data offline for incident review. Today the only way to get a row out is screenshot.
- **Acceptance**:
  - New `useExport(filename, rows)` hook that builds a CSV in-browser (no server roundtrip)
  - Wired into: Users List (exports all filtered rows, not just the current page), Feedback List, Top Routes, Top Users, Unresolved reasons
  - Honors the active filter set so exports match what's on screen
- **Reference**: spec FR-15 (pagination) — *server-side filtering is already in place; this just consumes it.*

### R2.3 — Saved queries in Query Builder

- **Why**: `QueryBuilderPage` lets you compose metrics + group-by + sort. Once an admin finds a useful query they rerun it every week. Today they have to rebuild it from scratch.
- **Acceptance**:
  - "Save query" button next to "Run query" stores the current `AnalyticsQueryParams` + name in `localStorage` (key `wslny-admin:saved-queries`)
  - Side panel lists saved queries, click → loads params back into the form (without running it)
  - "Pin to dashboard" option (R2.5) can be wired later

### R2.4 — Notifications dropdown (currently decorative bell)

- **Why**: the topbar bell icon is decorative. Backend doesn't push events yet, so we wire it to a polled "audit log" of recent admin actions (deactivations, role changes) we already have data for.
- **Acceptance**:
  - Backend contract: requires a new endpoint `/api/v1/admin/audit` (out of scope for this client-only release; flag in a separate backend ticket)
  - When the endpoint exists: bell shows a count badge, dropdown lists the last 10 entries with timestamps, "Mark all read" clears the badge

### R2.5 — User detail: activity timeline

- **Why**: `UserDetail` today shows three KPI cards (routes, saved locations, favorites) but no chronological context.
- **Acceptance**:
  - New `UserActivityTimeline` component under `features/users/`
  - Backend ticket: `/api/v1/admin/users/{id}/activity?limit=50` returning `{ created_at, kind, summary }[]`
  - Once available, render as a vertical timeline with icons per `kind` (route_planned, feedback_submitted, login, password_change, …)

### R2.6 — Bulk actions on the Users list

- **Why**: real operators fire dozens of deactivations during abuse incidents. One-at-a-time via the detail page is too slow.
- **Acceptance**:
  - Multi-select checkboxes on each row of the desktop table
  - Action bar appears at the bottom of the screen when ≥1 row is selected
  - Actions: Deactivate selected (calls existing endpoint in a loop with a confirm dialog), Export selected (R2.2)
  - Mobile card view: swipe-to-select

### R2.7 — Empty-state CTAs

- **Why**: `EmptyState` shows a message but no action. On Users List with no results, an admin might want to "Clear all filters"; on Feedback with no reviews, an "Open admin docs" link.
- **Acceptance**:
  - `EmptyState` already accepts `action: ReactNode` — adopt it across pages:
    - Users List "no results" → "Clear filters" button
    - Top Routes empty → "Try a wider date range" button
    - Feedback empty → "View feedback docs" link

---

## 3. Release v2.0 — Scope expansion

> **Goal**: deliver the items that `spec.md` and `plan.md` explicitly deferred, plus the bigger bets the platform needs.
> **Effort**: ~1 quarter of focused work. Requires backend coordination.

### R3.1 — Dark mode (token system already in place)

- **Why**: `tailwind.config.ts` defines both `colors` and `darkMode: ['class']`. The CSS variables in `src/styles/globals.css` can be flipped without code changes. Today's only blocker is no toggle UI.
- **Acceptance**:
  - `useTheme()` hook backed by Zustand `persist`
  - `<ThemeToggle>` in the topbar (sun/moon icon)
  - Honor `prefers-color-scheme` on first visit
  - All Recharts colours already use literal hex (`#4DB6AC` etc.) → swap to `var(--chart-*)` and define dark equivalents in `globals.css`
- **Reference**: spec §Out of Scope, plan §12 item 1.

### R3.2 — Internationalisation (English + Arabic)

- **Why**: Cairo app, Arabic is the natural first additional locale.
- **Acceptance**:
  - Adopt `react-i18next` + `i18next-browser-languagedetector`
  - Extract every user-facing string to `src/locales/{en,ar}.json` — start with the topbar, sidebar, dashboard, login
  - RTL-aware: Tailwind `dir="rtl"` on `<html>` flips every grid, the sidebar moves to the right
  - Number/date formatting goes through `Intl.NumberFormat('ar-EG')` / `date-fns/locale/ar`
- **Reference**: spec §Out of Scope, plan §12 item 2.

### R3.3 — Live tail of route requests (SSE)

- **Why**: today admins re-refresh analytics pages to see new activity. A live tail on the Dashboard would make "platform health" feel actually live.
- **Acceptance**:
  - Backend ticket: `GET /api/v1/admin/analytics/routes/stream` (Server-Sent Events)
  - Client uses native `EventSource` wrapped in a TanStack Query mutation that invalidates `['analytics','routes','overview']` on each event
  - Connection survives `refreshToken` rotation (already handled by the existing axios interceptor)
  - Graceful degradation: if the backend doesn't ship SSE, the page falls back to polling every 30s
- **Reference**: spec §Out of Scope.

### R3.4 — Map visualisation for top routes

- **Why**: `TopRoute` records return `origin_name` + `destination_name` but we already have `origin_lat`/`origin_lon`/`destination_lat`/`destination_lon` on `RouteHistory`. The backend exposes `/api/v1/lines/{route_id}` and `/api/v1/stops/{stop_id}` with polylines. A small Leaflet/MapLibre overlay on the Top Routes tab would make "most requested origin → destination" pop visually.
- **Acceptance**:
  - Backend ticket: ensure `TopRoute` returns coords (currently it's just names)
  - Add Leaflet (`react-leaflet` + OpenStreetMap tiles, no API key required for v1) to the top-routes tab
  - Hovering a row highlights the corresponding polyline
- **Reference**: spec §Out of Scope.

### R3.5 — 2FA / TOTP for admin accounts

- **Why**: the JWT-only flow is fine for internal tools but the spec explicitly deferred 2FA. The Flutter app already supports TOTP via `django-otp`; we mirror it here.
- **Acceptance**:
  - Backend ticket: enable `django_otp` for admin users, add `/api/v1/auth/2fa/verify` endpoint
  - Login flow: after password success, if user has TOTP enrolled, route to `/login/2fa` step before tokens are issued
  - Profile page: "Enable 2FA" / "Disable 2FA" buttons with QR code scanner support
- **Reference**: spec §Out of Scope.

### R3.6 — Read-only transit data browser

- **Why**: today the only way to inspect a bus route or stop is via `/api/v1/lines/{id}` and `/api/v1/stops/{id}`. A simple "Transit" page that lists all lines and their stops would let an admin answer "is route 1234 still running?" without leaving the dashboard.
- **Acceptance**:
  - Three new pages under `features/transit/`: `LinesList`, `LineDetail`, `StopsList` (read-only)
  - Backend already has the endpoints; we just consume them
- **Reference**: spec §Out of Scope.

---

## 4. Cross-cutting / continuous

> These aren't releases — they're ongoing hygiene.

### R4.1 — Storybook for `components/ui/`

- **Why**: every primitive in `components/ui/` (Button, Card, Dialog, Tabs, Select, …) is currently only validated through use in a real page. Storybook gives us visual regression + living documentation.
- **Acceptance**: `pnpm storybook` launches; every primitive has a `.stories.tsx` with at least the variants in actual use; Chromatic or Percy visual regression runs in CI.
- **Reference**: plan §12 item 6.

### R4.2 — Bundle analysis on every PR

- **Why**: we hit the 350 KB target but only because Recharts is lazy. A well-meaning contributor who adds a heavy dep at the top of the tree could silently push us over.
- **Acceptance**: `rollup-plugin-visualizer` outputs `dist/stats.html` on every build; CI comments on PRs with delta in initial-route gzipped size.

### R4.3 — ADRs (Architecture Decision Records)

- **Why**: the next contributor will wonder *why* we picked TanStack Query + Zustand + feature folders. The answers live in PR descriptions today and will be lost.
- **Acceptance**: `docs/adr/0001-zustand-over-redux.md`, `…0002-feature-based-architecture.md`, `…0003-shadcn-over-mui.md`, etc. — one file per non-obvious choice referenced from `plan.md`.

### R4.4 — Dependabot / Renovate

- **Why**: 30+ runtime deps + 20+ devDeps will bit-rot silently.
- **Acceptance**: `.github/dependabot.yml` with weekly groups; auto-merge for `patch` updates after CI passes.

### R4.5 — Component-level error boundaries

- **Why**: `ErrorBoundary` today wraps the whole app. A failure in `<QueryBuilderPage>` takes down the whole layout.
- **Acceptance**: per-page `<PageErrorBoundary>` so a crash on Route Analytics still leaves the sidebar and Users List usable. Add an "Isolate this view" dev-mode toggle.

### R4.6 — Performance: log slow queries

- **Why**: TanStack Query defaults are good, but a single slow endpoint (e.g. analytics overview with a huge `daily_usage`) won't show up in any dashboard.
- **Acceptance**: queryClient `queryCache.subscribe` event hook that logs any query whose `dataUpdatedAt - startedFetching` exceeds 1500 ms; in dev mode it surfaces in the existing `<ErrorBoundary>` warning, in prod it posts to a future `/api/v1/admin/telemetry` endpoint.

---

## 5. Items explicitly deferred forever

These came up in conversation but the **team** decided not to ship them. Recorded here so they don't keep being re-proposed.

| Item | Why deferred |
|---|---|
| Multi-tenant isolation | The dashboard is internal — one tenant only |
| Self-serve admin registration | Admins are seeded by the backend's `ADMIN_PASSWORD` env var; self-serve registration is for end users only |
| Public dashboards / unauthenticated views | All data is sensitive; `RequireAuth` + `RequireAdmin` are mandatory |
| Editing transit data (stops, lines) from the dashboard | The backend has no PATCH/PUT/DELETE on these; the dashboard is read-only by design (spec §Out of Scope) |
| WebSocket / chat-style ops console | Not part of the operations workflow |
| Replace Tailwind with CSS-in-JS | Constitution §2 is non-negotiable on Tailwind; reverse requires amending the constitution first |
| Custom design system (no shadcn) | shadcn gives us accessible primitives without version lock-in; the cost of owning every component is high |
| React Native / Expo port | The Flutter mobile app already serves this need |

---

## 6. How to use this file

1. **Before opening a PR**, search for the relevant R# — if it exists, follow the acceptance criteria exactly; if not, add it to the appropriate release section first.
2. **During planning meetings**, tick off completed R#s and discuss which items in the next release are still relevant (some may have been overtaken by events).
3. **When amending `spec.md` or `plan.md`**, cross-check this roadmap — items may need to move between releases or be removed.
4. **When the team grows**, split each release into its own milestone in the GitHub project; track each R# as an issue.

---

*This file is a living document. Update it when you start work on an item, when you finish one, or when scope changes. The next refresh is expected at the start of v1.2 planning.*
