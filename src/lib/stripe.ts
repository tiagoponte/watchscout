import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    })
  }
  return _stripe
}

export const STRIPE_PRICE_IDS = {
  SCOUT: process.env.STRIPE_SCOUT_PRICE_ID!,
  PRO:   process.env.STRIPE_PRO_PRICE_ID!,
} as const
