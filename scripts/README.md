# Demo Data Seeder

A standalone Node.js script that populates the Wslny backend API with
realistic demo data so the admin dashboard has something interesting
to show.

## What it creates

- **~55 users** (`seed.user.000@wslny-demo.com` … `seed.user.054@…`)
  with realistic Egyptian first/last names, Cairo districts, and
  Egyptian mobile numbers.
- **~9,875 routing requests** spread over the last 30 days. A heavy-
  tailed distribution: most users have a handful of trips, a few
  power users have hundreds. ~60 % are map-mode, ~40 % are text-
  mode. Filters (`optimal`, `fastest`, `cheapest`, `bus_only`,
  `microbus_only`, `metro_only`) are picked uniformly.
- **~70 % of successful routes** get 1–5 star feedback with mixed
  Arabic/English comments. Star distribution is positively skewed
  (35 % 5★, 30 % 4★, 18 % 3★, 10 % 2★, 7 % 1★) to mirror what
  happy-app feedback typically looks like.
- **Saved locations** (1–3 per user) and **favourite routes** (0–3
  per user) so the user-detail page has non-zero counts.

## Requirements

- Node 18 or newer (uses the global `fetch`). Tested on Node 22.
- No external dependencies — the script reuses only Node built-ins
  (`node:perf_hooks`, `node:crypto`).
- A reachable Wslny API. By default the script targets the
  production deployment; override with `SEED_API_BASE_URL`.

## Usage

```bash
# Run with defaults (55 users, 9 875 routes, last 30 days)
node scripts/seed.mjs

# Tweak the scale
SEED_USER_COUNT=80 SEED_ROUTE_COUNT=20000 node scripts/seed.mjs

# Preview without posting anything
SEED_DRY_RUN=1 node scripts/seed.mjs

# Verbose per-request logs
SEED_VERBOSE=1 node scripts/seed.mjs
```

## Environment variables

| Var | Default | Notes |
|---|---|---|
| `SEED_API_BASE_URL` | `https://wslny-api.icyforest-4fb366f4.uaenorth.azurecontainerapps.io` | Base URL with no trailing slash. |
| `SEED_USER_COUNT` | `55` | How many users to create. |
| `SEED_ROUTE_COUNT` | `9875` | Total routing requests across all users. |
| `SEED_FEEDBACK_RATE` | `0.7` | Probability that a successful route gets feedback. |
| `SEED_DAYS` | `30` | History window in days. |
| `SEED_CONCURRENCY` | `15` | Max parallel requests. Stay ≤20 to avoid the 60-req/min rate limit. |
| `SEED_DRY_RUN` | `0` | `1` = log without POSTing. |
| `SEED_VERBOSE` | `0` | `1` = per-request logs. |
| `SEED_EMAIL_PREFIX` | `seed.user` | Override to re-seed without colliding with a prior run. |
| `SEED_PASSWORD` | `SeedDemo2026!` | Password assigned to every seeded user. |

## Output

A final summary block prints the totals so you can spot-check the run:

```
────────────────────────────────────────────────────────────
 Done in 4.7 min
   users:           55
   successful reqs: 9082
   feedback ≈:      6357
────────────────────────────────────────────────────────────
 Sign in to the dashboard with any of the seeded accounts:
   email:    seed.user.000@wslny-demo.com
   password: SeedDemo2026!
────────────────────────────────────────────────────────────
```

## Caveats

- The script is **not** idempotent. Each run creates a fresh batch of
  `seed.user.NNN@…` accounts. To reseed cleanly, either change
  `SEED_EMAIL_PREFIX` or delete the previous batch from the admin
  dashboard first.
- Some text requests may fail (the AI service is non-deterministic);
  the script records the failure and continues.
- The dashboard's dev-only admin-allowlist guard is bypassed because
  this script talks to the API directly via `fetch`, not through the
  dashboard's Axios client.
- The script does **not** deactivate users. To demo the "Inactive"
  badge, deactivate a couple of accounts from the admin UI after
  seeding.
- 9 875 calls through the AI + routing engines can take 5–15 minutes
  depending on the backend load. The script logs progress every
  ~10 % of the way through and prints a final ETA.
