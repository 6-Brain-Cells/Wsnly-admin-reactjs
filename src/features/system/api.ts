import { AxiosError } from 'axios'

import { api, toApiError } from '@/lib/api/client'
import type { HealthStatus, SystemHealth } from '@/types/analytics'

/**
 * The backend's `/api/health` returns an empty body and uses the HTTP status
 * code to convey liveness: 200 = all up, 503 = at least one dependency down
 * (DB / AI gRPC / Routing gRPC). We therefore derive the booleans from the
 * status code alone. If the backend ever ships a structured body we will
 * pick it up here without breaking the public hook signature.
 */
export const systemApi = {
  async health(): Promise<SystemHealth> {
    const now = new Date().toISOString()
    try {
      await api.get('/api/health')
      return {
        status: 'healthy',
        checkedAt: now,
        checks: {
          database: 'healthy',
          ai_service: 'healthy',
          routing_engine: 'healthy',
        },
      }
    } catch (error) {
      const apiErr =
        error instanceof AxiosError ? error : toApiError(error)
      const status = apiErr.status === 503 ? 'unhealthy' : 'unhealthy'
      const statusOnly: HealthStatus = status
      return {
        status: statusOnly,
        checkedAt: now,
        checks: {
          database: statusOnly,
          ai_service: statusOnly,
          routing_engine: statusOnly,
        },
      }
    }
  },
}
