import { NextResponse } from 'next/server'
import { getApiUserContext } from '@/lib/server/get-user-id'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe'
import type { Tier } from '@/lib/plans'

export async function POST(request: Request) {
  try {
    const user = await getApiUserContext()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { tier } = await request.json() as { tier: Exclude<Tier, 'FREE'> }
    const priceId = STRIPE_PRICE_IDS[tier]
    if (!priceId) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })

    const origin = request.headers.get('origin') ?? 'https://watchscout.vercel.app'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { userId: user.id, tier },
      success_url: `${origin}/dashboard?upgraded=1`,
      cancel_url:  `${origin}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('POST /api/stripe/checkout', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
