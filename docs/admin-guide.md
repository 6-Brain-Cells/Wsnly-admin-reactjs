# Wslny Admin Dashboard — Operator Guide

The **Wslny Admin Dashboard** is the operations console for the Wslny
public-transit platform (Cairo, Egypt). It gives platform operators a
single, mobile-friendly interface to monitor usage, manage user
accounts, analyse routing performance, and triage feedback — driven
by the Django REST API consumed by the same backend that powers the
commuter mobile app.

This guide walks through every screen in the dashboard from the
operator's point of view. Every screen has a **Fig N.M** reference and
a description of what the screenshot should contain so it can be
captured or replaced.

---

## 1. Sign-In Screen:

The Sign-In screen is the entry point to the dashboard. It presents a
two-column layout on desktop — a teal brand panel on the left with the
Wslny identity, a short value-proposition headline, and live platform
stats (stops, routes, polylines); on the right, a clean white form card
asking for the operator's email and password. On mobile, the brand
panel collapses and the form takes the full width. A "Continue with
Google" button appears below a divider if the tenant has Google OAuth
configured; otherwise only the email/password form is shown. Submitting
valid credentials stores JWT tokens locally and redirects the operator
to the Dashboard. Invalid credentials surface an inline error toast in
the top-right corner. A "Forgot password?" link is visible but routes
to the platform administrator in this version (no self-serve reset).

**Fig 1.1 Sign-in screen**

> **📸 Image description:** 1440×900 desktop. Left teal gradient panel
> with shield icon, "Wslny Admin / Operations Console" header, headline
> "Move Cairo, one route at a time.", three stat tiles (646 Stops, 441
> Routes, 242K Polylines). Right white card with "Welcome back" heading,
> Email and Password fields (password with eye-toggle), full-width teal
> **Sign in** button, "or" divider and Google button visible.

---

## 2. Dashboard:

The Dashboard is the operator's home base and the default landing
page after sign-in. It surfaces four KPI cards at the top — Total
Users, Route Requests (with success-rate subtitle), Avg Duration
(with avg-distance subtitle), and Avg Rating (with review-count
subtitle) — followed by a Daily Route Requests line chart on the left
and a Text-vs-Map request-source donut on the right, and a third row
of three clickable drill-in cards (User Growth, Feedback, Performance)
that deep-link into their respective analytics pages. The data is
fetched in parallel from the route, user, and feedback analytics
endpoints and cached for 30 seconds. Empty or loading states render
skeleton placeholders rather than spinners. On mobile, the entire
grid collapses to a single column.

**Fig 2.1 Dashboard (desktop)**
**Fig 2.2 Dashboard (mobile)**

> **📸 Image description (2.1):** 1440×900. Page header "Dashboard".
> Row of 4 KPI cards. Two-column area: teal line chart (left, 2/3
> width) labelled "Daily route requests", teal donut (right, 1/3
> width) labelled "Request source". Three drill-in cards in the
> bottom row.
>
> **📸 Image description (2.2):** 375×812. Same content stacked
> vertically: KPIs as 2-column grid then full-width, then charts
> stacked, then drill-in cards stacked.

---

## 3. User Management:

### Users List:

The Users List is a searchable, filterable, server-paginated table of
every account on the platform. A search input at the top matches name,
email, or phone (debounced 300 ms); a Role select (All / Admin / User)
and a Status select (All / Active / Inactive) narrow the result set;
clicking a row opens the User Detail page for that account. The table
shows avatar+name+email, role badge, status badge, join date, and ID
on desktop; on mobile the table becomes a stack of tappable cards
showing the same information. A pagination bar at the bottom controls
page size (10 / 20 / 50 / 100) and current page. Empty result sets
render a friendly empty state with a "Clear filters" suggestion when
filters are active.

**Fig 3.1 Users list (desktop)**
**Fig 3.2 Users list (mobile)**

> **📸 Image description (3.1):** 1440×900. Filter bar with search
> input + Role select + Status select. Table with columns User, Role,
> Status, Joined, ID; rows show avatar+name+email, role badge
> (teal/grey), status badge (green/red), date. Pagination at the
> bottom.
>
> **📸 Image description (3.2):** 375×812. Filter bar stacked
> vertically; users rendered as vertical cards with avatar, name,
> email, role+status badges; pagination at the bottom.

### User Detail:

