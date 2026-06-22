import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/features/auth/store'

// Mock the api module so performLogin's HTTP calls are intercepted.
vi.mock('@/lib/api/client', () => ({
  api: {
    get: vi.fn(),
  },
  toApiError: vi.fn((e: unknown) => ({
    message: e instanceof Error ? e.message : String(e),
    status: 0,
  })),
}))

vi.mock('@/features/auth/api', () => ({
  authApi: {
    login: vi.fn(),
    googleLogin: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
}))

import { authApi } from '@/features/auth/api'
import { performLogin } from '@/features/auth/hooks'
import { api } from '@/lib/api/client'

const mockedApiGet = vi.mocked(api.get) as unknown as ReturnType<typeof vi.fn>
const mockedAuthApi = vi.mocked(authApi)

describe('performLogin commits tokens AND full user atomically', () => {
  beforeEach(() => {
    useAuthStore.getState().clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    useAuthStore.getState().clear()
  })

  it('after login the store has BOTH tokens AND user.role (no tokenless-user window)', async () => {
    // Login response intentionally lacks `role` — matches the real backend.
    mockedAuthApi.login.mockResolvedValue({
      token: 'login-access-token',
      refresh_token: 'login-refresh-token',
      user: { email: 'admin@wslny.com', first_name: 'Admin', last_name: 'User' },
    } as never)

    // Profile response (has `role`)
    mockedApiGet.mockResolvedValue({
      data: {
        email: 'admin@wslny.com',
        first_name: 'Admin',
        last_name: 'User',
        mobile_number: '+201001234567',
        gender: 'male',
        address: 'Cairo',
        role: 'Admin',
      },
    } as never)

    await performLogin({
      email: 'admin@wslny.com',
      password: 'Admin@Wslny2026',
    })

    expect(mockedAuthApi.login).toHaveBeenCalledWith({
      email: 'admin@wslny.com',
      password: 'Admin@Wslny2026',
    })
    expect(mockedApiGet).toHaveBeenCalledWith(
      '/api/v1/auth/profile',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer login-access-token',
        }),
      }),
    )

    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('login-access-token')
    expect(state.refreshToken).toBe('login-refresh-token')
    expect(state.user?.role).toBe('Admin')
    expect(state.isAuthenticated()).toBe(true)
    expect(state.isAdmin()).toBe(true)
  })

  it('leaves the store empty if profile fetch fails (no tokenless-but-user state)', async () => {
    mockedAuthApi.login.mockResolvedValue({
      token: 'will-be-discarded',
      refresh_token: 'will-be-discarded',
      user: { email: 'x@y.com', first_name: 'X', last_name: 'Y' },
    } as never)
    mockedApiGet.mockRejectedValue(new Error('boom'))

    await expect(
      performLogin({ email: 'x@y.com', password: 'pwd12345' }),
    ).rejects.toThrow('boom')

    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated()).toBe(false)
  })
})
