import { describe, expect, it } from 'vitest'

import { isAdminEndpoint } from '@/lib/api/admin-allowlist'

describe('admin endpoint allowlist', () => {
  describe('allowed (admin / auth-self-service / health)', () => {
    it.each([
      '/api/v1/auth/login',
      '/api/v1/auth/google-login',
      '/api/v1/auth/refresh',
      '/api/v1/auth/profile',
      '/api/v1/auth/change-password',
      '/api/v1/admin/users',
      '/api/v1/admin/users?search=ahmed&limit=20',
      '/api/v1/admin/users/42',
      '/api/v1/admin/change-role',
      '/api/v1/admin/analytics/routes/overview',
      '/api/v1/admin/analytics/routes/overview?from_date=2026-01-01',
      '/api/v1/admin/analytics/feedback/summary',
      '/api/health',
    ])('permits %s', (path) => {
      expect(isAdminEndpoint(path)).toBe(true)
    })
  })

  describe('forbidden (end-user / mobile-app surface)', () => {
    it.each([
      '/api/v1/auth/register',
      '/api/v1/route',
      '/api/v1/route/history',
      '/api/v1/routes/search',
      '/api/v1/routes/search/confirm',
      '/api/v1/routes/alternatives',
      '/api/v1/routes/feedback',
      '/api/v1/routes/metadata',
      '/api/v1/lines',
      '/api/v1/lines/12',
      '/api/v1/stops/nearby',
      '/api/v1/stops/42',
      '/api/v1/user/saved-locations',
      '/api/v1/user/favorites',
      '/api/v1/user/preferences',
    ])('blocks %s', (path) => {
      expect(isAdminEndpoint(path)).toBe(false)
    })
  })

  it('treats full URLs by inspecting the pathname', () => {
    expect(isAdminEndpoint('https://api.example.com/api/v1/admin/users?limit=10')).toBe(true)
    expect(isAdminEndpoint('https://api.example.com/api/v1/route')).toBe(false)
  })

  it('returns false for empty / undefined input', () => {
    expect(isAdminEndpoint(undefined)).toBe(false)
    expect(isAdminEndpoint('')).toBe(false)
  })
})
