import { api, toApiError } from '@/lib/api/client'
import type {
  FeedbackList,
  FeedbackSummary,
  RouteAnalyticsOverview,
  TopRoute,
  UnresolvedAnalytics,
  UserAnalyticsOverview,
  FilterStat,
} from '@/types/analytics'

export interface RouteAnalyticsQuery {
  source?: 'text' | 'map'
  status?: 'success' | 'failed'
  filter?: number | string
  from_date?: string
  to_date?: string
}

export interface AnalyticsQueryParams {
  metrics: string
  group_by?: string
  sort?: string
  order?: 'asc' | 'desc'
  limit?: number
  offset?: number
  source?: 'text' | 'map'
  status?: 'success' | 'failed'
  from_date?: string
  to_date?: string
}

export interface AnalyticsQueryResult {
  rows: Record<string, unknown>[]
  metrics: string[]
  group_by: string[]
  count: number
  limit: number
  offset: number
}

export const analyticsApi = {
  async routeOverview(
    params: RouteAnalyticsQuery = {},
  ): Promise<RouteAnalyticsOverview> {
    try {
      const { data } = await api.get<RouteAnalyticsOverview>(
        '/api/v1/admin/analytics/routes/overview',
        { params },
      )
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async topRoutes(limit = 10): Promise<{ top_routes: TopRoute[] }> {
    try {
      const { data } = await api.get<{ top_routes: TopRoute[] }>(
        '/api/v1/admin/analytics/routes/top-routes',
        { params: { limit } },
      )
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async filterStats(
    params: RouteAnalyticsQuery = {},
  ): Promise<{ filter: FilterStat }> {
    try {
      const { data } = await api.get<{ filter: FilterStat }>(
        '/api/v1/admin/analytics/routes/filters',
        { params },
      )
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async filterStatsAll(
    params: RouteAnalyticsQuery = {},
  ): Promise<{ filters: FilterStat[] }> {
    try {
      const { data } = await api.get<{ filters: FilterStat[] }>(
        '/api/v1/admin/analytics/routes/filters',
        { params },
      )
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async unresolved(
    params: RouteAnalyticsQuery = {},
  ): Promise<UnresolvedAnalytics> {
    try {
      const { data } = await api.get<UnresolvedAnalytics>(
        '/api/v1/admin/analytics/routes/unresolved',
        { params },
      )
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async query(params: AnalyticsQueryParams): Promise<AnalyticsQueryResult> {
    try {
      const { data } = await api.get<AnalyticsQueryResult>(
        '/api/v1/admin/analytics/routes/query',
        { params },
      )
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async userOverview(): Promise<UserAnalyticsOverview> {
    try {
      const { data } = await api.get<UserAnalyticsOverview>(
        '/api/v1/admin/analytics/users/overview',
      )
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },
}

export interface FeedbackQuery {
  min_rating?: number
  max_rating?: number
  user_id?: number
  from_date?: string
  to_date?: string
  limit?: number
  offset?: number
}

export const feedbackApi = {
  async list(params: FeedbackQuery = {}): Promise<FeedbackList> {
    try {
      const { data } = await api.get<FeedbackList>(
        '/api/v1/admin/analytics/feedback',
        { params },
      )
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async summary(): Promise<FeedbackSummary> {
    try {
      const { data } = await api.get<FeedbackSummary>(
        '/api/v1/admin/analytics/feedback/summary',
      )
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },
}
