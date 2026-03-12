import { NextResponse } from 'next/server'
import { getApiUserContext } from '@/lib/server/get-user-id'
import { getStripe, STRIPE_PRICE_IDS } from '@/lib/stripe'

type CheckoutBody =
  | { purchaseType: 'hunt'; searchId: string }
  | { purchaseType: 'power' }

export async function POST(request: Request) {
  try {
    const user = await getApiUserContext()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as CheckoutBody
    const origin = request.headers.get('origin') ?? 'https://watchscout.vercel.app'

    if (body.purchaseType === 'hunt') {
      const { searchId } = body
      if (!searchId) return NextResponse.json({ error: 'searchId required' }, { status: 400 })

      const session = await getStripe().checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: STRIPE_PRICE_IDS.HUNT, quantity: 1 }],
        customer_email: user.email,
        client_reference_id: user.id,
        metadata: { userId: user.id, purchaseType: 'hunt', searchId },
        success_url: `${origin}/searches/${searchId}?unlocked=1`,
        cancel_url:  `${origin}/searches/${searchId}`,
      })
      return NextResponse.json({ url: session.url })
    }

    if (body.purchaseType === 'power') {
      const session = await getStripe().checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: STRIPE_PRICE_IDS.UNLIMITED, quantity: 1 }],
        customer_email: user.email,
        client_reference_id: user.id,
        metadata: { userId: user.id, purchaseType: 'power' },
        success_url: `${origin}/dashboard?upgraded=1`,
        cancel_url:  `${origin}/dashboard`,
      })
      return NextResponse.json({ url: session.url })
    }

    return NextResponse.json({ error: 'Invalid purchaseType' }, { status: 400 })
  } catch (e) {
    console.error('POST /api/stripe/checkout', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
