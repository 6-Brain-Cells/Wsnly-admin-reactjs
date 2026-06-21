import { Activity, CheckCircle2, Cpu, Database, Loader2, RefreshCw, ShieldAlert, XCircle } from 'lucide-react'
import { useEffect } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/error-state'
import { useSystemHealth } from './hooks'
import { formatRelative } from '@/lib/format'
import { cn } from '@/lib/utils'

type Status = 'healthy' | 'unhealthy'

function StatusPill({ status, label, loading }: { status?: Status; label: string; loading?: boolean }) {
  const Icon = loading ? Loader2 : status === 'healthy' ? CheckCircle2 : XCircle
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5 sm:p-6">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full',
            loading
              ? 'bg-muted text-muted-foreground'
              : status === 'healthy'
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive',
          )}
        >
          <Icon className={cn('h-6 w-6', loading && 'animate-spin')} />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-1 h-6 w-20" />
          ) : (
            <p className="text-lg font-semibold">
              {status === 'healthy' ? 'Operational' : 'Down'}
            </p>
          )}
        </div>
        {!loading && (
          <Badge variant={status === 'healthy' ? 'success' : 'destructive'}>
            {status === 'healthy' ? 'OK' : 'FAIL'}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

export default function SystemHealthPage() {
  const health = useSystemHealth(30_000)

  useEffect(() => {
    document.title = 'System Health · Wslny Admin'
  }, [])

  const c = health.data?.checks
  const loading = health.isLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            System Health
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live status of every platform dependency. Auto-refreshes every 30s.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {health.dataUpdatedAt && (
            <span>
              Last checked {formatRelative(new Date(health.dataUpdatedAt))}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => health.refetch()}
            disabled={health.isFetching}
          >
            <RefreshCw
              className={cn('h-4 w-4', health.isFetching && 'animate-spin')}
            />
            Refresh
          </Button>
        </div>
      </div>

      {health.isError ? (
        <ErrorState
          title="Health endpoint unreachable"
          message={(health.error as Error).message}
          onRetry={() => health.refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatusPill status={c?.database} label="Database" loading={loading} />
            <StatusPill status={c?.ai_service} label="AI Service" loading={loading} />
            <StatusPill
              status={c?.routing_engine}
              label="Routing Engine"
              loading={loading}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" /> Overall status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-3 py-6 text-center sm:flex-row sm:text-left">
                <div
                  className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-full',
                    health.data?.status === 'healthy'
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive',
                  )}
                >
                  {health.data?.status === 'healthy' ? (
                    <CheckCircle2 className="h-8 w-8" />
                  ) : (
                    <ShieldAlert className="h-8 w-8" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {health.data?.status === 'healthy'
                      ? 'All systems operational'
                      : 'Degraded performance'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {health.data?.status === 'healthy'
                      ? 'The platform is responding normally across all services.'
                      : 'One or more services are unhealthy. Investigate immediately.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <Database className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-semibold">PostgreSQL</p>
                  <p className="text-xs text-muted-foreground">
                    User, history, feedback
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <Cpu className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-semibold">AI Service</p>
                  <p className="text-xs text-muted-foreground">
                    NLP extraction, geocoding
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-semibold">RoutingEngine</p>
                  <p className="text-xs text-muted-foreground">
                    A* pathfinding · gRPC :50051
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
