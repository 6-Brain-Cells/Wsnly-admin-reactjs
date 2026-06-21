import {
  BarChart3,
  LayoutDashboard,
  LineChart,
  LogOut,
  MessageSquare,
  Shield,
  User,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useAuthStore } from '@/features/auth/store'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.users, label: 'Users', icon: Users },
  { to: ROUTES.routeAnalytics, label: 'Route Analytics', icon: BarChart3 },
  { to: ROUTES.userAnalytics, label: 'User Analytics', icon: UserCog },
  { to: ROUTES.feedbackAnalytics, label: 'Feedback', icon: MessageSquare },
  { to: ROUTES.queryBuilder, label: 'Query Builder', icon: LineChart },
  { to: ROUTES.systemHealth, label: 'System Health', icon: Shield },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const clear = useAuthStore((s) => s.clear)

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
          <Wrench className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-none">Wslny</span>
          <span className="text-xs text-muted-foreground">Admin Console</span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            end={item.to === ROUTES.dashboard}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <NavLink
          to={ROUTES.profile}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
            )
          }
        >
          <User className="h-4 w-4" />
          <span className="truncate">Profile</span>
        </NavLink>
        <button
          onClick={clear}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )
}
