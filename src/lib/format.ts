import {
  format,
  formatDistanceToNow,
  isValid,
  parseISO,
} from 'date-fns'

const EMPTY = '—'

function safeDate(input: string | Date | null | undefined): Date | null {
  if (input == null || input === '') return null
  const d = typeof input === 'string' ? parseISO(input) : input
  return isValid(d) ? d : null
}

export function formatDate(
  input: string | Date | null | undefined,
  pattern = 'MMM d, yyyy',
): string {
  const date = safeDate(input)
  return date ? format(date, pattern) : EMPTY
}

export function formatDateTime(
  input: string | Date | null | undefined,
): string {
  const date = safeDate(input)
  return date ? format(date, 'MMM d, yyyy · HH:mm') : EMPTY
}

export function formatRelative(
  input: string | Date | null | undefined,
): string {
  const date = safeDate(input)
  return date ? formatDistanceToNow(date, { addSuffix: true }) : EMPTY
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
  if (!seconds || seconds < 0) return EMPTY
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  if (minutes < 60) return secs > 0 ? `${minutes}m ${secs}s` : `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function formatDistance(meters: number) {
  if (!meters) return EMPTY
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export function formatFare(egp: number) {
  if (egp == null) return EMPTY
  return `${egp.toFixed(0)} EGP`
}

export function initialsFromName(first?: string, last?: string) {
  const a = (first?.[0] ?? '').toUpperCase()
  const b = (last?.[0] ?? '').toUpperCase()
  return (a + b) || '?'
}

