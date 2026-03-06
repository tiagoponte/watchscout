export const PLAN_LIMITS = {
  FREE:  { searches: 1,        listingsPerSearch: 3,        aiCallsPerDay: 10  },
  SCOUT: { searches: 3,        listingsPerSearch: 15,       aiCallsPerDay: 50  },
  PRO:   { searches: Infinity, listingsPerSearch: Infinity, aiCallsPerDay: 200 },
} as const

export type Tier = keyof typeof PLAN_LIMITS

export const PLAN_PRICES: Record<Exclude<Tier, 'FREE'>, { label: string; price: string }> = {
  SCOUT: { label: 'Scout', price: '€9.99/mo' },
  PRO:   { label: 'Pro',   price: '€19.99/mo' },
}
