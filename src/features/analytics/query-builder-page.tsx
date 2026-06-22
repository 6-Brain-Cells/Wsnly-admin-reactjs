import { Clipboard, Loader2, PlayCircle, RotateCcw, Sparkles, Wand2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

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
import { PageHeader } from '@/components/shared/page-header'
import { useAnalyticsQuery } from './hooks'
import type { AnalyticsQueryParams } from './api'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useSetLayoutTitle } from '@/lib/layout-context'
import { formatNumber } from '@/lib/format'

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

const EXAMPLE_PRESETS: {
  label: string
  description: string
  params: AnalyticsQueryParams
}[] = [
  {
    label: 'Daily success rate',
    description: 'Success rate per day, last 30 rows',
    params: {
      metrics: 'requests,success_rate_percent,avg_total_latency_ms',
      group_by: 'day',
      sort: 'day',
      order: 'desc',
      limit: 30,
    },
  },
  {
    label: 'By source (text vs map)',
    description: 'Compare text-flow vs map-pin requests',
    params: {
      metrics: 'requests,success_rate_percent,avg_ai_latency_ms',
      group_by: 'source',
      sort: 'requests',
      order: 'desc',
      limit: 10,
    },
  },
  {
    label: 'Per-route-filter performance',
    description: 'optimal vs fastest vs cheapest, etc.',
    params: {
      metrics: 'requests,avg_duration_seconds,avg_fare,success_rate_percent',
      group_by: 'filter',
      sort: 'requests',
      order: 'desc',
      limit: 10,
    },
  },
  {
    label: 'Latency breakdown by status',
    description: 'How slow are failures vs successes?',
    params: {
      metrics: 'avg_total_latency_ms,avg_ai_latency_ms,avg_routing_latency_ms,requests',
      group_by: 'status',
      sort: 'avg_total_latency_ms',
      order: 'desc',
      limit: 10,
    },
  },
]

const DEFAULT_PARAMS: AnalyticsQueryParams = {
  metrics: 'requests,success_rate_percent',
  group_by: 'day',
  sort: 'day',
  order: 'desc',
  limit: 30,
}

function humaniseColumn(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatCell(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return formatNumber(value)
    return value.toFixed(2)
  }
  return String(value)
}

function buildRequestUrl(params: AnalyticsQueryParams | null): string {
  if (!params) return 'GET /api/v1/admin/analytics/routes/query'
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== '' && v !== null,
  )
  if (entries.length === 0) return 'GET /api/v1/admin/analytics/routes/query'
  const qs = entries
    .map(([k, v], i) => `${i === 0 ? '?' : '&'}${k}=${encodeURIComponent(String(v))}`)
    .join('')
  return `GET /api/v1/admin/analytics/routes/query${qs}`
}

