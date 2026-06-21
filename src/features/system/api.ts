import { api, toApiError } from '@/lib/api/client'
import type { SystemHealth } from '@/types/analytics'

export const systemApi = {
  async health(): Promise<SystemHealth> {
    try {
      const { data } = await api.get<SystemHealth>('/api/health')
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },
}
