import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
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
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (e) {
    console.error('Webhook signature verification failed', e)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const tier = session.metadata?.tier as 'SCOUT' | 'PRO' | undefined
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id

        if (userId && tier) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              tier,
              ...(customerId ? { stripeCustomerId: customerId } : {}),
            },
          })
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
        // Handle plan changes (e.g. SCOUT → PRO upgrade via Stripe portal)
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id

        const priceId = subscription.items.data[0]?.price.id
        const { STRIPE_PRICE_IDS } = await import('@/lib/stripe')
        const tier = priceId === STRIPE_PRICE_IDS.PRO ? 'PRO'
                   : priceId === STRIPE_PRICE_IDS.SCOUT ? 'SCOUT'
                   : null

        if (tier) {
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { tier },
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
