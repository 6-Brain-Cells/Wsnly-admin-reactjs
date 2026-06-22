import { Clock, MapPin, Star, Users } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  ChartCard,
  DailyLineChart,
  DonutChart,
} from '@/components/charts/charts'
import { KPICard } from '@/components/charts/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/page-header'
import {
  useFeedbackSummary,
  useRouteOverview,
  useUserOverview,
} from '@/features/analytics/hooks'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useSetLayoutTitle } from '@/lib/layout-context'
import { ROUTES } from '@/constants/routes'
import {
  formatCompact,
  formatDistance,
  formatDuration,
  formatNumber,
  formatPercent,
} from '@/lib/format'

export default function DashboardPage() {
  const navigate = useNavigate()
  const overview = useRouteOverview()
  const userOverview = useUserOverview()
  const feedbackSummary = useFeedbackSummary()
  useDocumentTitle('Dashboard')
  useSetLayoutTitle('Dashboard')

  const kpis = useMemo(() => {
    const totals = overview.data?.totals
    const avgs = overview.data?.averages
    return [
      {
        title: 'Total Users',
        value: userOverview.data
          ? formatCompact(userOverview.data.totals.total_users)
          : '—',
        icon: Users,
        tone: 'primary' as const,
        loading: userOverview.isLoading,
      },
      {
        title: 'Route Requests',
        value: totals ? formatCompact(totals.requests) : '—',
        icon: MapPin,
        tone: 'default' as const,
        description: totals
          ? `${formatPercent(totals.success_rate_percent)} success`
          : undefined,
        loading: overview.isLoading,
      },
      {
        title: 'Avg Duration',
        value: avgs ? formatDuration(avgs.duration_seconds) : '—',
        icon: Clock,
        tone: 'default' as const,
        description: avgs
          ? `${formatDistance(avgs.distance_meters)} avg`
          : undefined,
        loading: overview.isLoading,
      },
      {
        title: 'Avg Rating',
        value: feedbackSummary.data
          ? feedbackSummary.data.average_rating.toFixed(2)
          : '—',
        icon: Star,
        tone: 'warning' as const,
        description: feedbackSummary.data
          ? `${formatNumber(feedbackSummary.data.total_feedback)} reviews`
          : undefined,
        loading: feedbackSummary.isLoading,
      },
    ]
  }, [
    overview.data,
    overview.isLoading,
    userOverview.data,
    userOverview.isLoading,
    feedbackSummary.data,
    feedbackSummary.isLoading,
  ])

  const sourceData = useMemo(() => {
    const breakdown = overview.data?.source_breakdown
    if (!breakdown) return []
    return [
      { name: 'Text', value: breakdown.text },
      { name: 'Map', value: breakdown.map },
    ]
  }, [overview.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A live snapshot of platform health, usage, and user satisfaction."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Daily route requests"
          description="Last 30 days of routing activity"
          loading={overview.isLoading}
          empty={!overview.data?.daily_usage?.length}
          className="lg:col-span-2"
        >
          {overview.data && <DailyLineChart data={overview.data.daily_usage} />}
        </ChartCard>

        <ChartCard
          title="Request source"
          description="Text vs. map mode"
          loading={overview.isLoading}
          empty={!sourceData.length}
        >
          {sourceData.length > 0 && <DonutChart data={sourceData} />}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          className="cursor-pointer transition-shadow hover:shadow-elevated"
          onClick={() => navigate(ROUTES.userAnalytics)}
        >
          <CardHeader>
            <CardTitle className="text-base">User growth</CardTitle>
          </CardHeader>
          <CardContent>
            {userOverview.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {formatNumber(userOverview.data?.totals.total_users ?? 0)}
                  </span>
                  <span className="text-xs text-muted-foreground">total</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Active</p>
                    <p className="font-semibold text-success">
                      {formatNumber(
                        userOverview.data?.totals.active_users ?? 0,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Admins</p>
                    <p className="font-semibold">
                      {formatNumber(
                        userOverview.data?.totals.admin_users ?? 0,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-elevated"
          onClick={() => navigate(ROUTES.feedbackAnalytics)}
        >
          <CardHeader>
            <CardTitle className="text-base">Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {feedbackSummary.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-warning text-warning" />
                  <span className="text-3xl font-bold">
                    {feedbackSummary.data?.average_rating.toFixed(2) ?? '—'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    / 5.0
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(feedbackSummary.data?.total_feedback ?? 0)}{' '}
                  ratings
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-elevated"
          onClick={() => navigate(ROUTES.routeAnalytics)}
        >
          <CardHeader>
            <CardTitle className="text-base">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {overview.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success rate</span>
                  <span className="font-semibold text-success">
                    {formatPercent(
                      overview.data?.totals.success_rate_percent ?? 0,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AI latency</span>
                  <span className="font-semibold">
                    {Math.round(overview.data?.averages.ai_latency_ms ?? 0)} ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Routing</span>
                  <span className="font-semibold">
                    {Math.round(
                      overview.data?.averages.routing_latency_ms ?? 0,
                    )}{' '}
                    ms
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
