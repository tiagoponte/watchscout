import type { ListingCard, FactorScores } from '@/types'

const WEIGHTS: Record<keyof FactorScores, number> = {
  allInPrice: 30,
  conditionGrade: 15,
  serviceRecency: 15,
  boxAndPapers: 10,
  polishingStatus: 10,
  sellerReputation: 8,
  platformProtection: 5,
  returnsPolicy: 4,
  sellerResponsiveness: 3,
  warrantyRemaining: 0,
}

const CONDITION_SCORE: Record<string, number> = {
  mint: 100,
  very_good: 80,
  good: 60,
  fair: 40,
  poor: 20,
}

function priceScore(price: number, minPrice: number, maxPrice: number): number {
  if (minPrice === maxPrice) return 50
  // Lower price = higher score
  return Math.round(100 - ((price - minPrice) / (maxPrice - minPrice)) * 100)
}

function factorScores(listing: ListingCard, minPrice: number, maxPrice: number): FactorScores {
  const price = listing.askingPrice.value ?? 0
  const shipping = listing.shippingCost.value ?? 0
  const allIn = price + shipping

  const items = listing.includedItems.value
  const boxAndPapers = (() => {
    if (!items) return 30
    if (items.box && items.papers) return 100
    if (items.box) return 60
    if (items.papers) return 50
    return 0
  })()

  const sellerRating = listing.seller.value?.rating
  const sellerReputation = sellerRating != null ? Math.round((sellerRating / 5) * 100) : 50

  const warrantyMonths = listing.sellerWarrantyMonths.value
  const warrantyRemaining = warrantyMonths != null
    ? Math.min(100, Math.round((warrantyMonths / 24) * 100))
    : 0

  return {
    allInPrice: priceScore(allIn, minPrice, maxPrice),
    conditionGrade: CONDITION_SCORE[listing.conditionRating.value ?? ''] ?? 50,
    serviceRecency: 50,      // unknown until questionnaire
    boxAndPapers,
    polishingStatus: 50,     // unknown until questionnaire
    sellerReputation,
    platformProtection: listing.platformProtection.value === true ? 80
      : listing.platformProtection.value === false ? 20 : 50,
    returnsPolicy: listing.returnsPolicy.value ? 70 : 0,
    sellerResponsiveness: 50, // unknown until questionnaire
    warrantyRemaining,
  }
}

export function scoreListings(
  listings: ListingCard[],
): { id: string; compositeScore: number; factorScores: FactorScores; rank: number }[] {
  if (listings.length === 0) return []

  const prices = listings.map((l) => {
    const p = l.askingPrice.value ?? 0
    const s = l.shippingCost.value ?? 0
    return p + s
  })
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  const totalWeight = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)

  const scored = listings.map((listing) => {
    const factors = factorScores(listing, minPrice, maxPrice)
    const composite = Math.round(
      Object.entries(factors).reduce((sum, [key, score]) => {
        return sum + score * (WEIGHTS[key as keyof FactorScores] / totalWeight)
      }, 0),
    )
    return { id: listing.id, compositeScore: composite, factorScores: factors }
  })

  // Sort by composite score descending, assign rank
  scored.sort((a, b) => b.compositeScore - a.compositeScore)
  return scored.map((s, i) => ({ ...s, rank: i + 1 }))
}