export default function QueryBuilderPage() {
  useDocumentTitle('Query Builder')
  useSetLayoutTitle('Query Builder')

  const [metrics, setMetrics] = useState<string[]>(
    () => (DEFAULT_PARAMS.metrics ?? '').split(',').filter(Boolean),
  )
  const [groupBy, setGroupBy] = useState<string[]>(
    () => (DEFAULT_PARAMS.group_by ?? '').split(',').filter(Boolean),
  )
  const [sort, setSort] = useState<string>(DEFAULT_PARAMS.sort ?? 'day')
  const [order, setOrder] = useState<'asc' | 'desc'>(
    (DEFAULT_PARAMS.order as 'asc' | 'desc') ?? 'desc',
  )
  const [limit, setLimit] = useState<number>(DEFAULT_PARAMS.limit ?? 30)
  const [executed, setExecuted] = useState<AnalyticsQueryParams | null>(
    DEFAULT_PARAMS,
  )

  const toggle = (
    list: string[],
    setter: (next: string[]) => void,
    value: string,
  ) => {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  const query = useAnalyticsQuery(
    executed ?? { metrics: '', limit: 0 },
    executed !== null,
  )

  const columns = useMemo(() => {
    if (!query.data?.rows?.length) return []
    return Object.keys(query.data.rows[0]!)
  }, [query.data])

  const metricLabels = useMemo(
    () =>
      new Map(METRIC_OPTIONS.map((m) => [m.value, m.label])),
    [],
  )
  const groupLabels = useMemo(
    () => new Map(GROUP_BY_OPTIONS.map((g) => [g.value, g.label])),
    [],
  )

  const onRun = () => {
    if (!metrics.length) return
    const safeLimit = Math.min(200, Math.max(1, Number.isFinite(limit) ? limit : 30))
    setExecuted({
      metrics: metrics.join(','),
      group_by: groupBy.length ? groupBy.join(',') : undefined,
      sort,
      order,
      limit: safeLimit,
    })
  }

  const onReset = () => {
    setMetrics([])
    setGroupBy([])
    setSort('day')
    setOrder('desc')
    setLimit(30)
    setExecuted(null)
  }

  const applyPreset = (params: AnalyticsQueryParams) => {
    setMetrics((params.metrics ?? '').split(',').filter(Boolean))
    setGroupBy((params.group_by ?? '').split(',').filter(Boolean))
    setSort(params.sort ?? 'day')
    setOrder((params.order as 'asc' | 'desc') ?? 'desc')
    setLimit(params.limit ?? 30)
    setExecuted(params)
  }

  const copyRequestUrl = async () => {
    if (!executed) return
    const base = window.location.origin.replace(/\/$/, '')
    const url = `${base}${buildRequestUrl(executed).replace('GET ', '')}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Request URL copied to clipboard')
    } catch {
      toast.error('Could not copy — check clipboard permissions')
    }
  }

  const canRun = metrics.length > 0 && !query.isFetching

  return (
    <div className="space-y-6">
      <PageHeader
        title="Query Builder"
        description="Compose composable analytics queries — pick metrics, group-by, sort order, and limit."
        action={
          executed ? (
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          ) : null
        }
      />

      {!executed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> Try a preset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {EXAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset.params)}
                  className="group rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{preset.label}</p>
                    <Wand2 className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wand2 className="h-4 w-4 text-primary" /> Compose query
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <PillPicker
              label="Metrics"
              hint="Pick one or more aggregate metrics to compute."
              options={METRIC_OPTIONS}
              selected={metrics}
              labels={metricLabels}
              onToggle={(v) => toggle(metrics, setMetrics, v)}
            />

            <PillPicker
              label="Group by"
              hint="Optional. Select how to bucket the results."
              options={GROUP_BY_OPTIONS}
              selected={groupBy}
              labels={groupLabels}
              onToggle={(v) => toggle(groupBy, setGroupBy, v)}
            />

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
                        {humaniseColumn(s)}
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
              <Button onClick={onRun} disabled={!canRun}>
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
          <CardContent className="space-y-3">
            <code className="block max-h-32 overflow-auto break-all rounded-md bg-muted p-3 font-mono text-xs leading-relaxed">
              {buildRequestUrl(executed)}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={copyRequestUrl}
              disabled={!executed}
            >
              <Clipboard className="h-4 w-4" /> Copy full URL
            </Button>
            <p className="text-xs text-muted-foreground">
              The composable analytics endpoint accepts any combination of
              metrics and group-by fields. Backend caps <code>limit</code> at 200.
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
              description="Pick metrics, optional group-by, and click Run — or start from a preset."
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
            <EmptyState
              title="No results"
              description="The query ran but the database returned 0 rows. Try widening the date range or removing some filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    {columns.map((c) => (
                      <th key={c} className="px-6 py-3 font-medium">
                        {humaniseColumn(c)}
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

interface PillPickerProps<T extends string> {
  label: string
  hint?: string
  options: ReadonlyArray<{ value: T; label: string }>
  selected: string[]
  labels: Map<string, string>
  onToggle: (value: T) => void
}

function PillPicker<T extends string>({
  label,
  hint,
  options,
  selected,
  labels,
  onToggle,
}: PillPickerProps<T>) {
  return (
    <div>
      <Label className="text-sm font-semibold">{label}</Label>
      {hint && <p className="mb-2 text-xs text-muted-foreground">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = selected.includes(o.value)
          return (
            <button
              key={o.value}
              onClick={() => onToggle(o.value)}
              aria-pressed={active}
              title={labels.get(o.value) ?? o.label}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:bg-accent'
              }`}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