The User Detail page opens when a row (or mobile card) is clicked and
shows everything an operator needs to manage one account. A header
card holds the avatar, full name, email, role badge, status badge,
and — if the operator is viewing their own account — a small "You"
badge; on the right of the header card are the action buttons (Edit
and Change role). Below the header, three KPI cards summarise the
user's activity: Total Routes, Saved Locations, and Favorite Routes.
The next row contains a Profile Details grid (name, email, phone,
gender, address, joined) and a Danger Zone card with a single
Deactivate button (disabled if the user is already inactive or if
the operator is viewing their own account).

**Fig 3.3 User detail**
**Fig 3.4 Edit user modal**

> **📸 Image description (3.3):** 1440×900. "Back to users" link.
> Header card with large avatar, name, email, badges, and Edit +
> Change-role buttons. Three stat cards in a row. Two-column area:
> Profile Details grid (left, 2/3), Danger Zone card (right, 1/3)
> with a red Deactivate button.
>
> **📸 Image description (3.4):** 1440×900. Centred modal with a
> dimmed backdrop. Title "Edit user", form with First/Last name,
> Mobile, Address, Gender select, Role select, Active toggle, and
> Cancel + Save changes footer buttons.

### Edit / Change Role / Deactivate:

Editing opens a modal pre-filled with the user's current values and
saves changes back to the backend on submit. Change Role is a smaller
modal that flips the user between Admin and User (a privilege
escalation — promote sparingly). Deactivate is a destructive action
in the Danger Zone: it flips `is_active` to false (the user can no
longer sign in but their data is preserved for analytics). Re-enabling
a deactivated user is done by editing them and flipping the Active
switch back on.

---

## 4. Route Analytics:

Route Analytics answers "is the routing engine healthy?" across four
tabs that share a common filter bar.

### Overview:

The Overview tab is the default and shows platform-wide routing KPIs
for the selected date range and source filter (All / Text / Map).
Four KPI cards summarise Total Requests, Success Rate (with a green
trend icon), Failed count, and Average Latency. Below, a Daily Usage
line chart shows requests per day, a Request Source donut compares
Text vs Map, a Latency Breakdown card shows three horizontal bars
(AI service, Routing engine, Total), and three smaller cards report
Average Trip (duration, distance, success/failed counts) and a
giant-number Health card showing the overall success rate.

**Fig 4.1 Route Analytics – Overview**

> **📸 Image description:** 1440×900. Filter bar with From/To date
> inputs + Source select. Tabs row (Overview active). 4 KPI cards.
> Two-column: Daily Usage line chart (left, wide) + Request Source
> donut (right, narrow). Three cards: Latency Breakdown, Average
> Trip, Health (big %).

### Top Routes:

The Top Routes tab shows the 15 most-requested origin → destination
pairs as a horizontal bar chart, with a detail table below listing
rank, origin, destination, request count, average duration, and
average distance for each pair. Use it to spot corridors where demand
is concentrated.

**Fig 4.2 Route Analytics – Top routes**

> **📸 Image description:** 1444×900. Tabs row (Top routes active).
> Horizontal bar chart of 15 "From → To" pairs. Detail table with
> columns #, Origin, Destination, Requests (badge), Avg time,
> Avg dist.

### Filters:

The Filters tab breaks routing requests down by the user's chosen
preference — Optimal, Fastest, Cheapest, Bus Only, Microbus Only, or
Metro Only. A bar chart shows request volume per filter, and six
stat cards below show per-filter request count, success rate, average
duration, and average fare (in EGP).

**Fig 4.3 Route Analytics – Filters**

> **📸 Image description:** 1440×900. Tabs row (Filters active). Bar
> chart of filter usage. 3×2 grid of stat cards (one per filter)
> showing filter name, ID badge, Requests, Success rate, Avg
> duration, Avg fare.

### Unresolved:

