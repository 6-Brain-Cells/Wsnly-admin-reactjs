import {
  Activity,
  AlertCircle,
  Filter,
  ListOrdered,
  MapPin,
  Route as RouteIcon,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  CategoryBarChart,
  ChartCard,
  DailyLineChart,
  DonutChart,
  HorizontalBarChart,
} from '@/components/charts/charts'
import { KPICard } from '@/components/charts/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/error-state'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import {
  useFilterStats,
  useRouteOverview,
  useTopRoutes,
  useUnresolved,
} from '@/features/analytics/hooks'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useSetLayoutTitle } from '@/lib/layout-context'
import { ROUTE_FILTER_LABELS, type RouteFilter } from '@/constants/enums'
import {
  formatCompact,
  formatDistance,
  formatDuration,
  formatNumber,
  formatPercent,
} from '@/lib/format'

type DateRange = { from?: string; to?: string }

function DateFilters({
  value,
  onChange,
}: {
  value: DateRange
  onChange: (v: DateRange) => void
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="from" className="text-xs">
          From
        </Label>
        <Input
          id="from"
          type="date"
          value={value.from ?? ''}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className="h-9 w-40"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="to" className="text-xs">
          To
        </Label>
        <Input
          id="to"
          type="date"
          value={value.to ?? ''}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className="h-9 w-40"
        />
      </div>
      {(value.from || value.to) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({})}
          className="h-9"
        >
          Clear
        </Button>
      )}
    </div>
  )
}

