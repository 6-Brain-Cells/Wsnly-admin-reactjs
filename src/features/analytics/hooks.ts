import { useQuery } from '@tanstack/react-query'

import {
  analyticsApi,
  feedbackApi,
  type AnalyticsQueryParams,
  type FeedbackQuery,
  type RouteAnalyticsQuery,
} from './api'

export const analyticsKeys = {
  routeOverview: (params: RouteAnalyticsQuery) =>
    ['analytics', 'routes', 'overview', params] as const,
  topRoutes: (limit: number) =>
    ['analytics', 'routes', 'top-routes', limit] as const,
  filterStats: (params: RouteAnalyticsQuery) =>
    ['analytics', 'routes', 'filters', params] as const,
  unresolved: (params: RouteAnalyticsQuery) =>
    ['analytics', 'routes', 'unresolved', params] as const,
  query: (params: AnalyticsQueryParams) =>
    ['analytics', 'routes', 'query', params] as const,
  userOverview: ['analytics', 'users', 'overview'] as const,

  feedback: (params: FeedbackQuery) =>
    ['analytics', 'feedback', params] as const,
  feedbackSummary: ['analytics', 'feedback', 'summary'] as const,
}

export function useRouteOverview(params: RouteAnalyticsQuery = {}) {
  return useQuery({
    queryKey: analyticsKeys.routeOverview(params),
    queryFn: () => analyticsApi.routeOverview(params),
  })
}

export function useTopRoutes(limit = 10) {
  return useQuery({
    queryKey: analyticsKeys.topRoutes(limit),
    queryFn: () => analyticsApi.topRoutes(limit),
  })
}

export function useFilterStats(params: RouteAnalyticsQuery = {}) {
  return useQuery({
    queryKey: analyticsKeys.filterStats(params),
    queryFn: () => analyticsApi.filterStatsAll(params),
  })
}

export function useUnresolved(params: RouteAnalyticsQuery = {}) {
  return useQuery({
    queryKey: analyticsKeys.unresolved(params),
    queryFn: () => analyticsApi.unresolved(params),
  })
}

export function useAnalyticsQuery(
  params: AnalyticsQueryParams,
  enabled = true,
) {
  return useQuery({
    queryKey: analyticsKeys.query(params),
    queryFn: () => analyticsApi.query(params),
    enabled,
  })
}

export function useUserOverview() {
  return useQuery({
    queryKey: analyticsKeys.userOverview,
    queryFn: analyticsApi.userOverview,
  })
}

export function useFeedback(params: FeedbackQuery = {}) {
  return useQuery({
    queryKey: analyticsKeys.feedback(params),
    queryFn: () => feedbackApi.list(params),
  })
}

export function useFeedbackSummary() {
  return useQuery({
    queryKey: analyticsKeys.feedbackSummary,
    queryFn: feedbackApi.summary,
  })
}
