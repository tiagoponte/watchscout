import { RankedListing, RankingWeights } from '@/types'
import { mockListings } from './mock-listings'

export const defaultWeights: RankingWeights = {
  allInPrice: 0.25,
  serviceRecency: 0.20,
  polishingStatus: 0.15,
  conditionGrade: 0.10,
  boxAndPapers: 0.10,
  sellerReputation: 0.08,
  platformProtection: 0.05,
  returnsPolicy: 0.04,
  sellerResponsiveness: 0.02,
  warrantyRemaining: 0.01,
}

const speedmasterRankings: RankedListing[] = [
  {
    listing: mockListings.find((l) => l.id === 'lst_speed_01')!,
    rank: 1,
    compositeScore: 81,
    factorScores: {
      allInPrice: 88,
      serviceRecency: 82,
      polishingStatus: 55,
      conditionGrade: 80,
      boxAndPapers: 50,
      sellerReputation: 92,
      platformProtection: 100,
      returnsPolicy: 75,
      sellerResponsiveness: 95,
      warrantyRemaining: 40,
    },
    rankDelta: null,
  },
  {
    listing: mockListings.find((l) => l.id === 'lst_speed_03')!,
    rank: 2,
    compositeScore: 74,
    factorScores: {
      allInPrice: 52,
      serviceRecency: 90,
      polishingStatus: 100,
      conditionGrade: 100,
      boxAndPapers: 100,
      sellerReputation: 98,
      platformProtection: 100,
      returnsPolicy: 80,
      sellerResponsiveness: 70,
      warrantyRemaining: 100,
    },
    rankDelta: 1,
  },
  {
    listing: mockListings.find((l) => l.id === 'lst_speed_02')!,
    rank: 3,
    compositeScore: 68,
    factorScores: {
      allInPrice: 74,
      serviceRecency: 30,
      polishingStatus: 80,
      conditionGrade: 65,
      boxAndPapers: 50,
      sellerReputation: 70,
      platformProtection: 100,
      returnsPolicy: 90,
      sellerResponsiveness: 50,
      warrantyRemaining: 0,
    },
    rankDelta: -1,
  },
  {
    listing: mockListings.find((l) => l.id === 'lst_speed_04')!,
    rank: 4,
    compositeScore: 52,
    factorScores: {
      allInPrice: 82,
      serviceRecency: 0,
      polishingStatus: 0,
      conditionGrade: 60,
      boxAndPapers: 0,
      sellerReputation: 45,
      platformProtection: 100,
      returnsPolicy: 0,
      sellerResponsiveness: 30,
      warrantyRemaining: 0,
    },
    rankDelta: null,
  },
  {
    listing: mockListings.find((l) => l.id === 'lst_speed_05')!,
    rank: 5,
    compositeScore: 31,
    factorScores: {
      allInPrice: 100,
      serviceRecency: 0,
      polishingStatus: 0,
      conditionGrade: 0,
      boxAndPapers: 0,
      sellerReputation: 0,
      platformProtection: 0,
      returnsPolicy: 0,
      sellerResponsiveness: 0,
      warrantyRemaining: 0,
    },
    rankDelta: null,
  },
]

const datejustRankings: RankedListing[] = [
  {
    listing: mockListings.find((l) => l.id === 'lst_datejust_02')!,
    rank: 1,
    compositeScore: 84,
    factorScores: {
      allInPrice: 72,
      serviceRecency: 100,
      polishingStatus: 100,
      conditionGrade: 100,
      boxAndPapers: 100,
      sellerReputation: 95,
      platformProtection: 100,
      returnsPolicy: 75,
      sellerResponsiveness: 100,
      warrantyRemaining: 100,
    },
    rankDelta: null,
  },
  {
    listing: mockListings.find((l) => l.id === 'lst_datejust_01')!,
    rank: 2,
    compositeScore: 71,
    factorScores: {
      allInPrice: 80,
      serviceRecency: 0,
      polishingStatus: 0,
      conditionGrade: 75,
      boxAndPapers: 90,
      sellerReputation: 88,
      platformProtection: 100,
      returnsPolicy: 90,
      sellerResponsiveness: 75,
      warrantyRemaining: 60,
    },
    rankDelta: null,
  },
]

const rankingsBySearch: Record<string, RankedListing[]> = {
  srch_speedmaster_01: speedmasterRankings,
  srch_datejust_01: datejustRankings,
}

export function getRankedListings(searchId: string): RankedListing[] {
  return rankingsBySearch[searchId] ?? []
}
