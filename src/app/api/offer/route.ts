import { NextResponse } from 'next/server'
import { getApiUserContext } from '@/lib/server/get-user-id'
import { getListing } from '@/lib/db/listings'
import { getSearch } from '@/lib/db/searches'
import { generateOfferSuggestion } from '@/lib/claude'
import { canMakeAiCall, incrementAiCalls } from '@/lib/db/users'

export async function POST(request: Request) {
  try {
    const user = await getApiUserContext()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { listingId, searchId } = await request.json() as { listingId?: string; searchId?: string }
    if (!listingId || !searchId)
      return NextResponse.json({ error: 'listingId and searchId required' }, { status: 400 })

    const search = await getSearch(searchId, user.id)
    if (!search) return NextResponse.json({ error: 'Search not found' }, { status: 404 })

    const rankedListing = await getListing(searchId, listingId)
    if (!rankedListing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    const aiAllowed = await canMakeAiCall(user.id)
    if (!aiAllowed) {
      return NextResponse.json(
        { error: `Daily AI limit reached (${user.limits.aiCallsPerDay}/day). Resets at midnight UTC.`, code: 'LIMIT_AI' },
        { status: 429 },
      )
    }

    const suggestion = await generateOfferSuggestion(search.name, rankedListing.listing)
    await incrementAiCalls(user.id)

    return NextResponse.json(suggestion)
  } catch (e) {
    console.error('POST /api/offer', e)
    return NextResponse.json({ error: 'Failed to generate offer suggestion. Please try again.' }, { status: 500 })
  }
}
