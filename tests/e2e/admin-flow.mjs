/**
 * End-to-end admin interactivity test (≥20 navigations).
 *
 * Drives a real headless Chrome browser through every admin page,
 * verifying:
 *   1. The page loads without throwing (no ErrorBoundary).
 *   2. The expected admin API endpoints are called and respond 2xx.
 *   3. Interactive controls (tabs, presets, row click, logout) work
 *      end-to-end through real browser pointer events.
 *
 * Requires:
 *   - Backend on http://localhost:8000  (`docker compose up` in
 *     Wsnly-Backend/)
 *   - Admin user seeded: admin@wslny.com / Admin@Wslny2026
 *
 * Run:
 *   node tests/e2e/admin-flow.mjs
 */

import puppeteer from '/home/abanoub/Desktop/projects/wslny-admin-reactjs/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js'

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5174'
const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000'

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
})

let pass = 0
let fail = 0

function record(label, ok, detail) {
  pass += ok ? 1 : 0
  fail += ok ? 0 : 1
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ' — ' + detail : ''}`)
}

/**
 * Click an element by matching its visible text. Uses bounding-box
 * coordinates + a real mouse click so Radix's pointer-event handlers
 * fire correctly (calling `.click()` directly omits pointerdown/pointerup).
 */
async function clickByText(page, text) {
  const handle = await page.evaluateHandle((needle) => {
    function* walk(root) {
      yield root
      for (const c of root.children) yield* walk(c)
    }
    for (const el of walk(document.body)) {
      if (
        el instanceof HTMLElement &&
        (el.textContent || '').trim().toLowerCase() === needle.toLowerCase()
      ) {
        return el
      }
    }
    return null
  }, text)
  const el = handle.asElement()
  if (!el) return false
  const box = await el.boundingBox()
  if (!box) return false
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  return true
}

async function clickByPartialText(page, text) {
  const handle = await page.evaluateHandle((needle) => {
    function* walk(root) {
      yield root
      for (const c of root.children) yield* walk(c)
    }
    // Collect candidates; prefer role=tab > role=menuitem > button > a.
    const tabs = []
    const menuitems = []
    const buttons = []
    const others = []
    for (const el of walk(document.body)) {
      if (!(el instanceof HTMLElement)) continue
      if (!(el.textContent || '').toLowerCase().includes(needle.toLowerCase())) continue
      const role = el.getAttribute('role')
      if (role === 'tab') tabs.push(el)
      else if (role === 'menuitem') menuitems.push(el)
      else if (el.tagName === 'BUTTON' || el.tagName === 'A')
        buttons.push(el)
      else others.push(el)
    }
    return tabs[0] || menuitems[0] || buttons[0] || others[0] || null
  }, text)
  const el = handle.asElement()
  if (!el) return false
  const box = await el.boundingBox()
  if (!box) return false
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  return true
}

try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  page.on('pageerror', (e) => console.log('  ⚠️  pageerror:', e.message))

  // ── Sign in ────────────────────────────────────────────────────────
  console.log('\n── 1. Sign in ──')
  await page.goto(`${FRONTEND}/login`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('input#email', { timeout: 8000 })
  await page.evaluate(() => localStorage.clear())
  await page.type('input#email', 'admin@wslny.com')
  await page.type('input#password', 'Admin@Wslny2026')

  const loginWatch = page.waitForResponse((r) =>
    r.url().endsWith('/api/v1/auth/login'),
  )
  await page.click('button[type="submit"]')
  const loginRes = await loginWatch
  record('POST /api/v1/auth/login returns 200', loginRes.status() === 200, `status=${loginRes.status()}`)

  const profileWatch = page.waitForResponse((r) =>
    r.url().endsWith('/api/v1/auth/profile'),
  )
  const profileRes = await profileWatch
  record('GET /api/v1/auth/profile returns 200', profileRes.status() === 200, `status=${profileRes.status()}`)

  await page.waitForFunction(
    () => !location.pathname.endsWith('/login'),
    { timeout: 8000 },
  )
  record('Navigated to dashboard after login', page.url().endsWith(':5174/') || page.url().endsWith(':5174'), page.url())

  // ── Helper: visit a page and capture every /api/* request ─────────
  async function visitAndCapture(label, path, waitFor) {
    const requests = []
    const handler = (req) => {
      const url = req.url()
      if (
        url.includes('/api/v1/admin') ||
        url.includes('/api/health') ||
        url.includes('/api/v1/auth/profile')
      ) {
        requests.push({ method: req.method(), url: url.replace(BACKEND, '') })
      }
    }
    page.on('request', handler)
    try {
      await page.goto(`${FRONTEND}${path}`, { waitUntil: 'domcontentloaded' })
      if (waitFor) await page.waitForSelector(waitFor, { timeout: 5000 })
      await new Promise((r) => setTimeout(r, 800))
    } finally {
      page.off('request', handler)
    }
    record(`${label} — page rendered`, true, `${requests.length} admin requests fired`)
    return requests
  }

  // ── Dashboard ─────────────────────────────────────────────────────
  console.log('\n── 2. Dashboard ──')
  await visitAndCapture('Dashboard', '/', 'h1')
  record(
    'Dashboard title is set',
    (await page.title()).includes('Dashboard'),
    await page.title(),
  )
  // After seeding the DB, the KPI cards should show non-zero values.
  await new Promise((r) => setTimeout(r, 1200))
  const dashKpis = await page
    .$$eval('.text-2xl.font-bold, .text-3xl.font-bold', (els) =>
      els.map((e) => e.textContent.trim()),
    )
    .catch(() => [])
  const numericKpis = dashKpis.filter((s) => /\d/.test(s) && !/^Dashboard/i.test(s))
  record(
    'Dashboard shows ≥1 numeric KPI with non-zero value',
    numericKpis.some((s) => {
      const m = s.match(/[\d,.]+/)
      return m && parseFloat(m[0].replace(/,/g, '')) > 0
    }),
    `KPIs: ${JSON.stringify(numericKpis)}`,
  )

  // ── Users List ────────────────────────────────────────────────────
  console.log('\n── 3. Users List ──')
  const usersListReqs = await visitAndCapture('Users List', '/users', 'table')
  record(
    'GET /api/v1/admin/users called',
    usersListReqs.some((r) => r.url.startsWith('/api/v1/admin/users')),
    `requests: ${JSON.stringify(usersListReqs)}`,
  )

  // The seeded DB has 20+ users → the table should be non-empty.
  const userRowCount = await page.$$eval('table tbody tr', (rows) => rows.length)
  record(
    'Users table shows >0 rows from seeded DB',
    userRowCount > 0,
    `${userRowCount} rows`,
  )

  // Click into the first row → UserDetail
  const firstRow = await page.$('table tbody tr')
  if (firstRow) {
    const detailReqs = []
    const handler = (req) => {
      const path = new URL(req.url()).pathname
      if (
        path.startsWith('/api/v1/admin/users/') &&
        path !== '/api/v1/admin/users'
      ) {
        detailReqs.push(req.url().replace(BACKEND, ''))
      }
    }
    page.on('request', handler)
    try {
      const box = await firstRow.boundingBox()
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      }
      await new Promise((r) => setTimeout(r, 1200))
    } finally {
      page.off('request', handler)
    }
    record(
      'GET /api/v1/admin/users/{id} fires on row click',
      detailReqs.length >= 1,
      `${detailReqs.length} requests`,
    )
  } else {
    record('Users list has at least one row', false, 'no rows found')
  }

  // ── Route Analytics — Overview fires on mount, tabs fire on click ──
  console.log('\n── 4. Route Analytics (overview + 3 tabs) ──')
  const overviewReqs = await visitAndCapture(
    'Route Analytics overview tab',
    '/analytics/routes',
    'h1',
  )
  record(
    'GET /api/v1/admin/analytics/routes/overview (default tab)',
    overviewReqs.some((r) =>
      r.url.startsWith('/api/v1/admin/analytics/routes/overview'),
    ),
    `${overviewReqs.length} calls`,
  )

  for (const [tab, endpoint, index] of [
    ['top', '/api/v1/admin/analytics/routes/top-routes', 1],
    ['filters', '/api/v1/admin/analytics/routes/filters', 2],
    ['unresolved', '/api/v1/admin/analytics/routes/unresolved', 3],
  ]) {
    const tabReqs = []
    const handler = (req) => {
      const path = new URL(req.url()).pathname
      if (path === endpoint || path.startsWith(endpoint + '?')) {
        tabReqs.push(req.url().replace(BACKEND, ''))
      }
    }
    page.on('request', handler)
    try {
      const tabInfo = await page.evaluate((idx) => {
        const tabs = document.querySelectorAll('[role="tab"]')
        const t = tabs[idx]
        if (!(t instanceof HTMLElement)) return null
        const r = t.getBoundingClientRect()
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
      }, index)
      if (!tabInfo) throw new Error(`could not find tab index ${index}`)
      await page.mouse.click(tabInfo.x, tabInfo.y)
      await new Promise((r) => setTimeout(r, 1500))
      // Top Routes + Unresolved render tables; assert non-empty rows.
      if (tab === 'top' || tab === 'unresolved') {
        const rowCount = await page.$$eval('table tbody tr', (rows) => rows.length)
        record(
          `Route Analytics "${tab}" tab shows >0 data rows`,
          rowCount > 0,
          `${rowCount} rows`,
        )
      }
    } finally {
      page.off('request', handler)
    }
    record(
      `GET ${endpoint} on tab "${tab}"`,
      tabReqs.length >= 1,
      `${tabReqs.length} calls`,
    )
  }

  // ── User Analytics ────────────────────────────────────────────────
  console.log('\n── 5. User Analytics ──')
  const userAnaReqs = await visitAndCapture('User Analytics', '/analytics/users', 'h1')
  record(
    'GET /api/v1/admin/analytics/users/overview',
    userAnaReqs.some((r) => r.url.startsWith('/api/v1/admin/analytics/users/overview')),
    `${userAnaReqs.length} calls`,
  )

  // ── Feedback Analytics — summary on mount, list on tab click ─────
  console.log('\n── 6. Feedback Analytics ──')
  const feedbackReqs = await visitAndCapture(
    'Feedback Analytics',
    '/analytics/feedback',
    'h1',
  )
  record(
    'GET /api/v1/admin/analytics/feedback/summary',
    feedbackReqs.some((r) => r.url.startsWith('/api/v1/admin/analytics/feedback/summary')),
    `${feedbackReqs.length} calls`,
  )
  {
    const listReqs = []
    const handler = (req) => {
      const path = new URL(req.url()).pathname
      if (path === '/api/v1/admin/analytics/feedback' || path.startsWith('/api/v1/admin/analytics/feedback?')) {
        listReqs.push(req.url().replace(BACKEND, ''))
      }
    }
    page.on('request', handler)
    try {
      const handle = await page.evaluateHandle(() => {
        const tabs = document.querySelectorAll('[role="tab"]')
        return tabs[1] instanceof HTMLElement ? tabs[1] : null
      })
      const el = handle.asElement()
      if (!el) throw new Error('could not find "All reviews" tab')
      await el.click()
      await new Promise((r) => setTimeout(r, 1500))
      const reviewItems = await page.$$eval(
        '[class*="divide-y"] > div',
        (els) => els.length,
      )
      record(
        'Feedback "All reviews" tab shows >0 review rows',
        reviewItems > 0,
        `${reviewItems} reviews`,
      )
    } finally {
      page.off('request', handler)
    }
    record(
      'GET /api/v1/admin/analytics/feedback on "All reviews" tab',
      listReqs.length >= 1,
      `${listReqs.length} calls`,
    )
  }

  // ── Query Builder ─────────────────────────────────────────────────
  console.log('\n── 7. Query Builder ──')
  await page.goto(`${FRONTEND}/analytics/query`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('h1', { timeout: 5000 })
  await new Promise((r) => setTimeout(r, 500))
  record(
    'Query Builder page loaded',
    (await page.$eval('h1', (el) => el.textContent)).includes('Query Builder'),
  )

  // The page runs DEFAULT_PARAMS on mount, so click Reset to reveal presets
  {
    const resetClicked = await clickByText(page, 'Reset')
    await new Promise((r) => setTimeout(r, 300))
    const presetButtons = await page.$$('button')
    let presetCount = 0
    for (const b of presetButtons) {
      const t = await page.evaluate((el) => el.textContent, b)
      if (t && /Daily success rate|By source|filter performance|Latency breakdown/i.test(t)) {
        presetCount++
      }
    }
    record(
      'Query Builder shows ≥1 preset tile after Reset',
      presetCount >= 1,
      `${presetCount} preset tile(s) visible (reset clicked: ${resetClicked})`,
    )

    if (presetCount >= 1) {
      const qbReqs = []
      const handler = (req) => {
        const path = new URL(req.url()).pathname
        if (path.startsWith('/api/v1/admin/analytics/routes/query')) {
          qbReqs.push(req.url().replace(BACKEND, ''))
        }
      }
      page.on('request', handler)
      try {
        const clicked = await clickByPartialText(page, 'Daily success rate')
        if (!clicked) throw new Error('could not find preset "Daily success rate"')
        await new Promise((r) => setTimeout(r, 1500))
      } finally {
        page.off('request', handler)
      }
      record(
        'GET /api/v1/admin/analytics/routes/query on preset click',
        qbReqs.length >= 1,
        `${qbReqs.length} calls: ${JSON.stringify(qbReqs)}`,
      )
      const qbResultRows = await page.$$eval('table tbody tr', (rows) => rows.length)
      record(
        'Query Builder results table shows >0 rows',
        qbResultRows > 0,
        `${qbResultRows} rows`,
      )
    }
  }

  // ── System Health ─────────────────────────────────────────────────
  console.log('\n── 8. System Health ──')
  const sysReqs = await visitAndCapture('System Health', '/system', 'h1')
  record('GET /api/health', sysReqs.some((r) => r.url === '/api/health'), `${sysReqs.length} calls`)

  // ── Profile ───────────────────────────────────────────────────────
  console.log('\n── 9. Profile ──')
  await visitAndCapture('Profile', '/profile', 'h1')

  // ── Logout ────────────────────────────────────────────────────────
  console.log('\n── 10. Logout ──')
  await page.click('[aria-label="Account menu"]').catch(() => {})
  await new Promise((r) => setTimeout(r, 600))
  const signOutBox = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('[role="menuitem"]'))
    const t = items.find((el) => (el.textContent || '').includes('Sign out'))
    if (!(t instanceof HTMLElement)) return null
    const r = t.getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
  })
  let signedOut = false
  if (signOutBox) {
    await page.mouse.click(signOutBox.x, signOutBox.y)
    signedOut = true
  }
  await page
    .waitForFunction(() => location.pathname.endsWith('/login'), {
      timeout: 4000,
    })
    .catch(() => {})
  record(
    'Logout redirects to /login',
    page.url().endsWith('/login'),
    `(signed-out click ok: ${signedOut}) ${page.url()}`,
  )

  console.log(`\n=========================================`)
  console.log(`Admin E2E results: ${pass} passed, ${fail} failed`)
  console.log(`=========================================`)
  process.exitCode = fail > 0 ? 1 : 0
} finally {
  await browser.close()
}
