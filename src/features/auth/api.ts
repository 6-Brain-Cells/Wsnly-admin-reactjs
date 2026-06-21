import { api, toApiError } from '@/lib/api/client'
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  User,
} from '@/types/user'

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
      const { data } = await api.post<AuthResponse>('/api/v1/auth/google-login', {
        id_token: idToken,
      })
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async getProfile(): Promise<User> {
    try {
      const { data } = await api.get<User>('/api/v1/auth/profile')
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async updateProfile(payload: Partial<User>): Promise<User> {
    try {
      const { data } = await api.put<User>('/api/v1/auth/profile', payload)
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    try {
      await api.post('/api/v1/auth/change-password', payload)
    } catch (error) {
      throw toApiError(error)
    }
  },
}
