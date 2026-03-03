import { Platform } from '@/types'

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatScore(score: number): string {
  return Math.round(score).toString()
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function getPlatformLabel(platform: Platform): string {
  const labels: Record<Platform, string> = {
    chrono24: 'Chrono24',
    ebay: 'eBay',
    watchfinder: 'Watchfinder',
    watchbox: 'WatchBox',
    crown_caliber: 'Crown & Caliber',
    manual: 'Manual Input',
  }
  return labels[platform]
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-400'
  if (score >= 50) return 'text-amber-400'
  return 'text-red-400'
}

export function getRiskColor(score: number): string {
  if (score <= 25) return 'text-emerald-400'
  if (score <= 50) return 'text-amber-400'
  return 'text-red-400'
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Good'
  if (score >= 50) return 'Fair'
  return 'Weak'
}

export function getRiskLabel(score: number): string {
  if (score <= 25) return 'Low risk'
  if (score <= 50) return 'Moderate'
  return 'High risk'
}
