import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatCurrency,
  formatRelativeDate,
  formatScore,
  getPlatformLabel,
  getScoreColor,
  getScoreLabel,
  getRiskColor,
  getRiskLabel,
} from '@/lib/format'

// ── formatCurrency ────────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats EUR correctly', () => {
    expect(formatCurrency(2890, 'EUR')).toBe('€2,890')
  })

  it('formats USD correctly', () => {
    expect(formatCurrency(3500, 'USD')).toBe('$3,500')
  })

  it('formats GBP correctly', () => {
    expect(formatCurrency(2750, 'GBP')).toBe('£2,750')
  })

  it('formats CHF correctly', () => {
    expect(formatCurrency(5000, 'CHF')).toMatch(/5,000/)
  })

  it('rounds to zero decimal places', () => {
    expect(formatCurrency(2890.99, 'EUR')).toBe('€2,891')
  })

  it('formats zero', () => {
    expect(formatCurrency(0, 'EUR')).toBe('€0')
  })

  it('formats large amounts with comma separators', () => {
    expect(formatCurrency(10000, 'EUR')).toBe('€10,000')
  })
})

// ── formatScore ───────────────────────────────────────────────────────────────

describe('formatScore', () => {
  it('rounds a float to the nearest integer', () => {
    expect(formatScore(81.4)).toBe('81')
    expect(formatScore(81.6)).toBe('82')
  })

  it('returns an integer as a string', () => {
    expect(formatScore(75)).toBe('75')
  })

  it('handles zero', () => {
    expect(formatScore(0)).toBe('0')
  })
})

// ── formatRelativeDate ────────────────────────────────────────────────────────

describe('formatRelativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "today" for a timestamp from today', () => {
    expect(formatRelativeDate('2026-03-01T08:00:00Z')).toBe('today')
  })

  it('returns "yesterday" for a timestamp from yesterday', () => {
    expect(formatRelativeDate('2026-02-28T12:00:00Z')).toBe('yesterday')
  })

  it('returns "N days ago" for dates within the past week', () => {
    expect(formatRelativeDate('2026-02-25T12:00:00Z')).toBe('4 days ago')
  })

  it('returns "N weeks ago" for dates 7–29 days ago', () => {
    expect(formatRelativeDate('2026-02-08T12:00:00Z')).toBe('3 weeks ago')
  })

  it('returns "N months ago" for dates 30–364 days ago', () => {
    expect(formatRelativeDate('2025-12-01T12:00:00Z')).toBe('3 months ago')
  })

  it('returns "N years ago" for dates 365+ days ago', () => {
    // 2025-02-01 is ~393 days before the mocked now (2026-03-01) → 1 year
    expect(formatRelativeDate('2025-02-01T12:00:00Z')).toBe('1 years ago')
  })
})

// ── getPlatformLabel ──────────────────────────────────────────────────────────

describe('getPlatformLabel', () => {
  it('returns Chrono24 for chrono24', () => {
    expect(getPlatformLabel('chrono24')).toBe('Chrono24')
  })

  it('returns eBay for ebay', () => {
    expect(getPlatformLabel('ebay')).toBe('eBay')
  })

  it('returns Watchfinder for watchfinder', () => {
    expect(getPlatformLabel('watchfinder')).toBe('Watchfinder')
  })

  it('returns WatchBox for watchbox', () => {
    expect(getPlatformLabel('watchbox')).toBe('WatchBox')
  })

  it('returns Crown & Caliber for crown_caliber', () => {
    expect(getPlatformLabel('crown_caliber')).toBe('Crown & Caliber')
  })

  it('returns Manual Input for manual', () => {
    expect(getPlatformLabel('manual')).toBe('Manual Input')
  })
})

// ── getScoreColor ─────────────────────────────────────────────────────────────

describe('getScoreColor', () => {
  it('returns emerald for scores >= 75', () => {
    expect(getScoreColor(75)).toBe('text-emerald-400')
    expect(getScoreColor(100)).toBe('text-emerald-400')
    expect(getScoreColor(81)).toBe('text-emerald-400')
  })

  it('returns amber for scores 50–74', () => {
    expect(getScoreColor(50)).toBe('text-amber-400')
    expect(getScoreColor(68)).toBe('text-amber-400')
    expect(getScoreColor(74)).toBe('text-amber-400')
  })

  it('returns red for scores below 50', () => {
    expect(getScoreColor(49)).toBe('text-red-400')
    expect(getScoreColor(31)).toBe('text-red-400')
    expect(getScoreColor(0)).toBe('text-red-400')
  })
})

// ── getScoreLabel ─────────────────────────────────────────────────────────────

describe('getScoreLabel', () => {
  it('returns Excellent for scores >= 80', () => {
    expect(getScoreLabel(80)).toBe('Excellent')
    expect(getScoreLabel(100)).toBe('Excellent')
    expect(getScoreLabel(81)).toBe('Excellent')
  })

  it('returns Good for scores 65–79', () => {
    expect(getScoreLabel(65)).toBe('Good')
    expect(getScoreLabel(74)).toBe('Good')
    expect(getScoreLabel(79)).toBe('Good')
  })

  it('returns Fair for scores 50–64', () => {
    expect(getScoreLabel(50)).toBe('Fair')
    expect(getScoreLabel(52)).toBe('Fair')
    expect(getScoreLabel(64)).toBe('Fair')
  })

  it('returns Weak for scores below 50', () => {
    expect(getScoreLabel(49)).toBe('Weak')
    expect(getScoreLabel(31)).toBe('Weak')
    expect(getScoreLabel(0)).toBe('Weak')
  })
})

// ── getRiskColor ──────────────────────────────────────────────────────────────

describe('getRiskColor', () => {
  it('returns emerald for scores <= 25 (low risk)', () => {
    expect(getRiskColor(0)).toBe('text-emerald-400')
    expect(getRiskColor(25)).toBe('text-emerald-400')
    expect(getRiskColor(38)).not.toBe('text-emerald-400')
  })

  it('returns amber for scores 26–50 (moderate risk)', () => {
    expect(getRiskColor(26)).toBe('text-amber-400')
    expect(getRiskColor(38)).toBe('text-amber-400')
    expect(getRiskColor(50)).toBe('text-amber-400')
  })

  it('returns red for scores above 50 (high risk)', () => {
    expect(getRiskColor(51)).toBe('text-red-400')
    expect(getRiskColor(75)).toBe('text-red-400')
    expect(getRiskColor(100)).toBe('text-red-400')
  })
})

// ── getRiskLabel ──────────────────────────────────────────────────────────────

describe('getRiskLabel', () => {
  it('returns Low risk for scores <= 25', () => {
    expect(getRiskLabel(0)).toBe('Low risk')
    expect(getRiskLabel(25)).toBe('Low risk')
  })

  it('returns Moderate for scores 26–50', () => {
    expect(getRiskLabel(26)).toBe('Moderate')
    expect(getRiskLabel(38)).toBe('Moderate')
    expect(getRiskLabel(50)).toBe('Moderate')
  })

  it('returns High risk for scores above 50', () => {
    expect(getRiskLabel(51)).toBe('High risk')
    expect(getRiskLabel(100)).toBe('High risk')
  })
})
