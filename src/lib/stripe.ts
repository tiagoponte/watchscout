import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

export const STRIPE_PRICE_IDS = {
  SCOUT: process.env.STRIPE_SCOUT_PRICE_ID!,
  PRO:   process.env.STRIPE_PRO_PRICE_ID!,
} as const
