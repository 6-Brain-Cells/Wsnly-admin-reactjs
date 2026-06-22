import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '@/features/auth/store'
import { ROLES } from '@/constants/enums'
import type { User } from '@/types/user'

const baseUser = {
  id: 1,
  email: 'admin@wslny.com',
  first_name: 'Admin',
  last_name: 'User',
  mobile_number: '+201000000000',
  role: ROLES.ADMIN,
  is_active: true,
  is_staff: true,
  date_joined: '2026-01-15T10:30:00Z',
}

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.getState().clear()
  })

  afterEach(() => {
    useAuthStore.getState().clear()
  })

  it('starts unauthenticated', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
    expect(useAuthStore.getState().isAdmin()).toBe(false)
  })

  it('becomes authenticated after setAuth', () => {
    useAuthStore.getState().setAuth('access-token', 'refresh-token', baseUser)
    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('access-token')
    expect(state.refreshToken).toBe('refresh-token')
    expect(state.user).toEqual(baseUser)
    expect(state.isAuthenticated()).toBe(true)
    expect(state.isAdmin()).toBe(true)
  })

  it('isAdmin returns false for non-Admin role (case-sensitive)', () => {
    const lowercaseUser = { ...baseUser, role: 'admin' as typeof ROLES.ADMIN }
    useAuthStore.getState().setAuth('t', 'r', lowercaseUser)
    // Critical: backend's IsAdminUser checks exact "Admin", never normalised.
    // The frontend MUST do the same — see plan §7 / risk R12.
    expect(useAuthStore.getState().isAdmin()).toBe(false)
  })

  it('isAdmin returns false for User role', () => {
    const regularUser = { ...baseUser, role: ROLES.USER }
    useAuthStore.getState().setAuth('t', 'r', regularUser)
    expect(useAuthStore.getState().isAdmin()).toBe(false)
  })

  it('clear() wipes everything', () => {
    useAuthStore.getState().setAuth('t', 'r', baseUser)
    useAuthStore.getState().clear()
    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(useAuthStore.getState().refreshToken).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })

  it('setUser updates only the user field', () => {
    useAuthStore.getState().setAuth('t', 'r', baseUser)
    const updated = { ...baseUser, first_name: 'Updated' }
    useAuthStore.getState().setUser(updated)
    expect(useAuthStore.getState().user?.first_name).toBe('Updated')
    expect(useAuthStore.getState().accessToken).toBe('t')
  })

  describe('stale partial-user state from a previous broken login', () => {
    // Regression: the backend's login response omits `role`, so an older
    // build of the app would store a token + a user WITHOUT a role. On
    // page reload that stale state would make isAuthenticated() return
    // true but isAdmin() return false, causing a redirect loop between
    // /login and /. The LoginPage detects this and calls clear(); the
    // store-level invariants below describe what isAdmin / isAuthenticated
    // return when the user object is missing role.

    const partialUser = {
      id: 1,
      email: 'stale@wslny.com',
      first_name: 'Stale',
      last_name: 'User',
      mobile_number: '',
      gender: null,
      address: null,
      is_active: true,
      is_staff: false,
      date_joined: '2026-01-01T00:00:00Z',
    } as unknown as User

    it('isAdmin returns false when role is missing', () => {
      useAuthStore.getState().setAuth('t', 'r', partialUser)
      expect(useAuthStore.getState().isAuthenticated()).toBe(true)
      expect(useAuthStore.getState().isAdmin()).toBe(false)
    })

    it('isAdmin returns false for empty-string role', () => {
      useAuthStore
        .getState()
        .setAuth('t', 'r', { ...partialUser, role: '' as User['role'] })
      expect(useAuthStore.getState().isAdmin()).toBe(false)
    })

    it('clear() restores a clean unauthenticated state', () => {
      useAuthStore.getState().setAuth('t', 'r', partialUser as never)
      useAuthStore.getState().clear()
      expect(useAuthStore.getState().isAuthenticated()).toBe(false)
      expect(useAuthStore.getState().isAdmin()).toBe(false)
      expect(useAuthStore.getState().accessToken).toBeNull()
    })
  })
})
