import { api, toApiError } from '@/lib/api/client'
import type { User, UserDetail, UserUpdatePayload } from '@/types/user'

export interface ListUsersParams {
  search?: string
  role?: string
  is_active?: boolean
  limit?: number
  offset?: number
}

export const usersApi = {
  async list(params: ListUsersParams = {}): Promise<User[]> {
    try {
      const { data } = await api.get<User[]>('/api/v1/admin/users', { params })
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async get(id: number | string): Promise<UserDetail> {
    try {
      const { data } = await api.get<UserDetail>(`/api/v1/admin/users/${id}`)
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async update(id: number | string, payload: UserUpdatePayload): Promise<User> {
    try {
      const { data } = await api.put<User>(`/api/v1/admin/users/${id}`, payload)
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async deactivate(id: number | string): Promise<void> {
    try {
      await api.delete(`/api/v1/admin/users/${id}`)
    } catch (error) {
      throw toApiError(error)
    }
  },

  async changeRole(userId: number, newRole: string): Promise<void> {
    try {
      await api.post('/api/v1/admin/change-role', {
        user_id: userId,
        new_role: newRole,
      })
    } catch (error) {
      throw toApiError(error)
    }
  },
}
