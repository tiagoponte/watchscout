import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

// Stripe requires the raw body to verify signatures — disable body parsing
export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  const body = await request.text()
  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (e) {
    console.error('Webhook signature verification failed', e)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const purchaseType = session.metadata?.purchaseType
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id

        if (purchaseType === 'hunt') {
          const searchId = session.metadata?.searchId
          const paymentIntentId = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id
          if (userId && searchId) {
            await prisma.search.updateMany({
              where: { id: searchId, userId },
              data: {
                unlockedAt: new Date(),
                ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
              },
            })
          }
        } else if (purchaseType === 'power') {
          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                tier: 'UNLIMITED',
                ...(customerId ? { stripeCustomerId: customerId } : {}),
              },
            })
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { tier: 'FREE' },
        })
        break
      }

      case 'customer.subscription.updated': {
        // Handle plan changes via Stripe portal (only UNLIMITED subscription now)
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id

        const priceId = subscription.items.data[0]?.price.id
        const { STRIPE_PRICE_IDS } = await import('@/lib/stripe')
        if (priceId === STRIPE_PRICE_IDS.UNLIMITED) {
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { tier: 'UNLIMITED' },
          })
        }
        break
      }
    }
  } catch (e) {
    console.error(`Error handling ${event.type}`, e)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
