/**
 * The Wslny admin dashboard is **only** allowed to call the admin surface
 * of the backend. The Flutter mobile client owns every other endpoint
 * (`/api/v1/route/*`, `/api/v1/routes/*`, `/api/v1/user/*`, `/api/v1/lines/*`,
 * `/api/v1/stops/*`, `/api/v1/auth/register`). This allow-list is enforced
 * in `lib/api/client.ts` as a runtime guard and surfaced loudly in dev so a
 * future contributor can't accidentally re-introduce a forbidden call.
 *
 * See `.speckit/plan.md` §0.2 and risk R11.
 */
export const ADMIN_ENDPOINT_ALLOWLIST: readonly RegExp[] = [
  /^\/api\/v1\/auth\/(login|google-login|refresh|profile|change-password)\b/,
  /^\/api\/v1\/admin\/(users|change-role|analytics)\b/,
  /^\/api\/health\b/,
]

export function isAdminEndpoint(url: string | undefined): boolean {
  if (!url) return false
  const path = url.startsWith('http')
    ? new URL(url).pathname
    : url.split('?')[0] ?? ''
  return ADMIN_ENDPOINT_ALLOWLIST.some((re) => re.test(path))
}