function OverviewTab() {
  const [range, setRange] = useState<DateRange>({})
  const [source, setSource] = useState<string>('all')
  const overview = useRouteOverview({
    from_date: range.from,
    to_date: range.to,
    source:
      source === 'all' ? undefined : (source as 'text' | 'map'),
  })

  const kpis = useMemo(() => {
    const t = overview.data?.totals
    const a = overview.data?.averages
    return [
      {
        title: 'Total requests',
        value: t ? formatCompact(t.requests) : '—',
        icon: RouteIcon,
        tone: 'primary' as const,
        loading: overview.isLoading,
      },
      {
        title: 'Success rate',
        value: t ? formatPercent(t.success_rate_percent) : '—',
        icon: TrendingUp,
        tone: 'success' as const,
        loading: overview.isLoading,
      },
      {
        title: 'Failed',
        value: t ? formatNumber(t.failed) : '—',
        icon: XCircle,
        tone: 'destructive' as const,
        loading: overview.isLoading,
      },
      {
        title: 'Avg latency',
        value: a ? `${Math.round(a.total_latency_ms)} ms` : '—',
        icon: Activity,
        loading: overview.isLoading,
      },
    ]
  }, [overview.data, overview.isLoading])

  const sourceData = useMemo(() => {
    const b = overview.data?.source_breakdown
    if (!b) return []
    return [
      { name: 'Text', value: b.text },
      { name: 'Map', value: b.map },
    ]
  }, [overview.data])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
        <DateFilters value={range} onChange={setRange} />
        <div className="space-y-1">
          <Label className="text-xs">Source</Label>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="map">Map</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
              title="Daily usage"
              description="Requests per day"
              loading={overview.isLoading}
              empty={!overview.data?.daily_usage?.length}
              className="lg:col-span-2"
            >
              {overview.data && (
                <DailyLineChart data={overview.data.daily_usage} />
              )}
            </ChartCard>

            <ChartCard
              title="Request source"
              description="Text vs. map"
              loading={overview.isLoading}
              empty={!sourceData.length}
            >
              {sourceData.length > 0 && <DonutChart data={sourceData} />}
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Latency breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {overview.isLoading ? (
                  <Skeleton className="h-32" />
                ) : (
                  <div className="space-y-4">
                    <LatencyRow
                      label="AI service"
                      value={overview.data?.averages.ai_latency_ms ?? 0}
                      color="bg-primary"
                    />
                    <LatencyRow
                      label="Routing engine"
                      value={overview.data?.averages.routing_latency_ms ?? 0}
                      color="bg-primary-dark"
                    />
                    <LatencyRow
                      label="Total"
                      value={overview.data?.averages.total_latency_ms ?? 0}
                      color="bg-brand-700"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Average trip</CardTitle>
              </CardHeader>
              <CardContent>
                {overview.isLoading ? (
                  <Skeleton className="h-32" />
                ) : (
                  <div className="space-y-3">
                    <Stat
                      label="Duration"
                      value={formatDuration(
                        overview.data?.averages.duration_seconds ?? 0,
                      )}
                    />
                    <Stat
                      label="Distance"
                      value={formatDistance(
                        overview.data?.averages.distance_meters ?? 0,
                      )}
                    />
                    <Stat
                      label="Success / Failed"
                      value={`${formatNumber(
                        overview.data?.totals.success ?? 0,
                      )} / ${formatNumber(
                        overview.data?.totals.failed ?? 0,
                      )}`}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Health</CardTitle>
              </CardHeader>
              <CardContent>
                {overview.isLoading ? (
                  <Skeleton className="h-32" />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 py-4">
                    <div className="text-5xl font-bold text-primary">
                      {formatPercent(
                        overview.data?.totals.success_rate_percent ?? 0,
                        0,
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      success rate
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Badge variant="success">
                        ✓ {formatNumber(overview.data?.totals.success ?? 0)}
                      </Badge>
                      <Badge variant="destructive">
                        ✗ {formatNumber(overview.data?.totals.failed ?? 0)}
                      </Badge>
                    </div>
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

function LatencyRow({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  const max = 2000
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">
          {Math.round(value)} ms
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
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

function TopRoutesTab() {
  const top = useTopRoutes(15)

  const chartData = useMemo(
    () =>
      top.data?.top_routes?.map((r) => ({
        name: `${r.origin_name} → ${r.destination_name}`,
        value: r.requests,
      })) ?? [],
    [top.data],
  )

  return (
    <div className="space-y-4">
      {top.isError ? (
        <ErrorState
          message={(top.error as Error).message}
          onRetry={() => top.refetch()}
        />
      ) : (
        <>
          <ChartCard
            title="Top requested routes"
            description="Most popular origin → destination pairs"
            loading={top.isLoading}
            empty={!chartData.length}
            className="lg:col-span-3"
          >
            {chartData.length > 0 && <HorizontalBarChart data={chartData} />}
          </ChartCard>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {top.isLoading ? (
                <div className="space-y-2 p-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10" />
                  ))}
                </div>
              ) : !top.data?.top_routes?.length ? (
                <EmptyState icon={RouteIcon} title="No data" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3 font-medium">#</th>
                        <th className="px-6 py-3 font-medium">Origin</th>
                        <th className="px-6 py-3 font-medium">Destination</th>
                        <th className="px-6 py-3 font-medium">Requests</th>
                        <th className="px-6 py-3 font-medium">Avg time</th>
                        <th className="px-6 py-3 font-medium">Avg dist</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {top.data?.top_routes?.map((r, i) => (
                        <tr
                          key={`${r.origin_name}-${r.destination_name}-${i}`}
                        >
                          <td className="px-6 py-3 text-muted-foreground">
                            {i + 1}
                          </td>
                          <td className="px-6 py-3 font-medium">
                            {r.origin_name}
                          </td>
                          <td className="px-6 py-3 font-medium">
                            {r.destination_name}
                          </td>
                          <td className="px-6 py-3">
                            <Badge variant="default">{r.requests}</Badge>
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">
                            {formatDuration(r.avg_duration_seconds)}
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">
                            {formatDistance(r.avg_distance_meters)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function FiltersTab() {
  const filters = useFilterStats()

  const chartData = useMemo(
    () =>
      filters.data?.filters?.map((f) => ({
        name: f.name,
        value: f.requests,
      })) ?? [],
    [filters.data],
  )

  return (
    <div className="space-y-4">
      {filters.isError ? (
        <ErrorState
          message={(filters.error as Error).message}
          onRetry={() => filters.refetch()}
        />
      ) : (
        <>
          <ChartCard
            title="Filter usage"
            description="How often each routing preference is used"
            loading={filters.isLoading}
            empty={!chartData.length}
          >
            {chartData.length > 0 && <CategoryBarChart data={chartData} />}
          </ChartCard>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filters.isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))
              : filters.data?.filters?.map((f, i) => (
                  <Card key={`${f.name}-${i}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Filter
                          </p>
                          <p className="mt-1 text-lg font-bold">
                            {ROUTE_FILTER_LABELS[f.filter_id as RouteFilter] ??
                              f.name}
                          </p>
                        </div>
                        <Badge variant="muted">{f.name}</Badge>
                      </div>
                      <div className="mt-4 space-y-2 text-sm">
                        <Stat
                          label="Requests"
                          value={formatNumber(f.requests)}
                        />
                        <Stat
                          label="Success rate"
                          value={formatPercent(f.success_rate_percent)}
                        />
                        <Stat
                          label="Avg duration"
                          value={formatDuration(f.avg_duration_seconds)}
                        />
                        <Stat
                          label="Avg fare"
                          value={`${f.avg_fare.toFixed(1)} EGP`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </>
      )}
    </div>
  )
}

function UnresolvedTab() {
  const unresolved = useUnresolved()

  return (
    <div className="space-y-4">
      {unresolved.isError ? (
        <ErrorState
          message={(unresolved.error as Error).message}
          onRetry={() => unresolved.refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">
                Unresolved reasons
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unresolved.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10" />
                  ))}
                </div>
              ) : !unresolved.data?.unresolved_reasons?.length ? (
                <EmptyState
                  icon={AlertCircle}
                  title="No unresolved queries"
                  description="All routing requests were resolved successfully."
                />
              ) : (
                <div className="space-y-3">
                  {unresolved.data?.unresolved_reasons?.map((r, i) => (
                    <div
                      key={`${r.unresolved_reason}-${i}`}
                      className="flex items-center justify-between rounded-md border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-sm">
                          {r.unresolved_reason}
                        </span>
                      </div>
                      <Badge variant="destructive">{r.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Long walks</CardTitle>
            </CardHeader>
            <CardContent>
              {unresolved.isLoading ? (
                <Skeleton className="h-20" />
              ) : (
                <div className="text-center">
                  <p className="text-4xl font-bold text-warning">
                    {formatNumber(unresolved.data?.long_walk_count ?? 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    routes flagged with unusually long walking distance
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">
                Top failed queries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {unresolved.isLoading ? (
                <div className="space-y-2 p-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10" />
                  ))}
                </div>
              ) : !unresolved.data?.top_unresolved_queries?.length ? (
                <EmptyState
                  icon={MapPin}
                  title="No failed queries"
                  description="No queries have failed recently."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3 font-medium">Query</th>
                        <th className="px-6 py-3 font-medium">Error code</th>
                        <th className="px-6 py-3 font-medium">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {unresolved.data?.top_unresolved_queries?.map((q, i) => (
                        <tr key={i}>
                          <td className="px-6 py-3 font-medium">
                            {q.input_text || '—'}
                          </td>
                          <td className="px-6 py-3">
                            <code className="rounded bg-muted px-2 py-0.5 text-xs">
                              {q.error_code}
                            </code>
                          </td>
                          <td className="px-6 py-3">
                            <Badge variant="destructive">{q.count}</Badge>
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
      )}
    </div>
  )
}

export default function RouteAnalyticsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') ?? 'overview'

  useDocumentTitle('Route Analytics')
  useSetLayoutTitle('Route Analytics')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Route Analytics"
        description="Understand how the routing engine is performing across Greater Cairo."
      />

      <Tabs
        value={initialTab}
        onValueChange={(v) => setSearchParams({ tab: v })}
        className="space-y-4"
      >
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="top">
              <ListOrdered className="h-4 w-4" /> Top routes
            </TabsTrigger>
            <TabsTrigger value="filters">
              <Filter className="h-4 w-4" /> Filters
            </TabsTrigger>
            <TabsTrigger value="unresolved">
              <AlertCircle className="h-4 w-4" /> Unresolved
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="top" className="space-y-4">
          <TopRoutesTab />
        </TabsContent>
        <TabsContent value="filters" className="space-y-4">
          <FiltersTab />
        </TabsContent>
        <TabsContent value="unresolved" className="space-y-4">
          <UnresolvedTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
