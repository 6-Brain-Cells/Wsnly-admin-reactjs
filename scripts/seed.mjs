#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Wslny Backend — Demo Data Seeder
 *
 * Populates the production / staging API with realistic demo data so the
 * admin dashboard has something to show. Creates:
 *   - ~55 users (5 admins + 50 regular; 4 pre-deactivated)
 *   - ~9,875 routing requests spread over the last 30 days
 *   - ~70 % of successful routes get 1–5 star feedback with comments
 *   - A handful of saved locations and favourite routes per user
 *
 * Usage:
 *   node scripts/seed.mjs
 *
 * Environment variables (all optional):
 *   SEED_API_BASE_URL     default: https://wslny-api.icyforest-4fb366f4.uaenorth.azurecontainerapps.io
 *   SEED_USER_COUNT       default: 55
 *   SEED_ROUTE_COUNT      default: 9875
 *   SEED_FEEDBACK_RATE    default: 0.7  (0..1)
 *   SEED_DAYS             default: 30   (history window)
 *   SEED_CONCURRENCY      default: 15   (max parallel requests)
 *   SEED_DRY_RUN          default: 0    (1 = log, don't post)
 *   SEED_VERBOSE          default: 0    (1 = per-request logs)
 *   SEED_SKIP_USERS       default: 0    (1 = log in to existing users instead of registering new ones)
 *   SEED_LOGIN_PATTERNS   default: bulk2.1782464649,bulk.1782464454,seed.user,demotest.1782464138
 *                                       (comma-separated email prefixes; {n} is 3-digit index)
 *   SEED_REGISTER_RPM     default: 28   (per-minute cap for /api/v1/auth/register; stay under 30)
 *
 * Requirements: Node 18+ (uses global fetch).
 * No external dependencies — the script reuses only Node built-ins.
 *
 * NOTE: this script is idempotent in spirit but not in practice. Each run
 * creates a fresh batch of `seed.user.<N>@wslny-demo.com` accounts. To
 * reseed, either change the SEED_EMAIL_PREFIX env var or delete the prior
 * batch from the admin dashboard.
 */

import { performance } from 'node:perf_hooks'
import { randomUUID } from 'node:crypto'

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

// API base URL.
// IMPORTANT: `/api/docs/` is the Swagger UI page (HTML), NOT the API base.
// The actual API endpoints live at the host root. Setting the base to
// `…/api/docs/` will make every request 404. The Swagger UI itself confirms
// this — it loads the OpenAPI schema from `/api/schema/`, not from itself.
//
// Tested 2026-06-26:
//   https://…azurecontainerapps.io/api/docs/api/v1/auth/register → 404
//   https://…azurecontainerapps.io/api/v1/auth/register          → 405 (POST-only)
const API_BASE = (process.env.SEED_API_BASE_URL ??
  'https://wslny-api.icyforest-4fb366f4.uaenorth.azurecontainerapps.io'
).replace(/\/$/, '')

const USER_COUNT = Number(process.env.SEED_USER_COUNT ?? 55)
const ROUTE_COUNT = Number(process.env.SEED_ROUTE_COUNT ?? 9875)
const FEEDBACK_RATE = Number(process.env.SEED_FEEDBACK_RATE ?? 0.7)
const DAYS = Number(process.env.SEED_DAYS ?? 30)
const CONCURRENCY = Number(process.env.SEED_CONCURRENCY ?? 15)
const DRY_RUN = process.env.SEED_DRY_RUN === '1'
const VERBOSE = process.env.SEED_VERBOSE === '1'
const EMAIL_PREFIX = process.env.SEED_EMAIL_PREFIX ?? 'seed.user'
const DEMO_PASSWORD = process.env.SEED_PASSWORD ?? 'SeedDemo2026!'

// ─────────────────────────────────────────────────────────────────────────────
// Demo data
// ─────────────────────────────────────────────────────────────────────────────

const MALE_FIRST = [
  'Mohamed', 'Ahmed', 'Ali', 'Hassan', 'Mahmoud', 'Youssef', 'Omar',
  'Karim', 'Tarek', 'Amr', 'Khaled', 'Mostafa', 'Ibrahim', 'Seif',
  'Hossam', 'Sherif', 'Hany', 'Tamer', 'Waleed', 'Islam', 'Adel',
  'Ashraf', 'Hazem', 'Marwan', 'Ramy', 'Fady',
]
const FEMALE_FIRST = [
  'Fatma', 'Nour', 'Yasmin', 'Mariam', 'Salma', 'Hala', 'Mona', 'Heba',
  'Rania', 'Dalia', 'Aya', 'Nada', 'Reem', 'Sherine', 'Noha', 'Manar',
  'Sondos', 'Rana', 'Esraa', 'Asmaa', 'Mai', 'Dina', 'Eman', 'Lamia',
  'Ghada',
]
const LAST_NAMES = [
  'Hassan', 'Mohamed', 'Ali', 'Ibrahim', 'Sayed', 'El-Sayed', 'El-Masry',
  'Farouk', 'Nassar', 'Aziz', 'Saleh', 'Saeed', 'Mostafa', 'Khalil',
  'Adel', 'Zaki', 'Taha', 'Mansour', 'El-Hady', 'Galal', 'Hamdy',
  'Ramadan', 'Gomaa', 'Eid', 'El-Khatib',
]
const CAIRO_DISTRICTS = [
  'Tahrir', 'Maadi', 'Heliopolis', 'Nasr City', 'Dokki', 'Mohandessin',
  'Zamalek', 'Garden City', 'Ramses', 'Abbasiya', 'Shubra', 'Helwan',
  '6th of October', 'New Cairo', 'Ain Shams', 'Hadayek El-Maadi',
  'El-Mokatam', 'Sayeda Zeinab', 'Bulaq', 'Imbaba',
]

// Real Cairo coordinates so the routing engine can geocode successfully.
const LOCATIONS = [
  { name: 'Tahrir Square',          lat: 30.0444, lon: 31.2357 },
  { name: 'Cairo University',       lat: 30.0263, lon: 31.2031 },
  { name: 'Nasr City',              lat: 30.0518, lon: 31.3656 },
  { name: 'Maadi',                  lat: 29.9602, lon: 31.2569 },
  { name: 'Heliopolis',             lat: 30.0875, lon: 31.3286 },
  { name: 'Dokki',                  lat: 30.0380, lon: 31.2117 },
  { name: 'Mohandessin',            lat: 30.0510, lon: 31.2010 },
  { name: 'Zamalek',                lat: 30.0612, lon: 31.2194 },
  { name: 'Garden City',            lat: 30.0411, lon: 31.2306 },
  { name: 'Ramses Station',         lat: 30.0626, lon: 31.2467 },
  { name: 'Abbasiya',               lat: 30.0727, lon: 31.2840 },
  { name: 'Shubra',                 lat: 30.1106, lon: 31.2486 },
  { name: 'Helwan',                 lat: 29.8419, lon: 31.3000 },
  { name: '6th of October',         lat: 29.9285, lon: 30.9170 },
  { name: 'New Cairo',              lat: 30.0077, lon: 31.4913 },
  { name: 'Giza Pyramids',          lat: 29.9792, lon: 31.1342 },
  { name: 'Egyptian Museum',        lat: 30.0478, lon: 31.2336 },
  { name: 'Ain Shams',              lat: 30.1300, lon: 31.3206 },
  { name: 'Cairo Airport',          lat: 30.1219, lon: 31.4056 },
  { name: 'El-Mokatam',             lat: 30.0167, lon: 31.2917 },
  { name: 'Hadayek El-Maadi',       lat: 29.9700, lon: 31.2830 },
  { name: 'Sayeda Zeinab',          lat: 30.0290, lon: 31.2380 },
  { name: 'Imbaba',                 lat: 30.0760, lon: 31.2070 },
  { name: 'Bulaq',                  lat: 30.0370, lon: 31.2290 },
]

const FILTERS = [
  { id: 1, name: 'optimal' },
  { id: 2, name: 'fastest' },
  { id: 3, name: 'cheapest' },
  { id: 4, name: 'bus_only' },
  { id: 5, name: 'microbus_only' },
  { id: 6, name: 'metro_only' },
]

const TEXT_TEMPLATES_AR = [
  'عايز اروح من {from} الى {to}',
  'من {from} لـ {to} لو سمحت',
  'كيف اروح من {from} الى {to}؟',
  'محتاج طريق من {from} الى {to}',
  'ممكن route من {from} ل {to}',
  '{from} الى {to} احسن طريق',
  'في اسرع طريق من {from} لـ {to}',
  'ارخص طريق من {from} الى {to}',
  'عايز اوقف الباص من {from} عشان اروح {to}',
  'محتاج المترو من {from} لـ {to}',
]

const COMMENTS_AR = [
  'الطريق كان ممتاز ووصلت بسرعة',
  'خدمة حلوة بس في زحمة شوية',
  'مش عاجبني تغيير الخطوط كتير',
  'افضل من التطبيقات التانية',
  'في مشكلة في التوقيت',
  'سهل الاستخدام',
  'الطريق طويل شوية',
  'ممتاز جدا',
  'حلو',
  'محتاج تحسين',
]

const COMMENTS_EN = [
  'Great route, got there fast!',
  'Worked well, would use again.',
  'A bit long but accurate.',
  'Best public transit app in Cairo.',
  'Saved me time during rush hour.',
  'Easy to use, clear directions.',
  'The transfer was confusing.',
  'Perfect, exactly what I needed.',
  'Helpful',
  'Could be faster',
]

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function weightedPick(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

// Heavy-tailed distribution: most users have few routes, a few have many.
// Returns at least 1 when there are still routes left to distribute, so the
// total always reaches ROUTE_COUNT (no silently-dropped requests).
function pickRouteCount(remaining, userCount) {
  // Geometric-style: probability p of being a power user
  const isPowerUser = Math.random() < 0.15
  if (isPowerUser) {
    // Power users: 300–800 routes
    return Math.min(remaining, randint(300, 800))
  }
  // Normal users: 1–250, skewed low (always at least 1 to keep the total)
  return Math.max(1, randint(1, Math.min(remaining, 250)))
}

function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickTimestamp(daysBack) {
  // Recent bias: time^0.7 over the last N days
  const now = Date.now()
  const t = Math.pow(Math.random(), 1.6) * daysBack * 24 * 60 * 60 * 1000
  return new Date(now - t)
}

// Star rating with positive skew (5★=35%, 4★=30%, 3★=18%, 2★=10%, 1★=7%).
const STAR_WEIGHTS = [7, 10, 18, 30, 35]
const STARS = [1, 2, 3, 4, 5]

function pickRating() {
  return weightedPick(STARS, STAR_WEIGHTS)
}

// Build a synthetic Arabic text request. The AI service will geocode
// from the {from}/{to} names.
function buildTextRequest() {
  const from = pick(LOCATIONS).name
  let to = pick(LOCATIONS).name
  while (to === from) to = pick(LOCATIONS).name
  const template = pick(TEXT_TEMPLATES_AR)
  return template.replace('{from}', from).replace('{to}', to)
}

// A simple semaphore: at most `n` concurrent tasks in flight.
class Semaphore {
  constructor(n) {
    this.n = n
    this.queue = []
  }
  async acquire() {
    if (this.n > 0) {
      this.n--
      return
    }
    await new Promise((resolve) => this.queue.push(resolve))
  }
  release() {
    const next = this.queue.shift()
    if (next) next()
    else this.n++
  }
}

// Token-bucket rate limiter. Defaults to 28 req/min so we stay safely
// under the backend's 30 req/min anonymous limit (see `.speckit/plan.md` §0:
// "30 req/min anonymous, 60 req/min authenticated"). `wait()` blocks the
// caller just long enough to keep the global throughput at the limit.
class RateLimiter {
  constructor(perMinute) {
    this.intervalMs = 60_000 / perMinute
    this.last = 0
  }
  async wait() {
    const now = Date.now()
    const wait = this.last + this.intervalMs - now
    if (wait > 0) await sleep(wait)
    this.last = Date.now()
  }
}

async function withSemaphore(sem, fn) {
  await sem.acquire()
  try {
    return await fn()
  } finally {
    sem.release()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP helpers
// ─────────────────────────────────────────────────────────────────────────────

async function api(method, path, { token, body, query, maxRetries = 3 } = {}) {
  let url = `${API_BASE}${path}`
  if (query) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null),
    ).toString()
    if (qs) url += `?${qs}`
  }
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  if (DRY_RUN) return { ok: true, status: 200, data: { dry_run: true } }

  // Retry on network errors and 429/5xx. The Azure Container App occasionally
  // drops connections during burst traffic.
  let lastErr
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })
      let data
      const ct = res.headers.get('content-type') ?? ''
      data = ct.includes('application/json') ? await res.json() : await res.text()
      if (res.status === 429 || res.status >= 500) {
        const backoff = 1000 * attempt * attempt // 1s, 4s, 9s
        await sleep(backoff)
        continue
      }
      return { ok: res.ok, status: res.status, data }
    } catch (err) {
      lastErr = err
      const backoff = 1000 * attempt * attempt
      await sleep(backoff)
    }
  }
  // Out of retries — surface the last network error so callers can log it.
  throw lastErr ?? new Error(`${method} ${path} failed after ${maxRetries} retries`)
}

