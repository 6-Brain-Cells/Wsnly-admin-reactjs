export const ROUTES = {
  login: '/login',
  dashboard: '/',
  users: '/users',
  userDetail: (id: number | string) => `/users/${id}`,
  routeAnalytics: '/analytics/routes',
  userAnalytics: '/analytics/users',
  feedbackAnalytics: '/analytics/feedback',
  queryBuilder: '/analytics/query',
  profile: '/profile',
  systemHealth: '/system',
} as const
