import { Loader2, PlayCircle, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ErrorState } from '@/components/shared/error-state'
import { EmptyState } from '@/components/shared/empty-state'
import { useAnalyticsQuery } from './hooks'
import type { AnalyticsQueryParams } from './api'
import { formatNumber } from '@/lib/format'
import { Wand2 } from 'lucide-react'

const METRIC_OPTIONS = [
  { value: 'requests', label: 'Requests' },
  { value: 'success_count', label: 'Success count' },
  { value: 'failed_count', label: 'Failed count' },
  { value: 'success_rate_percent', label: 'Success rate (%)' },
  { value: 'avg_total_latency_ms', label: 'Avg total latency (ms)' },
  { value: 'avg_ai_latency_ms', label: 'Avg AI latency (ms)' },
  { value: 'avg_routing_latency_ms', label: 'Avg routing latency (ms)' },
  { value: 'avg_duration_seconds', label: 'Avg duration (s)' },
  { value: 'avg_distance_meters', label: 'Avg distance (m)' },
  { value: 'avg_fare', label: 'Avg fare (EGP)' },
  { value: 'avg_walk_distance_meters', label: 'Avg walk (m)' },
] as const

const GROUP_BY_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'source', label: 'Source (text/map)' },
  { value: 'status', label: 'Status (success/failed)' },
  { value: 'filter', label: 'Filter (1-6)' },
  { value: 'selected_route_type', label: 'Route type' },
] as const

const SORTABLE = [
  'day',
  'week',
  'source',
  'status',
  'filter',
  'selected_route_type',
  ...METRIC_OPTIONS.map((m) => m.value),
]

export default function QueryBuilderPage() {
  useEffect(() => {
    document.title = 'Query Builder · Wslny Admin'
  }, [])

  const [metrics, setMetrics] = useState<string[]>(['requests', 'success_rate_percent'])
  const [groupBy, setGroupBy] = useState<string[]>(['day'])
  const [sort, setSort] = useState('day')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [limit, setLimit] = useState(30)
  const [executed, setExecuted] = useState<AnalyticsQueryParams | null>({
    metrics: 'requests,success_rate_percent',
    group_by: 'day',
    sort: 'day',
    order: 'asc',
    limit: 30,
  })

  const toggleMetric = (m: string) => {
    setMetrics((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    )
  }
  const toggleGroup = (g: string) => {
    setGroupBy((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    )
  }

  const query = useAnalyticsQuery(executed ?? skipQuery(), Boolean(executed))

  const columns = useMemo(() => {
    if (!query.data) return []
    const first = query.data.rows[0]
    return first ? Object.keys(first) : []
  }, [query.data])

  const onRun = () => {
    if (!metrics.length) return
    setExecuted({
      metrics: metrics.join(','),
      group_by: groupBy.length ? groupBy.join(',') : undefined,
      sort,
      order,
      limit: Math.min(200, Math.max(1, limit)),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Query Builder
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compose composable analytics queries — pick metrics, group-by, and
          sort order.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wand2 className="h-4 w-4 text-primary" /> Compose query
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-semibold">Metrics</Label>
              <p className="mb-2 text-xs text-muted-foreground">
                Pick one or more aggregate metrics to compute.
              </p>
              <div className="flex flex-wrap gap-2">
                {METRIC_OPTIONS.map((m) => {
                  const active = metrics.includes(m.value)
                  return (
                    <button
                      key={m.value}
                      onClick={() => toggleMetric(m.value)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:bg-accent'
                      }`}
                    >
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Group by</Label>
              <p className="mb-2 text-xs text-muted-foreground">
                Optional. Select how to bucket the results.
              </p>
              <div className="flex flex-wrap gap-2">
                {GROUP_BY_OPTIONS.map((g) => {
                  const active = groupBy.includes(g.value)
                  return (
                    <button
                      key={g.value}
                      onClick={() => toggleGroup(g.value)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:bg-accent'
                      }`}
                    >
                      {g.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Sort by</Label>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORTABLE.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Select
                  value={order}
                  onValueChange={(v) => setOrder(v as 'asc' | 'desc')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit">Limit (1-200)</Label>
                <Input
                  id="limit"
                  type="number"
                  min={1}
                  max={200}
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Badge variant="muted" className="mr-auto">
                {metrics.length} metric{metrics.length !== 1 ? 's' : ''} ·{' '}
                {groupBy.length || 'no'} group
                {groupBy.length !== 1 ? 's' : ''}
              </Badge>
              <Button onClick={onRun} disabled={!metrics.length || query.isFetching}>
                {query.isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )}
                Run query
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> Request URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <code className="block break-all rounded-md bg-muted p-3 text-xs leading-relaxed">
              GET /api/v1/admin/analytics/routes/query
              {executed && '?'}
              {executed &&
                Object.entries(executed)
                  .filter(([, v]) => v !== undefined && v !== '')
                  .map(([k, v], i, arr) => (
                    <span key={k}>
                      {i === 0 ? '' : '&'}
                      {k}={String(v)}
                      {i < arr.length - 1 ? '' : ''}
                    </span>
                  ))}
            </code>
            <p className="mt-3 text-xs text-muted-foreground">
              The composable analytics endpoint accepts any combination of
              metrics and group-by fields.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Results</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!executed ? (
            <EmptyState
              icon={Wand2}
              title="Build a query above"
              description="Pick metrics, optional group-by, and click Run."
            />
          ) : query.isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          ) : query.isError ? (
            <div className="p-6">
              <ErrorState
                message={(query.error as Error).message}
                onRetry={() => query.refetch()}
              />
            </div>
          ) : !query.data?.rows?.length ? (
            <EmptyState title="No results" description="Try different parameters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    {columns.map((c) => (
                      <th key={c} className="px-6 py-3 font-medium">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {query.data.rows.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      {columns.map((c) => (
                        <td key={c} className="px-6 py-3 tabular-nums">
                          {formatCell(row[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatCell(value: unknown) {
  if (value == null) return '—'
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return formatNumber(value)
    return value.toFixed(2)
  }
  return String(value)
}

function skipQuery(): AnalyticsQueryParams {
  return { metrics: '', limit: 0 }
}
