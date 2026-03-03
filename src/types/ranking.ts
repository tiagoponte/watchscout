import { ListingCard } from './listing'

export interface RankingWeights {
  allInPrice: number
  serviceRecency: number
  polishingStatus: number
  conditionGrade: number
  boxAndPapers: number
  sellerReputation: number
  platformProtection: number
  returnsPolicy: number
  sellerResponsiveness: number
  warrantyRemaining: number
}

export interface FactorScores {
  allInPrice: number
  serviceRecency: number
  polishingStatus: number
  conditionGrade: number
  boxAndPapers: number
  sellerReputation: number
  platformProtection: number
  returnsPolicy: number
  sellerResponsiveness: number
  warrantyRemaining: number
}

export interface RankedListing {
  listing: ListingCard
  rank: number
  compositeScore: number
  factorScores: FactorScores
  rankDelta: number | null
}
