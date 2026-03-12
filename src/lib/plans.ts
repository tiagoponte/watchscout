export const PLAN_LIMITS = {
  FREE:  { searches: 1,        listingsPerSearch: 3,        aiCallsPerDay: 10  },
  POWER: { searches: Infinity, listingsPerSearch: Infinity, aiCallsPerDay: 200 },
} as const

// Per-hunt unlock limits (applied at search level, not user level)
export const HUNT_UNLOCK_LIMITS = {
  listingsPerSearch: 15,
  aiCallsPerHunt: 50,
} as const

export type Tier = keyof typeof PLAN_LIMITS

export const PLAN_PRICES = {
  HUNT:  { label: 'Hunt Unlock', price: '€24.99' },      // one-time
  POWER: { label: 'Power',       price: '€49.99/mo' },   // subscription
} as const
