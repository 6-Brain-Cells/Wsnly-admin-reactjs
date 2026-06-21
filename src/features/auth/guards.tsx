import { Navigate, useLocation } from 'react-router-dom'

import { useAuthStore } from './store'
import { ROUTES } from '@/constants/routes'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />
  }
  return <>{children}</>
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const isAdmin = useAuthStore((s) => s.isAdmin())
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />
  }
  if (!isAdmin) {
    return <Navigate to={ROUTES.login} replace />
  }
  return <>{children}</>
}