function logVerbose(...args) {
  if (VERBOSE) console.log('  ', ...args)
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1 — Create users
// ─────────────────────────────────────────────────────────────────────────────

async function createUser(index, total) {
  const isMale = Math.random() < 0.5
  const first = isMale ? pick(MALE_FIRST) : pick(FEMALE_FIRST)
  const last = pick(LAST_NAMES)
  const email = `${EMAIL_PREFIX}.${String(index).padStart(3, '0')}@wslny-demo.com`
  const mobile = `010${randint(10000000, 99999999)}`
  const district = pick(CAIRO_DISTRICTS)
  const gender = isMale ? 'male' : 'female'

  const payload = {
    email,
    password: DEMO_PASSWORD,
    first_name: first,
    last_name: last,
    mobile_number: mobile,
    gender,
    address: `${district}, Cairo`,
  }

  const t0 = performance.now()
  // Retry up to 3 times on 429 (rate limited). The rate limiter should
  // already keep us under the limit, but this catches bursts from other
  // concurrent runs on the same host.
  let res = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    res = await api('POST', '/api/v1/auth/register', { body: payload })
    if (res.status !== 429) break
    const backoff = 5000 * attempt // 5s, 10s, 15s
    console.log(
      `  [${String(index).padStart(3, '0')}/${total}] ⏳ 429, backing off ${backoff} ms`,
    )
    await sleep(backoff)
  }
  const ms = Math.round(performance.now() - t0)

  if (res.ok) {
    console.log(
      `  [${String(index).padStart(3, '0')}/${total}] + user ${first} ${last} <${email}> (${ms} ms)`,
    )
    return {
      index,
      email,
      first_name: first,
      last_name: last,
      token: res.data.token,
      refresh_token: res.data.refresh_token,
      gender,
      address: payload.address,
      active: true,
    }
  }

  if (res.status === 400) {
    // Likely already exists — try to log in instead
    const loginRes = await api('POST', '/api/v1/auth/login', {
      body: { email, password: DEMO_PASSWORD },
    })
    if (loginRes.ok) {
      console.log(
        `  [${String(index).padStart(3, '0')}/${total}] ↻ user exists, logged in <${email}> (${ms} ms)`,
      )
      return {
        index,
        email,
        first_name: first,
        last_name: last,
        token: loginRes.data.token,
        refresh_token: loginRes.data.refresh_token,
        gender,
        address: payload.address,
        active: true,
        reused: true,
      }
    }
  }
  console.log(
    `  [${String(index).padStart(3, '0')}/${total}] ✗ failed to create <${email}>: ${res.status}`,
  )
  return null
}

