import { RankedListing } from '@/types'

export interface RowSignal {
  label: string
  color: 'amber' | 'emerald' | 'blue' | 'zinc'
}

export function computeRowSignals(rankings: RankedListing[]): Map<string, RowSignal> {
  const signals = new Map<string, RowSignal>()
  if (rankings.length === 0) return signals

  const withRisk = rankings.filter((r) => r.listing.riskScore != null)
  const withValue = rankings.filter((r) => r.listing.valueScore != null)

  const lowestRisk = withRisk.length > 0
    ? withRisk.reduce((a, b) => a.listing.riskScore! < b.listing.riskScore! ? a : b)
    : null
  const highestValue = withValue.length > 0
    ? withValue.reduce((a, b) => a.listing.valueScore! > b.listing.valueScore! ? a : b)
    : null
  const topRank = rankings.find((r) => r.rank === 1)

  const assigned = new Set<string>()

  if (topRank) {
    signals.set(topRank.listing.id, { label: 'Top pick in this hunt', color: 'amber' })
    assigned.add(topRank.listing.id)
  }

  if (lowestRisk && !assigned.has(lowestRisk.listing.id)) {
    signals.set(lowestRisk.listing.id, { label: 'Lowest risk', color: 'emerald' })
    assigned.add(lowestRisk.listing.id)
  }

  if (highestValue && !assigned.has(highestValue.listing.id)) {
    signals.set(highestValue.listing.id, { label: 'Best value score', color: 'blue' })
    assigned.add(highestValue.listing.id)
  }

  for (const r of rankings) {
    if (assigned.has(r.listing.id)) continue
    const { listing } = r
    const unknownCount = [
      listing.polishingStatus.value,
      listing.lastServiceYear.value,
      listing.lastServiceType.value,
    ].filter((v) => v == null).length
    if (unknownCount >= 2) {
      signals.set(listing.id, { label: 'Key info missing — send questionnaire', color: 'zinc' })
    }
  }

  return signals
}

const signalColorMap: Record<RowSignal['color'], string> = {
  amber: 'text-amber-400',
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  zinc: 'text-zinc-500',
}

export function signalColorClass(color: RowSignal['color']): string {
  return signalColorMap[color]
}
