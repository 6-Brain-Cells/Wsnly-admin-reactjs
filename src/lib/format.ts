import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatDate(input: string | Date, pattern = 'MMM d, yyyy') {
  const date = typeof input === 'string' ? parseISO(input) : input
  return format(date, pattern)
}

export function formatDateTime(input: string | Date) {
  return formatDate(input, 'MMM d, yyyy · HH:mm')
}

export function formatRelative(input: string | Date) {
  const date = typeof input === 'string' ? parseISO(input) : input
  return formatDistanceToNow(date, { addSuffix: true })
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat('en-US', options).format(value)
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`
}

export function formatDuration(seconds: number) {
  if (!seconds || seconds < 0) return '—'
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  if (minutes < 60) return secs > 0 ? `${minutes}m ${secs}s` : `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function formatDistance(meters: number) {
  if (!meters) return '—'
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export function formatFare(egp: number) {
  if (egp == null) return '—'
  return `${egp.toFixed(0)} EGP`
}

export function initialsFromName(first?: string, last?: string) {
  const a = (first?.[0] ?? '').toUpperCase()
  const b = (last?.[0] ?? '').toUpperCase()
  return (a + b) || '?'
}