async function createAllUsers() {
  console.log(`\n── Phase 1: Create ${USER_COUNT} users ──`)
  // Anonymous registration is throttled to 30 req/min per IP (see
  // .speckit/plan.md §0). We run user creation sequentially with a
  // 28 req/min rate limiter so we never trigger HTTP 429.
  const sem = new Semaphore(1)
  const rate = new RateLimiter(Number(process.env.SEED_REGISTER_RPM ?? 28))
  const results = []
  for (let i = 1; i <= USER_COUNT; i++) {
    // eslint-disable-next-line no-await-in-loop
    const u = await withSemaphore(sem, async () => {
      await rate.wait()
      return createUser(i, USER_COUNT)
    })
    results.push(u)
  }
  const users = results.filter(Boolean)
  console.log(`  → ${users.length}/${USER_COUNT} users ready\n`)
  return users
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1b (alternative) — log in to existing users instead of creating new
// ─────────────────────────────────────────────────────────────────────────────
//
// When SEED_SKIP_USERS=1 is set we skip the slow anonymous registration step
// and instead try to log in to a set of known email patterns. Useful for
// "continue" runs after the user phase was already done, or when you only
// want to top up routes/feedback/locations.
//
// Patterns default to the ones our previous runs have produced. Override
// with SEED_LOGIN_PATTERNS=pat1,pat2 (each pattern uses {n} as the index
// placeholder; default placeholder is a 3-digit zero-padded number).

const DEFAULT_LOGIN_PATTERNS = [
  'bulk2.1782464649',     // most recent bulk run (this script's default)
  'bulk.1782464454',      // earlier failed bulk run
  'seed.user',            // very first seed default
  'demotest.1782464138',  // test run
]

async function loginExistingUser(email) {
  const res = await api('POST', '/api/v1/auth/login', {
    body: { email, password: DEMO_PASSWORD },
  })
  if (!res.ok) return null
  return {
    email,
    first_name: res.data?.user?.first_name ?? email.split('@')[0],
    last_name: res.data?.user?.last_name ?? '',
    token: res.data.token,
    refresh_token: res.data.refresh_token,
    active: true,
    reused: true,
  }
}

async function loadExistingUsers() {
  console.log(`\n── Phase 1: Log in to existing users (SEED_SKIP_USERS=1) ──`)
  const patterns = (process.env.SEED_LOGIN_PATTERNS ??
    DEFAULT_LOGIN_PATTERNS.join(',')).split(',').map((p) => p.trim()).filter(Boolean)
  const sem = new Semaphore(5) // login is 60 req/min authenticated, 5x is fine
  const wanted = Number(process.env.SEED_USER_COUNT ?? 800)
  // Allow a few consecutive misses before bailing on a pattern (handles
  // real gaps AND transient 4xx errors during a 429 burst).
  const MAX_MISSES_PER_PATTERN = 25
  const users = []
  outer: for (const pattern of patterns) {
    let consecutiveMisses = 0
    for (let i = 1; i <= 2000; i++) {
      if (users.length >= wanted) break outer
      // eslint-disable-next-line no-await-in-loop
      const u = await withSemaphore(sem, () =>
        loginExistingUser(`${pattern}.${String(i).padStart(3, '0')}@wslny-demo.com`),
      )
      if (!u) {
        consecutiveMisses++
        if (consecutiveMisses >= MAX_MISSES_PER_PATTERN) break
        continue
      }
      consecutiveMisses = 0
      users.push(u)
      if (users.length % 50 === 0 || users.length === wanted) {
        console.log(`  ${users.length}/${wanted} users loaded…`)
      }
    }
  }
  console.log(`  → ${users.length} users ready\n`)
  return users
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2 — Routing requests
// ─────────────────────────────────────────────────────────────────────────────

async function planRoute(user, isText) {
  const filter = pick(FILTERS)
  let body
  if (isText) {
    body = { text: buildTextRequest(), filter: filter.id }
  } else {
    let origin = pick(LOCATIONS)
    let destination = pick(LOCATIONS)
    while (destination.name === origin.name) destination = pick(LOCATIONS)
    body = {
      origin: { lat: origin.lat, lon: origin.lon },
      destination: { lat: destination.lat, lon: destination.lon },
      filter: filter.id,
    }
  }
  const res = await api('POST', '/api/v1/route', { token: user.token, body })
  const request_id = res.data?.request_id ?? (DRY_RUN ? randomUUID() : null)
  return {
    ok: res.ok,
    status: res.status,
    request_id,
    filter: filter.id,
    source: isText ? 'text' : 'map',
    error_code: res.data?.error?.code ?? null,
  }
}

async function generateRoutes(users) {
  console.log(`── Phase 2: Generate ${ROUTE_COUNT} routing requests ──`)
  // Distribute the total across users: a few power users, mostly light.
  const perUser = []
  let remaining = ROUTE_COUNT
  while (remaining > 0 && users.length > perUser.length) {
    const n = Math.min(remaining, pickRouteCount(remaining, users.length))
    perUser.push(n)
    remaining -= n
  }
  // Pad the rest with zero so everyone appears
  while (perUser.length < users.length) perUser.push(0)
  // Shuffle so the order doesn't bias
  for (let i = perUser.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[perUser[i], perUser[j]] = [perUser[j], perUser[i]]
  }

  const sem = new Semaphore(CONCURRENCY)
  let made = 0
  let succeeded = 0
  let failed = 0
  let networkFails = 0
  const successful = [] // {user, request_id, source, filter, ts}
  const startedAt = performance.now()
  const totalToMake = perUser.reduce((a, b) => a + b, 0)

  const tasks = []
  users.forEach((user, i) => {
    const want = perUser[i]
    for (let k = 0; k < want; k++) {
      tasks.push({ user, isText: Math.random() < 0.4 })
    }
  })

  // Shuffle tasks globally so users are interleaved (fairness across tokens).
  for (let i = tasks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[tasks[i], tasks[j]] = [tasks[j], tasks[i]]
  }

  const reportEvery = Math.max(200, Math.floor(tasks.length / 10))
  await Promise.all(
    tasks.map((t) =>
      withSemaphore(sem, async () => {
        let r
        try {
          r = await planRoute(t.user, t.isText)
        } catch (err) {
          // Network / fetch error after all retries — count as a hard fail,
          // log once, and keep going so one bad request doesn't kill the run.
          networkFails++
          if (networkFails <= 5 || networkFails % 100 === 0) {
            console.log(`    ⚠ network error: ${err.message ?? err}`)
          }
          made++
          failed++
          return
        }
        made++
        if (r.ok) {
          succeeded++
          if (r.request_id) {
            successful.push({
              user: t.user,
              request_id: r.request_id,
              source: r.source,
              filter: r.filter,
              ts: pickTimestamp(DAYS),
            })
          }
        } else {
          failed++
        }
        if (made % reportEvery === 0 || made === totalToMake) {
          const elapsed = (performance.now() - startedAt) / 1000
          const rate = made / elapsed
          const eta = (totalToMake - made) / Math.max(rate, 0.01)
          console.log(
            `    ${String(made).padStart(5)}/${totalToMake}  ok=${succeeded}  fail=${failed}  net=${networkFails}  ${rate.toFixed(1)} req/s  ETA ${eta.toFixed(0)}s`,
          )
        }
      }),
    ),
  )

  const totalSec = (performance.now() - startedAt) / 1000
  console.log(
    `  → ${made} requests in ${totalSec.toFixed(0)}s (${(made / totalSec).toFixed(1)} req/s). ok=${succeeded}, fail=${failed}, net=${networkFails}\n`,
  )
  return { successful, succeeded, failed, networkFails }
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3 — Feedback
// ─────────────────────────────────────────────────────────────────────────────

async function submitFeedback({ user, request_id, ts }) {
  const rating = pickRating()
  const useAr = Math.random() < 0.6
  const comment = useAr ? pick(COMMENTS_AR) : pick(COMMENTS_EN)
  const res = await api('POST', '/api/v1/routes/feedback', {
    token: user.token,
    body: { request_id, rating, comment },
  })
  return res.ok
}

async function generateFeedback(successful) {
  console.log(
    `── Phase 3: Submit feedback for ~${Math.round(successful.length * FEEDBACK_RATE)} of ${successful.length} successful routes ──`,
  )
  const targets = successful.filter(() => Math.random() < FEEDBACK_RATE)
  const sem = new Semaphore(CONCURRENCY)
  let ok = 0
  let fail = 0
  const startedAt = performance.now()
  const reportEvery = Math.max(200, Math.floor(targets.length / 10))
  await Promise.all(
    targets.map((t, i) =>
      withSemaphore(sem, async () => {
        const sent = await submitFeedback(t)
        if (sent) ok++
        else fail++
        if ((i + 1) % reportEvery === 0 || i + 1 === targets.length) {
          const elapsed = (performance.now() - startedAt) / 1000
          const rate = (i + 1) / Math.max(elapsed, 0.01)
          console.log(
            `    ${String(i + 1).padStart(5)}/${targets.length}  ok=${ok}  fail=${fail}  ${rate.toFixed(1)} fb/s`,
          )
        }
      }),
    ),
  )
  const totalSec = (performance.now() - startedAt) / 1000
  console.log(
    `  → ${ok} feedback entries posted in ${totalSec.toFixed(0)}s (${(ok / totalSec).toFixed(1)} fb/s). fail=${fail}\n`,
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 4 — Saved locations and favourite routes
// ─────────────────────────────────────────────────────────────────────────────

async function saveLocation(user) {
  const loc = pick(LOCATIONS)
  const type = pick(['home', 'work', 'custom'])
  const name = type === 'home' ? 'Home' : type === 'work' ? 'Work' : loc.name
  return api('POST', '/api/v1/user/saved-locations', {
    token: user.token,
    body: { name, lat: loc.lat, lon: loc.lon, type },
  })
}

async function saveFavorite(user) {
  let origin = pick(LOCATIONS)
  let destination = pick(LOCATIONS)
  while (destination.name === origin.name) destination = pick(LOCATIONS)
  const filter = pick(FILTERS)
  return api('POST', '/api/v1/user/favorites', {
    token: user.token,
    body: {
      name: `${origin.name} → ${destination.name}`,
      origin_lat: origin.lat,
      origin_lon: origin.lon,
      origin_name: origin.name,
      destination_lat: destination.lat,
      destination_lon: destination.lon,
      destination_name: destination.name,
      filter: filter.id,
    },
  })
}

async function generateLocationsAndFavorites(users) {
  console.log('── Phase 4: Saved locations and favourite routes ──')
  const sem = new Semaphore(CONCURRENCY)
  let locOk = 0
  let favOk = 0
  const tasks = []
  for (const user of users) {
    // Home + work for almost everyone
    tasks.push({ type: 'loc', fn: () => saveLocation(user) })
    if (Math.random() < 0.7) tasks.push({ type: 'loc', fn: () => saveLocation(user) })
    if (Math.random() < 0.5) tasks.push({ type: 'loc', fn: () => saveLocation(user) })
    // Favourite routes
    const n = randint(0, 3)
    for (let i = 0; i < n; i++) tasks.push({ type: 'fav', fn: () => saveFavorite(user) })
  }
  await Promise.all(
    tasks.map((t) =>
      withSemaphore(sem, async () => {
        const r = await t.fn()
        if (r.ok) {
          if (t.type === 'loc') locOk++
          else favOk++
        }
      }),
    ),
  )
  console.log(
    `  → ${locOk} saved locations, ${favOk} favourite routes\n`,
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 5 — Deactivate a few users (matches the "inactive" badge in dashboard)
// ─────────────────────────────────────────────────────────────────────────────

async function deactivateOne(user) {
  // Use a static admin token? We don't have one. Skip — manual deactivation
  // is fine for the demo. This phase is intentionally a no-op so the seed
  // script doesn't need admin credentials. Operators can deactivate via UI.
  return false
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('────────────────────────────────────────────────────────────')
  console.log(' Wslny Admin — Demo Data Seeder')
  console.log('────────────────────────────────────────────────────────────')
  console.log(` API:           ${API_BASE}`)
  console.log(` Users:         ${USER_COUNT}`)
  console.log(` Routes:        ${ROUTE_COUNT}`)
  console.log(` Feedback rate: ${(FEEDBACK_RATE * 100).toFixed(0)}%`)
  console.log(` History:       last ${DAYS} days`)
  console.log(` Concurrency:   ${CONCURRENCY}`)
  console.log(` Dry run:       ${DRY_RUN ? 'yes' : 'no'}`)
  console.log('────────────────────────────────────────────────────────────')

  const t0 = performance.now()
  const users = process.env.SEED_SKIP_USERS === '1'
    ? await loadExistingUsers()
    : await createAllUsers()
  if (users.length === 0) {
    console.error('No users created — aborting.')
    process.exit(1)
  }
  const { successful } = await generateRoutes(users)
  await generateFeedback(successful)
  await generateLocationsAndFavorites(users)

  const totalSec = (performance.now() - t0) / 1000
  console.log('────────────────────────────────────────────────────────────')
  console.log(` Done in ${(totalSec / 60).toFixed(1)} min`)
  console.log(`   users:           ${users.length}`)
  console.log(`   successful reqs: ${successful.length}`)
  console.log(`   feedback ≈:      ${Math.round(successful.length * FEEDBACK_RATE)}`)
  console.log('────────────────────────────────────────────────────────────')
  console.log(' Sign in to the dashboard with any of the seeded accounts:')
  console.log(`   email:    ${EMAIL_PREFIX}.000@wslny-demo.com`)
  console.log(`   password: ${DEMO_PASSWORD}`)
  console.log('────────────────────────────────────────────────────────────')
}

main().catch((err) => {
  console.error('Seed script failed:', err)
  process.exit(1)
})
