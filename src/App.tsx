import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import LoginPage from '@/features/auth/login-page'
import { RequireAuth, RequireAdmin } from '@/features/auth/guards'
import ProfilePage from '@/features/auth/profile-page'
import RouteAnalyticsPage from '@/features/analytics/route-analytics-page'
import UserAnalyticsPage from '@/features/analytics/user-analytics-page'
import FeedbackAnalyticsPage from '@/features/analytics/feedback-analytics-page'
import QueryBuilderPage from '@/features/analytics/query-builder-page'
import UsersListPage from '@/features/users/users-list-page'
import UserDetailPage from '@/features/users/user-detail-page'
import SystemHealthPage from '@/features/system/system-health-page'
import { AdminLayout } from '@/components/layout/admin-layout'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import DashboardPage from '@/pages/dashboard'
import NotFound from '@/pages/not-found'
import { queryClient } from '@/lib/api/query-client'
import { LayoutProvider } from '@/lib/layout-context'
import { ROUTES } from '@/constants/routes'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={150}>
          <BrowserRouter>
            <LayoutProvider>
              <Routes>
                <Route path={ROUTES.login} element={<LoginPage />} />

                <Route
                  element={
                    <RequireAuth>
                      <RequireAdmin>
                        <AdminLayout />
                      </RequireAdmin>
                    </RequireAuth>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path={ROUTES.users} element={<UsersListPage />} />
                  <Route path="/users/:id" element={<UserDetailPage />} />
                  <Route
                    path={ROUTES.routeAnalytics}
                    element={<RouteAnalyticsPage />}
                  />
                  <Route
                    path={ROUTES.userAnalytics}
                    element={<UserAnalyticsPage />}
                  />
                  <Route
                    path={ROUTES.feedbackAnalytics}
                    element={<FeedbackAnalyticsPage />}
                  />
                  <Route
                    path={ROUTES.queryBuilder}
                    element={<QueryBuilderPage />}
                  />
                  <Route
                    path={ROUTES.systemHealth}
                    element={<SystemHealthPage />}
                  />
                  <Route path={ROUTES.profile} element={<ProfilePage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </LayoutProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: 8,
                  fontSize: 14,
                  padding: '12px 16px',
                },
                success: {
                  iconTheme: { primary: '#388E3C', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#D32F2F', secondary: '#fff' },
                },
              }}
            />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
