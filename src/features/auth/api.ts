import { api, toApiError } from '@/lib/api/client'
import { useAuthStore } from './store'
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  User,
} from '@/types/user'

/**
 * Build the Authorization header from the live auth store. We set this
 * explicitly on every authenticated call instead of relying on the
 * request interceptor, so a bug in the interceptor (e.g. axios
 * AxiosHeaders timing / HMR module duplication) can never silently
 * drop the JWT.
 */
function authHeader(): Record<string, string> {
  const token = useAuthStore.getState().accessToken
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/api/v1/auth/login', payload)
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async googleLogin(idToken: string): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>(
        '/api/v1/auth/google-login',
        { id_token: idToken },
      )
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async getProfile(): Promise<User> {
    try {
      const { data } = await api.get<User>('/api/v1/auth/profile', {
        headers: authHeader(),
      })
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async updateProfile(payload: Partial<User>): Promise<User> {
    try {
      const { data } = await api.put<User>('/api/v1/auth/profile', payload, {
        headers: authHeader(),
      })
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    try {
      await api.post('/api/v1/auth/change-password', payload, {
        headers: authHeader(),
      })
    } catch (error) {
      throw toApiError(error)
    }
  },
}