The Unresolved tab surfaces failed routing requests. A vertical list
groups failures by reason code (with counts as red badges); a side
card shows the Long Walks count (routes flagged with unusually long
walking distance); a full-width Top Failed Queries table lists the
most common input texts that failed, alongside their error codes and
counts. Use this tab to identify patterns (e.g. users asking for
places the system doesn't cover).

**Fig 4.4 Route Analytics – Unresolved**

> **📸 Image description:** 1440×900. Tabs row (Unresolved active).
> Two-column: Unresolved Reasons list (left, wide, with red alert
> icons) + Long Walks card (right, narrow, big number). Full-width
> Top Failed Queries table below.

---

## 5. User Analytics:

User Analytics tracks growth and engagement. Four KPI cards show
Total Users, Active, Inactive, and Admins; a Daily Registrations line
chart shows new users per day; an Engagement card reports Users with
Routes, Avg Routes per User, and Activation Rate (the percentage of
users who have made at least one routing request); a Top Users by
Routes table ranks the most active accounts.

**Fig 5.1 User Analytics**

> **📸 Image description:** 1440×900. Page header "User Analytics".
> 4 KPI cards. Two-column: Daily Registrations line chart (left,
> wide) + Engagement card (right, narrow). Top Users by Routes
> table full-width below.

---

## 6. Feedback:

Feedback lets operators read what users are saying about their
routing experience, across two tabs.

### Summary:

The Summary tab shows the aggregate picture: three KPI cards (Total
Feedback, Average Rating, 5-Star Reviews) and a Rating Distribution
card with five horizontal bars — one per star rating — showing both
the count and the percentage of reviews at each level.

**Fig 6.1 Feedback – Summary**

> **📸 Image description:** 1440×900. Tabs row (Summary active).
> 3 KPI cards (Total Feedback / Average Rating / 5-Star Reviews).
> Rating Distribution card with 5 horizontal bars labelled 5/4/3/2/1,
> each showing a teal bar plus count and percentage.

### All Reviews:

The All Reviews tab lists every review in a paginated card list,
with a Min-Rating select (All / 5 / 4+ / 3+ / 2+ / 1+) at the top.
Each review row shows a circular avatar with the first letter of the
reviewer's email, the email and timestamp, a 5-star rating display,
and the comment text in quotation marks. The list is sorted by rating
ascending then date descending, so the most critical reviews surface
first.

**Fig 6.2 Feedback – All reviews**

> **📸 Image description:** 1440×900. Tabs row (All reviews active).
> Filter bar with "X reviews" count + Min rating select. Vertical
> list of review cards, each with avatar, email, timestamp, star
> row, and quoted comment. Pagination at the bottom.

---

## 7. Query Builder:

The Query Builder is for power users who need answers the canned
analytics pages don't provide. Four preset cards (Daily success rate,
By source, Per-route-filter performance, Latency breakdown by status)
let operators launch a useful query in one click; below, a Compose
panel lets them mix-and-match 11 metric pills and 6 group-by pills,
pick a sort field, order, and limit (1–200). A live Request URL
panel on the right previews the exact API call (and supports copy-
to-clipboard). Below, a Results table renders dynamic columns from
the response. Reset clears the form and results.

**Fig 7.1 Query Builder (initial)**
**Fig 7.2 Query Builder (after running)**

> **📸 Image description (7.1):** 1440×900. Preset cards in a 2-col
> grid. Compose panel (left, wide) with empty metric and group-by
> pill rows + Sort/Order/Limit selects + Run query button. Request
> URL panel (right, narrow) showing `GET /api/v1/admin/analytics/
> routes/query`. Empty Results panel below.
>
> **📸 Image description (7.2):** 1440×900. Compose panel populated
> with selected pills (e.g. Requests + Success rate, group by Day).
> Request URL panel showing the query string. Results panel showing
> a populated table with rows of aggregated metrics.

---

## 8. System Health:

System Health shows the live status of the three dependencies the
platform needs to function: Database (PostgreSQL), AI Service (NLP +
geocoding), and Routing Engine (A* pathfinding over gRPC). Three
status pills at the top — green check + "Operational" / "OK" badge
when up, red X + "Down" / "FAIL" badge when down — auto-refresh
every 30 seconds. A wide Overall Status banner summarises everything
as "All systems operational" or "Degraded performance". The page also
displays Last-Checked timestamp and a manual Refresh button. The
backend reports a single all-or-nothing status code; if anything is
red, use the analytics pages to triangulate which dependency is
actually broken.

**Fig 8.1 System Health**

> **📸 Image description:** 1440×900. Page header "System Health"
> with "Last checked" timestamp and Refresh button. Row of 3 status
> pills (DB / AI Service / Routing Engine) all green. Overall status
> banner with large green check and "All systems operational".
> Three service-description cards at the bottom (PostgreSQL, AI
> Service, RoutingEngine).

