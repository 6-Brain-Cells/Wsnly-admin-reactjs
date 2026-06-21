import type { RouteFilter } from '@/constants/enums'

export interface DailyPoint {
  day: string
  total: number
}

export interface RouteAnalyticsTotals {
  requests: number
  success: number
  failed: number
  success_rate_percent: number
}

export interface RouteAnalyticsAverages {
  ai_latency_ms: number
  routing_latency_ms: number
  total_latency_ms: number
  duration_seconds: number
  distance_meters: number
}

export interface SourceBreakdown {
  text: number
  map: number
}

export interface RouteAnalyticsOverview {
  totals: RouteAnalyticsTotals
  source_breakdown: SourceBreakdown
  averages: RouteAnalyticsAverages
  daily_usage: DailyPoint[]
}

export interface TopRoute {
  origin_name: string
  destination_name: string
  requests: number
  avg_duration_seconds: number
  avg_distance_meters: number
}

export interface FilterStat {
  name: string
  filter_id?: RouteFilter
  requests: number
  avg_duration_seconds: number
  avg_fare: number
  success_rate_percent: number
}

export interface UnresolvedReason {
  unresolved_reason: string
  count: number
}

export interface TopUnresolvedQuery {
  input_text: string
  error_code: string
  count: number
}

export interface UnresolvedAnalytics {
  unresolved_reasons: UnresolvedReason[]
  long_walk_count: number
  top_unresolved_queries: TopUnresolvedQuery[]
}

export interface UserAnalyticsTotals {
  total_users: number
  active_users: number
  inactive_users: number
  admin_users: number
  users_with_routes: number
  avg_routes_per_user: number
}

export interface TopUserByRoutes {
  user__email: string
  user__first_name: string
  route_count: number
  success_count: number
}

export interface UserAnalyticsOverview {
  totals: UserAnalyticsTotals
  growth: DailyPoint[]
  top_users_by_routes: TopUserByRoutes[]
}

export interface Feedback {
  id: number
  user_id: number
  user_email: string
  request_id: string
  rating: number
  comment: string
  created_at: string
}

export interface FeedbackList {
  feedback: Feedback[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

export interface RatingDistribution {
  [key: string]: number
}

export interface FeedbackSummary {
  total_feedback: number
  average_rating: number
  rating_distribution: RatingDistribution
}

export interface SystemHealth {
  status: 'healthy' | 'degraded'
  checks: {
    database: 'healthy' | 'unhealthy'
    ai_service: 'healthy' | 'unhealthy'
    routing_engine: 'healthy' | 'unhealthy'
  }
}
