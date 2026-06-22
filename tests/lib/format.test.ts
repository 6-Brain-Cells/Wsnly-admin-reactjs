import { describe, expect, it } from 'vitest'

import {
  formatCompact,
  formatDate,
  formatDateTime,
  formatDistance,
  formatDuration,
  formatFare,
  formatNumber,
  formatPercent,
  formatRelative,
  initialsFromName,
} from '@/lib/format'

describe('format utilities', () => {
  describe('formatDuration', () => {
    it('returns an em-dash for falsy or negative inputs', () => {
      expect(formatDuration(0)).toBe('—')
      expect(formatDuration(-5)).toBe('—')
      expect(formatDuration(Number.NaN)).toBe('—')
    })

    it('formats seconds under a minute', () => {
      expect(formatDuration(42)).toBe('42s')
    })

    it('formats minutes under an hour', () => {
      expect(formatDuration(125)).toBe('2m 5s')
      expect(formatDuration(120)).toBe('2 min')
    })

    it('formats hours and minutes', () => {
      expect(formatDuration(3600)).toBe('1h')
      expect(formatDuration(5400)).toBe('1h 30m')
    })
  })

  describe('formatDistance', () => {
    it('returns em-dash for zero', () => {
      expect(formatDistance(0)).toBe('—')
    })

    it('formats meters under a kilometre', () => {
      expect(formatDistance(250)).toBe('250 m')
    })

    it('formats kilometres with one decimal', () => {
      expect(formatDistance(1500)).toBe('1.5 km')
    })
  })

  describe('formatPercent', () => {
    it('rounds to the requested digits', () => {
      expect(formatPercent(12.345, 1)).toBe('12.3%')
      expect(formatPercent(12.345, 2)).toBe('12.35%')
      expect(formatPercent(0, 0)).toBe('0%')
    })
  })

  describe('formatNumber', () => {
    it('formats with thousands separators', () => {
      expect(formatNumber(1234)).toBe('1,234')
      expect(formatNumber(1_500_000)).toBe('1,500,000')
    })
  })

  describe('formatCompact', () => {
    it('uses Intl compact notation', () => {
      expect(formatCompact(1500)).toBe('1.5K')
      expect(formatCompact(2_500_000)).toBe('2.5M')
    })
  })

  describe('formatFare', () => {
    it('rounds to integer EGP', () => {
      expect(formatFare(25)).toBe('25 EGP')
      expect(formatFare(25.6)).toBe('26 EGP')
    })

    it('returns em-dash for nullish values', () => {
      expect(formatFare(null as unknown as number)).toBe('—')
      expect(formatFare(undefined as unknown as number)).toBe('—')
    })
  })

  describe('formatDate', () => {
    it('parses ISO strings', () => {
      expect(formatDate('2026-01-15')).toBe('Jan 15, 2026')
    })

    it('accepts a custom pattern', () => {
      expect(formatDate('2026-01-15T10:30:00Z', 'yyyy-MM-dd')).toBe('2026-01-15')
    })

    it('returns em-dash for null/undefined/empty/garbage (defensive — must never throw)', () => {
      expect(formatDate(null)).toBe('—')
      expect(formatDate(undefined)).toBe('—')
      expect(formatDate('')).toBe('—')
      expect(formatDate('not-a-date')).toBe('—')
      // The previous behaviour was to throw "Invalid time value" which crashed
      // the whole Users page via ErrorBoundary. This regression test ensures
      // we never regress to that.
      expect(() => formatDate(undefined)).not.toThrow()
    })
  })

  describe('formatDateTime & formatRelative (defensive)', () => {
    it('formatDateTime returns em-dash for null/undefined', () => {
      expect(formatDateTime(null)).toBe('—')
      expect(formatDateTime(undefined)).toBe('—')
    })

    it('formatRelative returns em-dash for null/undefined', () => {
      expect(formatRelative(null)).toBe('—')
      expect(formatRelative(undefined)).toBe('—')
    })
  })

  describe('initialsFromName', () => {
    it('returns the first letter of first and last names', () => {
      expect(initialsFromName('Ahmed', 'Ali')).toBe('AA')
      expect(initialsFromName('ahmed', 'ali')).toBe('AA')
    })

    it('falls back to the available initial when one name is missing', () => {
      expect(initialsFromName(undefined, 'Smith')).toBe('S')
      expect(initialsFromName('John', undefined)).toBe('J')
      expect(initialsFromName()).toBe('?')
    })
  })
})
