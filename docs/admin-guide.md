# Wslny Admin Dashboard — Operator Guide

> **A complete walkthrough of every screen in the Wslny Admin Dashboard, written for the people who use it day-to-day.**

This guide mirrors the structure of the Wslny mobile-app operator doc: each
chapter covers one screen or feature, describes what you see, and walks you
through the actions you can take. Screenshots are referenced as
**Fig N.M** and live in the [`images/`](images/) folder. Beneath every
figure you'll find an **"Image description"** block describing exactly
what the screenshot should contain — useful when capturing or replacing
the image.

---

## Table of contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started) — sign in, layout, sign out
3. [Dashboard](#3-dashboard) — your at-a-glance platform health
4. [Users](#4-users) — search, view, edit, deactivate, change role
5. [Route Analytics](#5-route-analytics) — overview, top routes, filters, unresolved
6. [User Analytics](#6-user-analytics) — growth and engagement
7. [Feedback](#7-feedback) — review summaries and the full list
8. [Query Builder](#8-query-builder) — composable analytics with presets
9. [System Health](#9-system-health) — live status of dependencies
10. [Profile](#10-profile) — your own admin account
11. [Common UI Patterns](#11-common-ui-patterns) — loading, errors, toasts
12. [Troubleshooting](#12-troubleshooting) — when something looks wrong
13. [Appendix](#13-appendix) — glossary, endpoint map, accessibility notes

---

## 1. Introduction

### 1.1 What this dashboard is

The **Wslny Admin Dashboard** is the operations console for the Wslny
public-transit platform. While commuters use the Wslny mobile app to
plan trips, this dashboard is where **platform operators** (people like
you) come to:

- See how the platform is doing at a glance.
- Find and manage any user account.
- Understand how the routing engine is performing.
- Read what users are saying in their feedback.
- Build a custom analytics query when the canned reports don't have
  what you need.
- Confirm that the database, AI service, and routing engine are all up.

### 1.2 Who it's for

This guide is for **operators** — the people who log in to the dashboard
to do their job. You don't need to know anything about code, APIs, or
React. If you can use a web browser, you can use this dashboard.

If you're looking for technical material (architecture, API contract,
deployment), see the [Documentation index](README.md).

### 1.3 Technical requirements

- A modern web browser (Chrome, Firefox, Safari, or Edge — released in
  the last two years).
- A screen at least **375 px wide** (a phone in portrait) and ideally
  **1440 px** (a desktop monitor). The dashboard is fully usable on a
  phone.
- A network connection to the Wslny API.

### 1.4 Glossary

| Term | Meaning |
|---|---|
| **KPI** | Key Performance Indicator — a single number that summarises a metric (e.g. "Total Users = 12,438"). |
| **Success rate** | The percentage of routing requests that ended successfully, out of all routing requests in the same period. |
| **Latency** | How long a routing request took from the user's tap to the answer on their screen. Measured in milliseconds (ms). |
| **Filter** (routing) | A user preference when asking for a route: *optimal*, *fastest*, *cheapest*, *bus only*, *microbus only*, or *metro only*. |
| **Source** (text vs. map) | Where the routing request came from: the user typed free text, or picked points on the map. |
| **EGP** | Egyptian Pound — the currency used in fare displays. |
| **Token** | A short-lived digital key that proves you're signed in. The dashboard keeps one for you and refreshes it automatically when it expires. |
| **Admin** | A user with the `Admin` role. Only Admins can sign in to this dashboard. |

---

## 2. Getting Started

### 2.1 Signing in

You'll see the sign-in screen whenever you open the dashboard URL
without an active session. The same screen appears if your session has
expired.

![Fig 2.1: Sign-in screen](images/fig-2.1.png)

> **📸 Image description — Fig 2.1**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - Left half: a teal-to-dark-teal gradient panel. At the top, a small
>   white-on-teal shield icon next to the words "Wslny Admin" and
>   "Operations Console". In the middle, the headline "Move Cairo, one
>   route at a time." followed by a one-paragraph description. At the
>   bottom, three small stat tiles in a row showing **646 Stops**,
>   **441 Routes**, **242K Polylines**. A copyright line at the very
>   bottom.
> - Right half: a white card with the heading "Welcome back", a small
>   subline, then two labelled inputs (**Email** filled with
>   `admin@wslny.com`, **Password** filled with bullet characters), an
>   eye-icon toggle inside the password field, a "Forgot password?"
>   link on the right of the password row, and a full-width teal
>   **Sign in** button.
> - Form should be in a clean, non-error state (no red borders).

**What the screen shows:**

- The **email** field is where you type your admin email.
- The **password** field hides what you type by default. Click the
  small eye icon inside the field to make the password visible while
  you check it; click again to hide it.
- The **Sign in** button submits the form.
- A small **"Forgot password?"** link sits next to the password label.
  Clicking it shows a placeholder — in this version of the dashboard,
  password resets are handled by the platform administrator, not by
  the dashboard itself.
- If your tenant has been configured for Google sign-in, you'll see a
  horizontal divider with the word **"or"**, then a **Continue with
  Google** button below it. If you don't see this divider, your tenant
  isn't using Google sign-in — use the email/password form.

**Step-by-step:**

1. Open the dashboard URL in your browser.
2. If you see **"Welcome back"** in the top-left of the form, you're on
   the sign-in screen. If you instead see a list of menu items on the
   left, you're already signed in — skip to [§2.2](#22-what-happens-after-sign-in).
3. Click into the **Email** field and type your admin email address
   (for example, `admin@wslny.com`).
4. Click into the **Password** field and type your password.
5. *(Optional)* Click the eye icon to reveal what you typed so you can
   double-check it.
6. Click the teal **Sign in** button.
7. You should be redirected to the Dashboard within a second or two.
   If sign-in fails, a red toast appears in the top-right corner with
   the error message; correct the field and try again.

> **💡 Tip — Try the eye icon if you mistype.**
> Passwords are case-sensitive. If the toast says *"Invalid email or
> password"*, click the eye icon to confirm caps lock isn't on, then
> retry.

> **💡 Tip — The Google button is optional.**
> If the "or" divider and Google button aren't there, your
> organisation hasn't enabled Google sign-in. Email + password is the
> only path.

### 2.2 What happens after sign-in

Once your credentials are accepted, the dashboard fades in. Here's what
you see:

**On desktop (screen ≥ 1024 px wide):**

![Fig 2.2: Desktop layout after sign-in](images/fig-2.2.png)

> **📸 Image description — Fig 2.2**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - **Left sidebar (256 px wide):** teal-on-white panel. At the top,
>   a small white-on-teal wrench icon next to "Wslny" and
>   "Admin Console". Below that, a vertical list of seven navigation
>   items, each with an icon to the left of its label:
>   *Dashboard*, *Users*, *Route Analytics*, *User Analytics*,
>   *Feedback*, *Query Builder*, *System Health*. The active item is
>   highlighted with a soft teal background. Below the nav, separated
>   by a thin line, are two more items: *Profile* (with a user icon)
>   and *Sign out* (with a logout icon, in red on hover).
> - **Top bar (full width of the right area):** a white strip with a
>   subtle bottom border. On the left, a page title in dark text
>   ("Dashboard"). On the right, a small bell icon (notifications,
>   currently decorative) and a circular avatar with the admin's
>   initials.
> - **Main area:** the page content (in this case the Dashboard
>   cards and charts). Generous padding around the content.

**On mobile (screen < 768 px wide):**

![Fig 2.3: Mobile layout with navigation drawer open](images/fig-2.3.png)

> **📸 Image description — Fig 2.3**
> **Viewport:** 375 × 812 mobile (iPhone-class).
> **Visible elements:**
> - The same content as desktop, but **stacked into a single column**.
> - The sidebar is **hidden**. Instead, in the top bar's left corner,
>   there's a small hamburger button (three horizontal lines).
> - In this screenshot, the hamburger has been tapped, so a **drawer
>   slides in from the left** covering about 85 % of the screen width.
>   The drawer contains the same seven nav items + Profile + Sign out.
> - Behind the drawer, the page content is dimmed by a semi-transparent
>   black overlay.
> - Tap anywhere on the overlay (or press the **X** button at the top
>   of the drawer, or press the **Escape** key on a physical keyboard)
>   to close it.

**Common to both layouts:**

- A **sidebar** (desktop) or a **drawer** (mobile) for navigation. The
  seven main sections are: **Dashboard, Users, Route Analytics, User
  Analytics, Feedback, Query Builder, System Health.** Profile and
  Sign-out are at the bottom of the list.
- A **top bar** showing the page title on the left, and a notification
  bell + your avatar on the right.
- The **main content area** below, where each page renders its own
  cards, tables, and charts.

**Top-right account menu:**

Click your avatar (the circle with your initials) in the top-right
corner to open a small menu:

![Fig 2.4: Avatar dropdown menu](images/fig-2.4.png)

> **📸 Image description — Fig 2.4**
> **Viewport:** 1440 × 900, zoomed to the top-right corner.
> **Visible elements:**
> - A small white dropdown panel anchored to the bottom-left of the
>   avatar button.
> - At the top of the panel, in muted text, your **first name, last
>   name**, and **email**.
> - A thin separator line.
> - Two menu items, each with an icon on the left: **Profile** (user
>   icon) and **Sign out** (logout icon, red).

### 2.3 Signing out

There are two ways to sign out:

1. **From the sidebar (desktop):** scroll to the bottom and click
   **Sign out** in red.
2. **From the top bar:** click your avatar → **Sign out**.

Either way, your local session is cleared, your tokens are removed,
and you're returned to the [sign-in screen](#21-signing-in).

> **💡 Tip — Sign out on shared computers.**
> If you're using a shared or public computer, always sign out when
> you finish. The dashboard remembers your session until you do, so
> the next person to open the dashboard could see your data.

---

## 3. Dashboard

The Dashboard is your home base. It opens automatically after you sign
in, and is the first item in the sidebar. It summarises everything you
care about at the platform level in one screen.

![Fig 3.1: Dashboard on desktop](images/fig-3.1.png)

> **📸 Image description — Fig 3.1**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - A page header at the top with the title **"Dashboard"** and a
>   short subtitle ("A live snapshot of platform health, usage, and user
>   satisfaction.").
> - A row of **four KPI cards** (white cards, each with a small
>   coloured circular icon in the top-right corner):
>   1. **Total Users** — large number with a users icon.
>   2. **Route Requests** — large number with a map-pin icon, with a
>      small subtitle showing the success rate (e.g. "94.2 % success").
>   3. **Avg Duration** — formatted time (e.g. "18m 42s") with a clock
>      icon, subtitle showing the average distance (e.g. "8.4 km avg").
>   4. **Avg Rating** — number out of 5 (e.g. "4.32") with a yellow
>      star icon, subtitle showing the total review count (e.g.
>      "1,287 reviews").
> - Below the KPIs, a two-column area:
>   - **Left, wider card:** "Daily route requests — Last 30 days of
>     routing activity" with a teal line chart showing one data point
>     per day.
>   - **Right, narrower card:** "Request source — Text vs. map mode"
>     with a teal donut chart and a tiny legend (Text / Map).
> - Below the charts, a third row of three smaller cards (clickable):
>   **User growth** (showing total / active / admins), **Feedback**
>   (showing the average rating with a star icon and the review count),
>   and **Performance** (showing success rate, AI latency, routing
>   latency, each on its own line).

![Fig 3.2: Dashboard on mobile](images/fig-3.2.png)

> **📸 Image description — Fig 3.2**
> **Viewport:** 375 × 812 mobile.
> **Visible elements:**
> - Same content as Fig 3.1, but **stacked into a single column**:
>   - KPI cards become a 2-column grid on small screens, then full-
>     width on very narrow screens.
>   - The line chart fills the width of the screen.
>   - The donut chart sits below the line chart, also full-width.
>   - The three drill-in cards stack vertically.

### 3.1 What the four KPI cards mean

Each card surfaces one number that you probably check every day:

1. **Total Users** — every account on the platform, including Admins
   and inactive accounts. A growing number is good.
2. **Route Requests** — how many routing requests the system handled
   in the period. The subtitle shows the success rate, so a large
   number with a low success rate is a problem.
3. **Avg Duration** — how long, on average, a successful route takes.
   Pair this with the average distance subtitle to spot anomalies.
4. **Avg Rating** — the average star rating across all feedback
   received. The subtitle is the total number of reviews.

> **💡 Tip — Numbers that show "—"**
> If a card shows **—** instead of a number, the data hasn't loaded
> yet. Wait a moment; the value will appear as soon as the API
> responds. If it stays "—" for more than a few seconds, refresh the
> page.

### 3.2 Daily route requests chart

The teal line chart shows how many routing requests came in each day
over the last 30 days. Use it to spot:

- **Spikes** — a sudden jump usually means an external event (a
  holiday, a transit strike, a marketing push).
- **Dips** — weekends often dip, but an unexpected midweek dip might
  mean something is broken.
- **Trends** — the overall slope (up, flat, down) over the month.

Hover your cursor over any point on the line to see the exact date and
count for that day.

### 3.3 Request source donut

The donut shows what proportion of routing requests came in via
**Text** (the user typed free text) versus **Map** (the user tapped
points on a map). In Cairo, text tends to dominate; if Map usage
suddenly drops, it might indicate a UI bug.

### 3.4 The three drill-in cards

Below the charts you'll see three smaller cards. Each is a clickable
shortcut into a deeper page:

- **User growth** → opens [User Analytics](#6-user-analytics).
- **Feedback** → opens [Feedback → Summary](#7-feedback).
- **Performance** → opens [Route Analytics → Overview](#51-overview-tab).

### 3.5 Step-by-step: Reading the Dashboard

1. Sign in. The Dashboard opens automatically.
2. Scan the four KPI cards from left to right. Anything surprising?
3. Glance at the line chart — is today's count normal for the week?
4. Check the donut — is the Text/Map split roughly where you expect?
5. If you want to dig in, click one of the three drill-in cards.

---

## 4. Users

The Users section lets you find any account on the platform, see what
they've been doing, and change their details or status.

### 4.1 The Users list

The list is the default view when you click **Users** in the sidebar.

![Fig 4.1: Users list on desktop](images/fig-4.1.png)

> **📸 Image description — Fig 4.1**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - Page header with title **"Users"** and subtitle "Search, filter,
>   and manage every account on the platform."
> - A **filter bar card** containing:
>   - A wide search input on the left (with a magnifying-glass icon
>     inside) and placeholder text "Search by name, email, phone…". A
>     small **X** button appears on the right when there's text.
>   - Two **dropdown selects** on the right: **All roles** (options:
>     All roles / Admin / User) and **All users** (options: All users /
>     Active / Inactive).
> - Below the filter bar, a **table card** with column headers
>   (User, Role, Status, Joined, blank for actions). Each row is one
>   user: a circular avatar with initials, full name (bold), email
>   below in muted text, a **role badge** (teal for Admin, grey for
>   User), a **status badge** (green "Active" or red "Inactive"), a
>   date, and an ID like "ID #142".
> - A **pagination bar** at the bottom: "Showing 1–20 of 247" on the
>   left, a page-size selector ("20 / page") in the middle, and
>   first/prev/page-of-total/next/last buttons on the right.

![Fig 4.2: Users list on mobile](images/fig-4.2.png)

> **📸 Image description — Fig 4.2**
> **Viewport:** 375 × 812 mobile.
> **Visible elements:**
> - Page header.
> - The filter bar is now **stacked vertically**: search input full
>   width, then the two selects side-by-side on a 2-column grid.
> - Instead of a table, each user is a **card** stacked vertically:
>   a circular avatar on the left, then name + email on top, with
>   role and status badges below. Tapping anywhere on the card opens
>   that user's detail page.
> - Pagination bar at the bottom.

#### 4.1.1 Searching for a user

The search box matches **name, email, or phone number** as you type.
Search is **debounced for 300 ms**, which means the dashboard waits
briefly after you stop typing before running the search — so paste
once, then pause, and you'll get results faster than paste-then-type-
then-search.

**To search:**

1. Click into the search box (or press `/` if your cursor is
   anywhere else).
2. Type a name, part of an email, or a phone number.
3. The table updates within a moment.
4. To clear, click the **X** button on the right of the search box,
   or press **Escape** while the search box is focused.

#### 4.1.2 Filtering by role and status

- **Role filter:** All roles (default), Admin only, or User only.
- **Status filter:** All users (default), Active only, or Inactive
  only.

Both filters combine with the search. Changing a filter resets you to
page 1.

#### 4.1.3 Pagination

The Users list is paginated. At the bottom of the table you'll see:

- **Page-size selector** — choose 10, 20, 50, or 100 rows per page.
- **First / Previous / "page / totalPages" / Next / Last** buttons.

#### 4.1.4 Opening a user

Click anywhere on a row (desktop) or tap a card (mobile) to open that
user's detail page.

### 4.2 The User detail page

When you click a user, you land on their detail page.

![Fig 4.3: User detail page](images/fig-4.3.png)

> **📸 Image description — Fig 4.3**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - A **back link** at the top: "← Back to users".
> - A **header card** with: a large circular avatar showing initials,
>   the user's full name in large bold text, the email in muted text
>   below, and three small badges in a row (**Admin** or **User**,
>   **Active** or **Inactive**, and — if the user is you — a small
>   **"You"** outline badge). On the right of the header card are two
>   outline buttons: **Edit** (with a pencil icon) and **Change role**
>   (with a shield icon).
> - A row of **three KPI cards**:
>   - **Total routes** — the number of routing requests this user has
>     made.
>   - **Saved locations** — the count of places they've bookmarked.
>   - **Favorite routes** — the count of routes they've marked as
>     favourite.
> - A **two-column area** below:
>   - **Left, wider card** "Profile details": a 2-column grid of label-
>     value rows showing First name, Last name, Email, Mobile, Gender,
>     Address, Joined (date and time).
>   - **Right, narrower card** "Danger zone" with a red header. It
>     explains that deactivating prevents sign-in but preserves data,
>     and contains a single red **"Deactivate user"** button. The
>     button is **disabled** if the user is already inactive, or if the
>     user is you.

#### 4.2.1 Editing a user

Click **Edit** in the header card. A modal appears:

![Fig 4.4: Edit user modal](images/fig-4.4.png)

> **📸 Image description — Fig 4.4**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - A modal dialog centred on the screen with a dimmed backdrop.
> - Modal title: **"Edit user"** and description "Update {Name}'s
>   profile and permissions."
> - A form with the following fields, pre-populated from the user's
>   current values:
>   - **First name** and **Last name** (text inputs, side by side).
>   - **Mobile number** (text input, placeholder "+20 1XX XXX XXXX").
>   - **Address** (text input).
>   - **Gender** (select: Male / Female / Other).
>   - **Role** (select: Admin / User).
>   - **Active** (toggle switch with a short caption: "Inactive users
>     cannot sign in.").
> - Footer with two buttons: **Cancel** (outline) and **Save changes**
>   (primary teal, with a small spinner while saving).

**Step-by-step:**

1. Click **Edit** in the header card.
2. Modify any field. Required fields (First name, Last name) cannot
   be empty.
3. Click **Save changes**. A green toast confirms success, and the
   modal closes.
4. If something goes wrong, a red toast shows the error; correct the
   field and try again.

#### 4.2.2 Changing a user's role

Click **Change role** in the header card. A small modal asks you to
pick the new role (User or Admin) and click **Update role**.

> **⚠️ Caution — Admin grants broad access.**
> Promoting a user to **Admin** gives them full access to this
> dashboard, including the ability to edit other users (including
> you). Only promote someone you trust.

#### 4.2.3 Deactivating a user

The **Danger zone** card lets you **deactivate** a user. Deactivation
is the safe alternative to deletion:

- The user's data is preserved (history, feedback, saved locations).
- The user can no longer sign in to the mobile app.
- You can re-enable the user later by editing them and flipping the
  **Active** switch back on.

**Step-by-step:**

1. In the Danger zone card, click **Deactivate user**.
2. Confirm in the modal by clicking **Deactivate**.
3. The user's badge in the header card flips to **Inactive**.

> **💡 Tip — You can't deactivate yourself.**
> If you somehow need to lock your own account, ask another admin to
> do it for you.

### 4.3 Step-by-step: Common operator tasks

#### Find a user
1. Click **Users** in the sidebar.
2. Type a name, email, or phone into the search box.
3. (Optional) narrow down with the **Role** or **Status** filter.
4. Click the matching row.

#### Reset a user (soft-block)
1. Open the user.
2. In the **Danger zone**, click **Deactivate user**.
3. Confirm.

#### Promote a user to Admin
1. Open the user.
2. Click **Change role**.
3. Choose **Admin**.
4. Click **Update role**.

#### Demote an Admin back to User
1. Open the user.
2. Click **Change role**.
3. Choose **User**.
4. Click **Update role**.

#### Fix a typo in a user's name
1. Open the user.
2. Click **Edit**.
3. Correct the **First name** and/or **Last name**.
4. Click **Save changes**.

---

## 5. Route Analytics

Route Analytics is where you go to understand how the **routing
engine** is performing. The page has four tabs in the order: Overview,
Top routes, Filters, Unresolved.

### 5.1 Overview tab

The Overview tab is the default. It shows the totals, success rate,
latency, and breakdown by source for the current period.

![Fig 5.1: Route Analytics – Overview tab](images/fig-5.1.png)

> **📸 Image description — Fig 5.1**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - Page header "Route Analytics" with subtitle.
> - A **tabs row** with four tabs: **Overview** (active, underlined),
>   **Top routes**, **Filters**, **Unresolved**. Each tab has a small
>   icon to the left of its label.
> - Below the tabs, a **filter bar** containing two date inputs
>   (**From** and **To**), an optional **Clear** button when dates
>   are set, and a **Source** dropdown (All sources / Text / Map).
> - A row of **four KPI cards**:
>   1. **Total requests** with a route icon.
>   2. **Success rate** (formatted as %, with a trending-up icon, in
>      green).
>   3. **Failed** (count, with a red X icon).
>   4. **Avg latency** (milliseconds, with an activity icon).
> - A two-column area:
>   - **Left, wider card** "Daily usage — Requests per day": a teal
>     line chart with one point per day in the selected date range.
>   - **Right, narrower card** "Request source — Text vs. map": a
>     donut chart.
> - A second row of three smaller cards:
>   - **Latency breakdown**: three labelled horizontal bars showing
>     AI service, Routing engine, and Total latency (each bar capped
>     visually at 2,000 ms).
>   - **Average trip**: Duration, Distance, Success/Failed count.
>   - **Health**: a giant percentage (e.g. "94.2 %") labelled
>     "success rate" with two small badges below.

**Step-by-step: Focus on a date range**

1. Open **Route Analytics**.
2. Click the **From** input; pick a start date.
3. Click the **To** input; pick an end date.
4. The page updates automatically.
5. Click **Clear** (which appears next to the date inputs once either
   is set) to reset the range.

**Step-by-step: Filter by source**

1. Use the **Source** dropdown.
2. Choose **Text** to see only free-text requests, **Map** for only
   map-tap requests, or **All sources** (default) to see everything.

### 5.2 Top routes tab

This tab shows the most-requested **origin → destination** pairs.

![Fig 5.2: Route Analytics – Top routes tab](images/fig-5.2.png)

> **📸 Image description — Fig 5.2**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - The same tabs row as Fig 5.1, with **Top routes** now active.
> - A wide card **"Top requested routes — Most popular origin →
>   destination pairs"** containing a **horizontal bar chart**. Each
>   bar is labelled with a "From → To" pair (e.g. "Tahrir Square →
>   Cairo University") and the bar's length represents the number of
>   requests.
> - Below the chart, a **Details card** with a table containing
>   columns: #, Origin, Destination, Requests (as a teal badge),
>   Avg time (formatted), Avg dist (formatted).

Use this tab to answer questions like *"Where are most users going
right now?"* or *"Should we add capacity between these two places?"*

### 5.3 Filters tab

This tab breaks down routing requests by the **filter** the user
chose when they asked for a route. The six filters are:

1. **Optimal** — best overall route (default).
2. **Fastest** — shortest time.
3. **Cheapest** — lowest fare.
4. **Bus only**.
5. **Microbus only**.
6. **Metro only**.

![Fig 5.3: Route Analytics – Filters tab](images/fig-5.3.png)

> **📸 Image description — Fig 5.3**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - Tabs row with **Filters** active.
> - A card **"Filter usage — How often each routing preference is
>   used"** with a **bar chart** (one bar per filter).
> - Below, a grid of **six stat cards** (three columns × two rows).
>   Each card shows:
>   - The filter name in large text.
>   - A small grey badge with the filter ID.
>   - Four rows of stats: **Requests** (count), **Success rate** (%),
>     **Avg duration** (formatted), **Avg fare** ("X.X EGP").

### 5.4 Unresolved tab

This tab shows routing requests that **failed** and the reasons why.

![Fig 5.4: Route Analytics – Unresolved tab](images/fig-5.4.png)

> **📸 Image description — Fig 5.4**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - Tabs row with **Unresolved** active.
> - A two-column area:
>   - **Left, wider card** "Unresolved reasons": a vertical list of
>     rows. Each row has a red circular icon with an alert triangle,
>     the reason code in monospaced text, and a red badge with the
>     count of how many requests hit that reason.
>   - **Right, narrower card** "Long walks": a giant number (count of
>     routes flagged with unusually long walking distance) with the
>     short caption "routes flagged with unusually long walking
>     distance".
> - Below, a **full-width card** "Top failed queries" with a table:
>   columns are **Query** (the user's input text), **Error code**
>   (in a small monospaced pill), **Count** (a red badge).

Use this tab to identify patterns:

- Are users asking for places we don't cover?
- Are they typing in a way the AI service doesn't understand?
- Is one error code responsible for most failures?

### 5.5 Step-by-step: Triage a spike in failed requests

1. Open **Route Analytics**.
2. On the **Overview** tab, look at the **Failed** KPI — has it
   jumped?
3. If yes, click the **Unresolved** tab.
4. Sort the reasons list by count to see which error is dominating.
5. If the **Top failed queries** table shows a recurring input text,
   the AI service is failing on a specific kind of phrasing.
6. Cross-reference with **System Health** ([§9](#9-system-health)) to
   see whether the AI service or the routing engine is currently
   degraded.

---

## 6. User Analytics

User Analytics gives you a deeper look at user growth, engagement,
and who the most active users are.

![Fig 6.1: User Analytics page](images/fig-6.1.png)

> **📸 Image description — Fig 6.1**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - Page header "User Analytics" with subtitle "Track registration
>   growth, engagement, and your most active users."
> - A row of **four KPI cards**:
>   1. **Total users** (teal users icon).
>   2. **Active** (green check icon).
>   3. **Inactive** (red minus icon).
>   4. **Admins** (neutral user-plus icon).
> - A two-column area:
>   - **Left, wider card** "Daily registrations — New users per day"
>     with a teal line chart.
>   - **Right, narrower card** "Engagement": three rows of stats —
>     **Users with routes** (count), **Avg routes / user** (one
>     decimal), **Activation rate** (%).
> - A full-width card **"Top users by routes"** with a table:
>   columns **#**, **User** (first name), **Email**, **Routes**
>   (count badge), **Success** (count).

> **💡 Tip — "Activation rate"**
> This is the percentage of users who have actually made at least one
> routing request. It's a good proxy for whether sign-ups are turning
> into real usage.

---

## 7. Feedback

The Feedback section is where you read what users are saying. It has
two tabs: **Summary** (the aggregate picture) and **All reviews** (the
raw list).

### 7.1 Summary tab

![Fig 7.1: Feedback – Summary tab](images/fig-7.1.png)

> **📸 Image description — Fig 7.1**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - Page header "Feedback" with subtitle "What users are saying about
>   their routing experience."
> - Tabs row: **Summary** (active) and **All reviews**.
> - Three KPI cards:
>   1. **Total feedback** (speech-bubble icon, teal).
>   2. **Average rating** (yellow star icon) — formatted as X.XX.
>   3. **5-star reviews** (green star icon) — count of reviews that
>      gave 5 stars.
> - A card **"Rating distribution"**: five horizontal bars, one per
>   star rating (5, 4, 3, 2, 1). Each row has a small yellow star
>   icon, the star number (5/4/3/2/1), a teal bar whose length
>   represents the percentage, and on the right the count and
>   percentage in parentheses.

### 7.2 All reviews tab

![Fig 7.2: Feedback – All reviews tab](images/fig-7.2.png)

> **📸 Image description — Fig 7.2**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - Tabs row: **All reviews** (active).
> - A **filter bar** with the text "1,287 reviews · 5+ stars" on the
>   left and a **Min rating** select on the right (options: All / 5
>   stars / 4+ stars / 3+ stars / 2+ stars / 1+ stars).
> - A list of **review rows** inside a single card. Each row has:
>   - A circular avatar with the first letter of the reviewer's
>     email.
>   - The reviewer's **email** and a small **timestamp** (date +
>     time) below.
>   - A 5-star display on the right (filled stars for the rating,
>     empty stars for the rest).
>   - The **comment** in regular text, indented, in quotation marks.
> - A pagination bar at the bottom.

**Step-by-step: Find the most critical reviews**

1. Open **Feedback** → **All reviews**.
2. Use the **Min rating** dropdown to choose **1+ stars** (or just
   **2+ stars**).
3. The list reloads. The most negative reviews are now at the top
   (the API sorts by rating ascending, then by date descending).
4. Read through them. If a pattern emerges (e.g. everyone complains
   about the same neighbourhood), make a note and check
   [Route Analytics – Unresolved](#54-unresolved-tab) for that
   neighbourhood.

**Step-by-step: Find today's reviews**

There is no direct "today" filter, but you can paginate and look for
today's timestamps in the list. The default sort is by date
descending, so the newest reviews appear on page 1.

---

## 8. Query Builder

Query Builder is for power users. When the canned analytics pages
don't have the exact question you want answered, you build your own.

![Fig 8.1: Query Builder – initial state](images/fig-8.1.png)

> **📸 Image description — Fig 8.1**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - Page header "Query Builder" with subtitle "Compose composable
>   analytics queries — pick metrics, group-by, sort order, and
>   limit."
> - **Preset cards** (visible until the first query runs): four
>   cards in a 2-column grid, each with a title in bold, a one-line
>   description, and a small magic-wand icon in the top-right.
>   1. **Daily success rate** — "Success rate per day, last 30 rows."
>   2. **By source (text vs map)** — "Compare text-flow vs map-pin
>      requests."
>   3. **Per-route-filter performance** — "optimal vs fastest vs
>      cheapest, etc."
>   4. **Latency breakdown by status** — "How slow are failures vs
>      successes?"
> - A two-column area:
>   - **Left, wider card** "Compose query": sections for **Metrics**
>     (a row of pill buttons, none selected), **Group by** (another
>     row of pill buttons, none selected), and three selects in a
>     row — **Sort by**, **Order**, **Limit** (default 30, max 200).
>     A teal **Run query** button at the bottom-right with a play
>     icon.
>   - **Right, narrower card** "Request URL": a code-styled block
>     showing `GET /api/v1/admin/analytics/routes/query` (with no
>     query string yet), a **Copy full URL** button, and a short
>     caption explaining the limit.
> - A bottom card **"Results"** showing an empty-state icon and the
>     message "Build a query above" with a hint to pick a preset.

![Fig 8.2: Query Builder – after running a query](images/fig-8.2.png)

> **📸 Image description — Fig 8.2**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - Same layout as Fig 8.1 but with content populated:
>   - **Metrics** has two pills highlighted in teal: *Requests* and
>     *Success rate (%)*.
>   - **Group by** has one pill highlighted: *Day*.
>   - **Sort by** is *Day*, **Order** is *Descending*, **Limit** is
>     *30*.
>   - A small **"Reset"** button appears at the top of the page
>     (replacing the preset cards, which are now hidden).
>   - **Request URL** shows
>     `GET /api/v1/admin/analytics/routes/query?metrics=requests,success_rate_percent&group_by=day&sort=day&order=desc&limit=30`
>     in the code block.
> - **Results card** contains a table with columns derived from the
>   response (e.g. **Day**, **Requests**, **Success Rate Percent**).
>   Each row is one day's aggregated metrics.

### 8.1 The four built-in presets

A **preset** is a saved combination of metrics + group-by + sort +
order + limit. Click any preset to load it instantly:

- **Daily success rate** — the most common starting point. Shows you
  requests per day plus success rate, sorted by date.
- **By source (text vs map)** — lets you compare text-typed requests
  to map-pin requests side by side.
- **Per-route-filter performance** — groups by filter (optimal,
  fastest, cheapest, etc.) so you can see which preference yields the
  best success rate.
- **Latency breakdown by status** — groups by success/failed so you
  can see whether failures are slower than successes (a sign of
  retries or timeouts).

### 8.2 Composing your own query

**Step-by-step:**

1. Click the **metrics** you want to measure. You can pick one or
   many. Common ones:
   - `requests`
   - `success_count`, `failed_count`
   - `success_rate_percent`
   - `avg_total_latency_ms`, `avg_ai_latency_ms`,
     `avg_routing_latency_ms`
   - `avg_duration_seconds`, `avg_distance_meters`
   - `avg_fare`, `avg_walk_distance_meters`
2. *(Optional)* Click **group-by** pills to bucket the result:
   - `day`, `week`
   - `source` (text/map)
   - `status` (success/failed)
   - `filter` (1–6, the routing preference)
   - `selected_route_type` (bus / metro / microbus / walk)
3. Pick a **Sort by** field (any metric or group-by field), an
   **Order** (ascending or descending), and a **Limit** (1–200).
4. Click **Run query**.
5. The results table appears below. Columns are derived dynamically
   from the response — you don't need to pre-define them.
6. To **copy the request URL** (useful for debugging or sharing with
   engineering), click the **Copy full URL** button in the right-
   hand card. The URL includes your current origin so you can paste
   it into a browser.

> **💡 Tip — You can't run with zero metrics.**
> The Run query button is disabled until you pick at least one metric.
> Group-by is optional.

> **⚠️ Caution — Limit caps at 200.**
> The dashboard enforces `1 ≤ limit ≤ 200`. If you ask for more,
> it's clamped to 200 automatically. If you genuinely need more
> than 200 rows, ask the backend team to provide an export endpoint.

### 8.3 Resetting

Click the **Reset** button at the top of the page (it appears after
your first query) to clear the form, the executed query, and the
results.

---

## 9. System Health

System Health is a single page that tells you whether the **three
dependencies** the platform needs are up.

![Fig 9.1: System Health page](images/fig-9.1.png)

> **📸 Image description — Fig 9.1**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - Page header "System Health" with subtitle "Live status of every
>   platform dependency. Auto-refreshes every 30s." On the right of
>   the header, the small text "Last checked just now" next to a
>   **Refresh** button (with a circular-arrow icon).
> - A row of **three status pills** (each is a white card with a
>   large coloured circular icon on the left, a label, and a status
>   word plus a small badge on the right):
>   1. **Database** — green tick icon, "Operational", green "OK"
>      badge.
>   2. **AI Service** — green tick icon, "Operational", green "OK"
>      badge.
>   3. **Routing Engine** — green tick icon, "Operational", green
>      "OK" badge.
> - A wide **Overall status** card with a giant green check-circle
>   icon and the heading "All systems operational", with the
>   subtitle "The platform is responding normally across all
>   services."
> - A row of **three informational cards** describing what each
>   service does:
>   - **PostgreSQL** — "User, history, feedback."
>   - **AI Service** — "NLP extraction, geocoding."
>   - **RoutingEngine** — "A* pathfinding · gRPC :50051."

### 9.1 What each dependency means

| Pill | What it is | What happens if it's down |
|---|---|---|
| **Database** | The PostgreSQL store that holds every user, every route history record, and every feedback comment. | Users can't sign in or save anything. Analytics go blank. |
| **AI Service** | The service that interprets free-text requests ("from Tahrir to the airport, fast please") and converts them to coordinates. | Text-mode routing requests fail. Map-mode requests still work. |
| **Routing Engine** | The A* pathfinder that finds the actual route. Talks to the dashboard via gRPC on port 50051. | No routing requests succeed. |

### 9.2 What "down" looks like

If any one of the three is down, the page flips:

- The matching **pill** turns red with a red X icon and the word
  "Down" + a red "FAIL" badge.
- The **Overall status** banner switches to a red shield-alert icon
  and the heading "Degraded performance" with the subtitle "One or
  more services are unhealthy. Investigate immediately."
- All three pills will read "Down" (the backend returns a single
  status code without per-service detail), even if only one
  dependency is actually broken — see [§12.3](#123-system-health-all-red)
  for what to do.

### 9.3 Auto-refresh

The page polls the backend every **30 seconds** automatically, even
if you don't touch it. The **"Last checked X ago"** text in the
header updates each time a fresh check completes.

Click **Refresh** at any time to run an immediate check (the icon
spins while the request is in flight).

### 9.4 Step-by-step: Investigating a red System Health

1. Note which pill is red.
2. Click **Refresh** to confirm it's not stale.
3. If still red, open the corresponding analytics page to see the
   blast radius:
   - Database down → all analytics are blank.
   - AI Service down → [Route Analytics – Unresolved](#54-unresolved-tab)
     is full.
   - Routing Engine down → success rate drops to 0%.
4. Notify the backend / platform team (this is out of scope for the
   dashboard to fix — see [§12](#12-troubleshooting)).

---

## 10. Profile

The Profile page is where you manage **your own** admin account.

![Fig 10.1: Profile page](images/fig-10.1.png)

> **📸 Image description — Fig 10.1**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - Page header "Profile" with subtitle "Manage your admin account
>   information and security."
> - A **header card** with a large circular avatar showing your
>   initials, your full name in large bold text, your email below
>   in muted text, and three badges in a row (**Admin**, **Active**,
>   and **Staff**). On the right of the card are two buttons:
>   **Edit profile** (outline, pencil icon) and **Change password**
>   (primary teal, lock icon).
> - A second card **"Account details"** with a 2-column grid of
>   label-value rows: First name, Last name, Email, Mobile, Gender,
>   Address, Role, Joined (date and time).

### 10.1 Editing your profile

**Step-by-step:**

1. Click **Edit profile** in the header card.
2. A modal opens with four fields: **First name**, **Last name**,
   **Mobile number**, **Address**, and a **Gender** select.
3. Modify anything you like. First name and Last name are required.
4. Click **Save changes**.
5. A green toast confirms, the modal closes, and the header card
   updates with the new info.

### 10.2 Changing your password

**Step-by-step:**

1. Click **Change password** in the header card.
2. A modal opens with three fields:
   - **Current password** — your existing password (must be at least
     6 characters).
   - **New password** — must be **at least 8 characters** and contain
     **at least one letter** and **at least one number**.
   - **Confirm password** — must match the new password exactly.
3. Click **Update password**.
4. On success, a green toast confirms and the modal closes. You
   stay signed in (your current tokens are still valid).

> **⚠️ Caution — Don't get locked out.**
> Changing your password does **not** sign you out. But the next time
> you sign in on another device, you'll need to use the new
> password.

---

## 11. Common UI Patterns

This chapter describes the visual patterns the dashboard uses
everywhere, so you can recognise them on any page.

### 11.1 Loading skeletons

Whenever the dashboard is fetching data, you'll see grey placeholder
shapes (called **skeletons**) instead of the real content. They
briefly shimmer and are replaced by the real content as soon as the
data arrives. Skeletons show up:

- On every table row while the table is loading.
- On every card while its data is loading.
- On the chart area before the chart renders.

> **💡 Tip — Skeletons that stay for more than 5 seconds usually
> mean a slow backend.** See [§12](#12-troubleshooting).

### 11.2 Error states and "Try again"

When something fails to load, you see a small red-bordered card with
an alert icon, a heading ("Something went wrong" by default), a
short message, and a **Try again** link. Click the link to retry
the request.

![Fig 11.1: Loading skeleton state](images/fig-11.1.png)

> **📸 Image description — Fig 11.1**
> **Viewport:** 1440 × 900 desktop.
> **Visible elements:**
> - The Users list page in mid-load.
> - The filter bar is fully rendered.
> - Below the filter bar, the table area shows six skeleton rows:
>   each row has a small grey circle (where the avatar will go) on
>   the left and two horizontal grey bars (where the name + email
>   will go) on the right. The bars gently shimmer.

### 11.3 Empty states

When a list or table has no rows to show, you see a friendly empty
state: a grey circular icon, a short heading ("No users found" or
similar), and a one-sentence description. There's no action button
unless there's something useful to do (e.g. "Clear filters").

### 11.4 Toasts

Toasts are small notifications that appear in the **top-right
corner** of the screen and disappear after about 4 seconds.

- **Green check** = success (e.g. "User updated").
- **Red X** = error (e.g. "Failed to deactivate user").
- The text is the message returned from the backend, or a sensible
  default if the backend doesn't include one.

### 11.5 Pagination

Every table that's longer than one screen has a pagination bar at
the bottom. It includes:

- A "Showing X–Y of Z" counter on the left.
- A **page size selector** (10 / 20 / 50 / 100).
- First / Previous / "page / totalPages" / Next / Last buttons on the
  right.

### 11.6 Keyboard tips

- **Press `Escape`** anywhere to close an open modal or the mobile
  drawer.
- **Click a label** (e.g. "Email") to focus the matching input.
- The visible focus ring (a teal outline) lets you see which element
  has keyboard focus. If you can't see it, your browser's settings
  may be hiding it — re-enable "always show focus rings".

---

## 12. Troubleshooting

This chapter covers the most common things that can go wrong.

### 12.1 "Your session expired" / kicked back to login

**Symptom:** You click a link or perform an action and the dashboard
sends you back to the sign-in screen, possibly with a toast.

**Cause:** Your access token has expired. The dashboard tries to
refresh it automatically; if the refresh fails (because the refresh
token is also expired, or the server rejected it), you get signed
out.

**Next step:** Sign in again. If the issue keeps happening within a
few minutes, your refresh token may have been revoked — contact the
platform team.

### 12.2 "Forbidden endpoint" toast (development only)

**Symptom:** A red toast with text like
*"[admin-allowlist] Forbidden endpoint for admin dashboard: ..."* in
the browser console.

**Cause:** A developer accidentally tried to call a non-admin
endpoint (one belonging to the Flutter mobile client). The dashboard
blocks this in development to prevent scope creep.

**Next step:** If you're an operator, you should never see this.
Report it to the development team if you do.

### 12.3 System Health all-red

**Symptom:** All three pills on the System Health page turn red.

**Cause:** The dashboard reports the platform as a single all-or-
nothing status. The backend returns `503 Service Unavailable` if any
of the three dependencies is down; the dashboard can't tell which
one is broken from a single status code.

**Next step:** Look at the analytics pages to triangulate:

- If **User Analytics** is blank → Database.
- If **Route Analytics – Unresolved** is full of errors → AI
  Service or Routing Engine.
- If the success rate is suddenly 0% but text-mode requests succeed
  → Routing Engine.
- Otherwise → AI Service.

Then notify the platform / backend team with what you found.

### 12.4 Charts are blank

**Symptom:** A chart card shows "No data to display yet".

**Cause:** Either there's no data in the selected date range, or
the filter you've applied excludes everything.

**Next step:**

1. Click **Clear** in the date-range filter (if you've set one).
2. Switch the **Source** filter to "All sources".
3. If it's still blank, the underlying data really is empty —
   there's nothing to fix.

### 12.5 Mobile drawer is stuck open

**Symptom:** You opened the mobile nav drawer and tapping the
overlay doesn't close it.

**Next step:**

- Tap the **X** button at the top-right of the drawer.
- Press the **Escape** key (on a physical keyboard).
- If neither works, refresh the page (the dashboard re-renders
  cleanly from the sign-in screen if your session is still valid).

### 12.6 A page is completely blank / shows only skeletons

**Symptom:** You navigate to a page and see only grey skeletons for
more than 10 seconds.

**Next step:**

1. Wait 5 more seconds — sometimes the backend is slow.
2. If still loading, check [System Health](#9-system-health).
3. If the page itself is unreachable (white screen), use your
   browser's **Refresh** (or `Cmd/Ctrl + R`).
4. If the issue persists, sign out and back in.

### 12.7 "Failed to update user" / similar toasts on actions

**Symptom:** You click Save / Update / Deactivate and get a red
toast like "Failed to update user" with no further detail.

**Cause:** The backend rejected the change — usually because of a
validation rule or because someone else changed the user at the same
time.

**Next step:** Re-open the user, confirm the values, and try again.
If it keeps failing, the user may have been deleted; refresh the
Users list to see.

---

## 13. Appendix

### 13.1 Glossary

Already defined in [§1.4](#14-glossary).

### 13.2 Accessibility notes

The Wslny Admin Dashboard follows **WCAG 2.1 AA**:

- Every interactive element is reachable by keyboard.
- Focus rings are always visible (teal outline).
- Colour contrast is at least 4.5:1 for body text and 3:1 for large
  text.
- Touch targets are at least **44 × 44 pixels** on mobile.
- Forms have labels associated with their inputs.
- Error messages are announced and visible (red text + icon, not
  colour-only).
- Icons used as buttons have ARIA labels (e.g. "Open menu",
  "Notifications", "Account menu").

If you find an accessibility issue, please report it to the
development team.

### 13.3 Where the data comes from

This is a one-page reference for engineers and curious operators who
want to know which backend endpoint each page reads from. **You don't
need this to use the dashboard** — it's here for completeness.

| Page | Reads from (HTTP method + path) |
|---|---|
| Sign in | `POST /api/v1/auth/login`, `POST /api/v1/auth/google-login`, `POST /api/v1/auth/refresh` |
| Profile (read) | `GET /api/v1/auth/profile` |
| Profile (update) | `PUT /api/v1/auth/profile` |
| Change password | `POST /api/v1/auth/change-password` |
| Dashboard | `GET /api/v1/admin/analytics/routes/overview`, `GET /api/v1/admin/analytics/users/overview`, `GET /api/v1/admin/analytics/feedback/summary` |
| Users list | `GET /api/v1/admin/users` |
| User detail (read) | `GET /api/v1/admin/users/{id}` |
| User detail (edit) | `PUT /api/v1/admin/users/{id}` |
| User detail (deactivate) | `DELETE /api/v1/admin/users/{id}` |
| User detail (change role) | `POST /api/v1/admin/change-role` |
| Route Analytics – Overview | `GET /api/v1/admin/analytics/routes/overview` |
| Route Analytics – Top routes | `GET /api/v1/admin/analytics/routes/top-routes` |
| Route Analytics – Filters | `GET /api/v1/admin/analytics/routes/filters` |
| Route Analytics – Unresolved | `GET /api/v1/admin/analytics/routes/unresolved` |
| User Analytics | `GET /api/v1/admin/analytics/users/overview` |
| Feedback – Summary | `GET /api/v1/admin/analytics/feedback/summary` |
| Feedback – All reviews | `GET /api/v1/admin/analytics/feedback` |
| Query Builder | `GET /api/v1/admin/analytics/routes/query` |
| System Health | `GET /api/health` |

### 13.4 What's not in the dashboard (by design)

These items are intentionally **not** part of the admin dashboard —
they belong to the Wslny mobile app, not the operations console:

- Trip planning / route search by end users.
- User self-registration.
- Editing the transit data (stops, lines, routes).
- Map visualisation of polylines.
- Live tail of route requests (real-time stream).
- Dark mode (planned for a future release).
- Multi-language / RTL (planned for a future release).

If you need any of the above, it's because something has been
misrouted — talk to the product team.

### 13.5 Versioning & support

This guide documents **v1** of the Wslny Admin Dashboard. Each
release is documented in `.speckit/roadmap.md`. The dashboard is
internal — only Admins can sign in.

---

_End of guide. Last updated: 2026-06-25._