---

## 9. Profile:

The Profile page is where the operator manages their own admin
account. A header card shows the operator's avatar, name, email,
role badge, active badge, and staff badge, with Edit Profile and
Change Password buttons on the right. An Account Details card below
shows every profile field in a labelled grid. The Edit Profile modal
lets the operator change first/last name, mobile, address, and
gender; the Change Password modal enforces a strong-password policy
(8+ characters, at least one letter, at least one number, and a
matching confirmation field).

**Fig 9.1 Profile**

> **📸 Image description:** 1440×900. Page header "Profile". Header
> card with avatar, name, email, three badges, and Edit +
> Change-password buttons. Account Details card with 2-column grid
> of label-value rows (First name, Last name, Email, Mobile, Gender,
> Address, Role, Joined).

---

## 10. Sign-Out:

Sign-out is available in two places — the bottom of the sidebar
(desktop) and the avatar dropdown in the top bar (mobile and
desktop). Clicking it clears the local token store and returns the
operator to the Sign-In screen. Always sign out on shared computers.

---

## 11. Common UI Behaviour:

Across every page the dashboard uses a small set of consistent
patterns. **Loading** states render grey shimmering skeletons instead
of spinners; **errors** render an inline Error State card with a
"Trying again" retry link; **empty** states render a friendly message
with an optional CTA (e.g. "Clear filters"); **toasts** (success and
error) appear in the top-right corner and auto-dismiss after 4
seconds. **Pagination** sits at the bottom of every long table with a
page-size selector and first/prev/next/last controls. On mobile, the
sidebar is replaced by a slide-in drawer toggled by a hamburger
button; tapping the dimmed overlay, pressing the X button, or pressing
Escape all close the drawer. The dashboard is keyboard-navigable
throughout, with visible teal focus rings on every interactive element.

---

## 12. Troubleshooting (Quick Reference):

- **Session expired / kicked to login** → sign in again; if it keeps
  happening, your refresh token may have been revoked.
- **System Health all-red** → the backend reports a single status;
  check User Analytics (database), Route Analytics – Unresolved (AI /
  routing), or success-rate drops (routing) to triangulate. Notify the
  platform team.
- **Charts blank with "No data to display yet"** → the selected date
  range or source filter excludes everything; click Clear or switch to
  All sources.
- **A page hangs on skeletons for > 10 s** → wait 5 more seconds,
  check System Health, then refresh the page (`Cmd/Ctrl + R`).
- **Mobile drawer stuck open** → tap the X button, press Escape, or
  refresh the page.
- **Action fails with no detail** → the most common cause is a
  validation rule on the backend; re-open the user/object, confirm
  values, and retry.

---

## 13. Appendix — Endpoint Reference (for the curious):

The dashboard never calls the Flutter mobile client's endpoints. The
allow-list is enforced both at the API client (dev console errors)
and at the architecture level (`.speckit/plan.md` §0.2). The endpoints
the dashboard does call, grouped by page:

| Page | Endpoint |
|---|---|
| Sign in | `POST /api/v1/auth/login`, `POST /api/v1/auth/google-login`, `POST /api/v1/auth/refresh` |
| Profile (read / update / password) | `GET/PUT /api/v1/auth/profile`, `POST /api/v1/auth/change-password` |
| Dashboard | `GET /api/v1/admin/analytics/{routes/overview, users/overview, feedback/summary}` |
| Users list / detail / edit / deactivate | `GET /api/v1/admin/users{,/{id}}`, `PUT /api/v1/admin/users/{id}`, `DELETE /api/v1/admin/users/{id}` |
| Change role | `POST /api/v1/admin/change-role` |
| Route Analytics | `GET /api/v1/admin/analytics/routes/{overview, top-routes, filters, unresolved}` |
| User Analytics | `GET /api/v1/admin/analytics/users/overview` |
| Feedback | `GET /api/v1/admin/analytics/feedback{,/summary}` |
| Query Builder | `GET /api/v1/admin/analytics/routes/query` |
| System Health | `GET /api/health` |

The dashboard is **read-mostly**; nothing is stored locally except the
JWT tokens in `localStorage`. The query cache lives in memory and
refreshes every 30 seconds by default.

---

_End of guide. Last updated: 2026-06-25._
