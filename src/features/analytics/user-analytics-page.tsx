import { UserCheck, UserCog, UserMinus, UserPlus, Users } from 'lucide-react'

import { ChartCard, DailyLineChart } from '@/components/charts/charts'
import { KPICard } from '@/components/charts/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ErrorState } from '@/components/shared/error-state'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { useUserOverview } from './hooks'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useSetLayoutTitle } from '@/lib/layout-context'
import { formatNumber } from '@/lib/format'

export default function UserAnalyticsPage() {
  const overview = useUserOverview()

  useDocumentTitle('User Analytics')
  useSetLayoutTitle('User Analytics')

  const totals = overview.data?.totals
  const kpis = [
    {
      title: 'Total users',
      value: totals ? formatNumber(totals.total_users) : '—',
      icon: Users,
      tone: 'primary' as const,
      loading: overview.isLoading,
    },
    {
      title: 'Active',
      value: totals ? formatNumber(totals.active_users) : '—',
      icon: UserCheck,
      tone: 'success' as const,
      loading: overview.isLoading,
    },
    {
      title: 'Inactive',
      value: totals ? formatNumber(totals.inactive_users) : '—',
      icon: UserMinus,
      tone: 'destructive' as const,
      loading: overview.isLoading,
    },
    {
      title: 'Admins',
      value: totals ? formatNumber(totals.admin_users) : '—',
      icon: UserPlus,
      loading: overview.isLoading,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Analytics"
        description="Track registration growth, engagement, and your most active users."
      />

      {overview.isError ? (
        <ErrorState
          message={(overview.error as Error).message}
          onRetry={() => overview.refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <KPICard key={k.title} {...k} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard
              title="Daily registrations"
              description="New users per day"
              loading={overview.isLoading}
              empty={!overview.data?.growth?.length}
              className="lg:col-span-2"
            >
              {overview.data && <DailyLineChart data={overview.data.growth} />}
            </ChartCard>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                {overview.isLoading ? (
                  <Skeleton className="h-32" />
                ) : (
                  <div className="space-y-3">
                    <Stat
                      label="Users with routes"
                      value={formatNumber(totals?.users_with_routes ?? 0)}
                    />
                    <Stat
                      label="Avg routes / user"
                      value={(totals?.avg_routes_per_user ?? 0).toFixed(1)}
                    />
                    <Stat
                      label="Activation rate"
                      value={
                        totals
                          ? `${Math.round(
                              (totals.users_with_routes /
                                Math.max(totals.total_users, 1)) *
                                100,
                            )}%`
                          : '—'
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">Top users by routes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {overview.isLoading ? (
                  <div className="space-y-2 p-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : !overview.data?.top_users_by_routes?.length ? (
                  <EmptyState
                    icon={UserCog}
                    title="No data"
                    description="No route activity recorded yet."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="px-6 py-3 font-medium">#</th>
                          <th className="px-6 py-3 font-medium">User</th>
                          <th className="px-6 py-3 font-medium">Email</th>
                          <th className="px-6 py-3 font-medium">Routes</th>
                          <th className="px-6 py-3 font-medium">Success</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {overview.data?.top_users_by_routes?.map((u, i) => (
                          <tr key={`${u.user__email}-${i}`}>
                            <td className="px-6 py-3 text-muted-foreground">
                              {i + 1}
                            </td>
                            <td className="px-6 py-3 font-medium">
                              {u.user__first_name}
                            </td>
                            <td className="px-6 py-3 text-muted-foreground">
                              {u.user__email}
                            </td>
                            <td className="px-6 py-3">
                              <Badge variant="default">{u.route_count}</Badge>
                            </td>
                            <td className="px-6 py-3 text-muted-foreground">
                              {u.success_count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  )
}
