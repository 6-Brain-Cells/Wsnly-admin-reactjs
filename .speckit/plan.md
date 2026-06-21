# Wslny Admin Dashboard — Technical Plan

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│ Browser (React 18 SPA)                                       │
│ ┌────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│ │  Pages     │→│ Components  │→│ lib/ (api,  │→│ Backend  │  │
│ │ (routes)   │ │ (UI, layout)│ │   auth,     │ │ Django   │  │
│ └────────────┘ └─────────────┘ │   utils)    │ │ REST API │  │
│                                └─────────────┘ └──────────┘  │
│ Zustand (auth)        TanStack Query (server state)          │
│ React Router v6       Axios + interceptors                    │
└──────────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. Vite, not Next.js
- The user said **React** — Vite is the canonical React SPA tool.
- No SSR needed; the dashboard is behind a login.
- Vite gives instant HMR and tiny prod builds.

### 2. TanStack Query for server state, Zustand for auth
- Auth state is **client-only** (token in `localStorage`).
- Everything else (users, analytics) is **server state** — perfect fit for TanStack Query.
- Two distinct concerns → two tools. No Redux.

### 3. Axios with interceptors
- One `client.ts` instance with `baseURL` from `VITE_API_BASE_URL`.
- Request interceptor: attach `Authorization: Bearer <token>`.
- Response interceptor: on `401`, try `POST /auth/refresh`; if refresh succeeds, retry original; else logout + redirect.

### 4. Tailwind theme = brand palette
- `tailwind.config.ts` maps every `AppColors` value to a semantic token.
- We use the tokens (`bg-primary`, `text-text-primary`), never raw hex in JSX.

### 5. File structure
```
src/
├── main.tsx
├── App.tsx
├── routes.tsx
├── lib/
│   ├── api/        client + endpoints
│   ├── auth/       Zustand store
│   ├── hooks/      useDebounce, useMediaQuery
│   ├── utils/      cn, formatters
│   └── constants/  paths, roles, filter enum
├── components/
│   ├── ui/         Button, Card, Input, Modal, Badge, Skeleton, Select, Tabs
│   ├── layout/     AdminLayout, Sidebar, Topbar, MobileDrawer
│   ├── charts/     KPICard, LineChartCard, BarChartCard, DonutChart
│   └── tables/     DataTable, Pagination
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
└── types/
    ├── auth.ts
    ├── user.ts
    └── analytics.ts
```

### 6. Routing & guards
- `RequireAuth` — redirects to `/login` if not signed in.
- `RequireAdmin` — redirects to `/login` with toast if not admin.
- All admin pages live under `/` (the AdminLayout) except `/login`.

### 7. Forms
- `react-hook-form` for state, `zod` for schemas, `@hookform/resolvers` to bridge.
- One schema per form, declared inline.

### 8. Charts
- `recharts` with **responsive containers**.
- Custom theme colors via Tailwind tokens (read from CSS vars at runtime via `getComputedStyle`, or just hardcode the same hexes inside `recharts` props — simpler and avoids a flash).

### 9. State of each page (high level)

| Page | Query keys | Mutations |
|---|---|---|
| Dashboard | `['analytics','routes','overview']`, `['analytics','users','overview']`, `['analytics','feedback','summary']` | — |
| UsersList | `['admin','users', { search, role, page }]` | `useMutation` for deactivate, change-role |
| UserDetail | `['admin','users', id]` | edit, deactivate, change-role |
| RouteAnalytics | `['analytics','routes', view, filters]` | — |
| UserAnalytics | `['analytics','users','overview']` | — |
| FeedbackAnalytics | `['analytics','feedback', filters]`, `['analytics','feedback','summary']` | — |
| QueryBuilder | `['analytics','routes','query', params]` | — |
| SystemHealth | `['system','health']` (refetch 30s) | — |
| Profile | `['auth','profile']` | update profile, change password |

### 10. Mobile UX
- Sidebar becomes a slide-in drawer (overlay + transform).
- Tables become **card lists** below 768px (custom `DataTable` accepts a `mobileCard` render prop).
- All grids collapse to 1 column under 768px.

---

## Dependencies

```json
{
  "dependencies": {
    "@fontsource/inter": "^5.0.0",
    "@hookform/resolvers": "^3.9.0",
    "@tanstack/react-query": "^5.59.0",
    "axios": "^1.7.0",
    "clsx": "^2.1.0",
    "date-fns": "^4.0.0",
    "lucide-react": "^0.460.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-hook-form": "^7.53.0",
    "react-hot-toast": "^2.4.0",
    "react-router-dom": "^6.27.0",
    "recharts": "^2.13.0",
    "tailwind-merge": "^2.5.0",
    "zod": "^3.23.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0"
  }
}
```

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Backend not running while developing UI | Use `pnpm dev` with `VITE_API_BASE_URL=http://localhost:8000`; document a mock data mode later if needed. |
| Google OAuth requires real client ID | Default to **email/password login** as the primary path; Google button is present but disabled with a tooltip if `VITE_GOOGLE_CLIENT_ID` is missing. |
| Recharts SSR warnings | N/A — pure SPA. |
| Bundle size from Recharts | Lazy-load the entire `charts/` chunk via `React.lazy`. |
| Token refresh race conditions | Single in-flight refresh promise; queue other 401s while it resolves. |

---

## Build Phases

Already outlined in `/tasks.md` and tracked in the todo list.
