import { Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { KPICard } from '@/components/charts/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Pagination } from '@/components/shared/pagination'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { useFeedback, useFeedbackSummary } from './hooks'
import { MessageSquare } from 'lucide-react'
import { formatDateTime, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

function RatingStars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i < value
              ? 'fill-warning text-warning'
              : 'fill-muted text-muted-foreground/30',
          )}
        />
      ))}
    </div>
  )
}

function SummaryTab() {
  const summary = useFeedbackSummary()

  const distribution = useMemo(() => {
    const d = summary.data?.rating_distribution ?? {}
    const total = summary.data?.total_feedback ?? 0
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = Number(d[String(stars)] ?? 0)
      return {
        stars,
        count,
        percent: total > 0 ? (count / total) * 100 : 0,
      }
    })
  }, [summary.data])

  return (
    <div className="space-y-4">
      {summary.isError ? (
        <ErrorState
          message={(summary.error as Error).message}
          onRetry={() => summary.refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KPICard
              title="Total feedback"
              value={formatNumber(summary.data?.total_feedback ?? 0)}
              icon={MessageSquare}
              tone="primary"
              loading={summary.isLoading}
            />
            <KPICard
              title="Average rating"
              value={summary.data?.average_rating.toFixed(2) ?? '—'}
              icon={Star}
              tone="warning"
              loading={summary.isLoading}
            />
            <KPICard
              title="5-star reviews"
              value={formatNumber(
                Number(summary.data?.rating_distribution?.['5'] ?? 0),
              )}
              icon={Star}
              tone="success"
              loading={summary.isLoading}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rating distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {summary.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {distribution.map((row) => (
                    <div
                      key={row.stars}
                      className="flex items-center gap-3 sm:gap-4"
                    >
                      <div className="flex w-20 items-center gap-1.5 sm:w-24">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <span className="text-sm font-medium tabular-nums">
                          {row.stars}
                        </span>
                      </div>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${row.percent}%` }}
                        />
                      </div>
                      <div className="flex w-24 items-center justify-end gap-2 text-sm tabular-nums">
                        <span className="font-semibold">{row.count}</span>
                        <span className="text-muted-foreground">
                          ({row.percent.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function ListTab() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [minRating, setMinRating] = useState<string>('all')

  const feedback = useFeedback({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    min_rating: minRating === 'all' ? undefined : Number(minRating),
  })

  const items = feedback.data?.feedback ?? []
  const total = feedback.data?.pagination.total ?? 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium">
          {formatNumber(total)} reviews{' '}
          {minRating !== 'all' && (
            <span className="text-muted-foreground">
              · {minRating}+ stars
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Min rating:</span>
          <Select value={minRating} onValueChange={setMinRating}>
            <SelectTrigger className="h-9 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
              <SelectItem value="4">4+ stars</SelectItem>
              <SelectItem value="3">3+ stars</SelectItem>
              <SelectItem value="2">2+ stars</SelectItem>
              <SelectItem value="1">1+ stars</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        {feedback.isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : feedback.isError ? (
          <div className="p-6">
            <ErrorState
              message={(feedback.error as Error).message}
              onRetry={() => feedback.refetch()}
            />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No feedback yet"
            description="There are no reviews matching the current filters."
          />
        ) : (
          <>
            <div className="divide-y divide-border">
              {items.map((f) => (
                <div key={f.id} className="p-4 sm:p-5">
                  <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {f.user_email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{f.user_email}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(f.created_at)}
                        </p>
                      </div>
                    </div>
                    <RatingStars value={f.rating} />
                  </div>
                  {f.comment && (
                    <p className="mt-3 text-sm text-foreground/90">
                      “{f.comment}”
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-border">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={(s) => {
                  setPageSize(s)
                  setPage(1)
                }}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export default function FeedbackAnalyticsPage() {
  useEffect(() => {
    document.title = 'Feedback · Wslny Admin'
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Feedback
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What users are saying about their routing experience.
        </p>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="list">All reviews</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="summary">
          <SummaryTab />
        </TabsContent>
        <TabsContent value="list">
          <ListTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
