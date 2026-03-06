import { NextResponse } from 'next/server'
import { getApiUserContext } from '@/lib/server/get-user-id'
import { extractFromHtml, extractFromImage, findRepresentativeImage } from '@/lib/claude'
import { createListing, rerankListings } from '@/lib/db/listings'
import { getSearch } from '@/lib/db/searches'
import { canAddListing, canMakeAiCall, incrementAiCalls } from '@/lib/db/users'

export async function POST(request: Request) {
  try {
    const user = await getApiUserContext()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as {
      searchId: string
      url?: string
      imageBase64?: string
      mimeType?: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
    }

    const { searchId, url, imageBase64, mimeType } = body
    if (!searchId) return NextResponse.json({ error: 'searchId required' }, { status: 400 })
    if (!url && !imageBase64) return NextResponse.json({ error: 'url or imageBase64 required' }, { status: 400 })

    const search = await getSearch(searchId, user.id)
    if (!search) return NextResponse.json({ error: 'Search not found' }, { status: 404 })

    const listingAllowed = await canAddListing(searchId, user.id)
    if (!listingAllowed) {
      return NextResponse.json(
        { error: `Listing limit reached for your plan (${user.limits.listingsPerSearch} per search). Upgrade to add more.`, code: 'LIMIT_LISTINGS' },
        { status: 403 },
      )
    }

    const aiAllowed = await canMakeAiCall(user.id)
    if (!aiAllowed) {
      return NextResponse.json(
        { error: `Daily AI limit reached (${user.limits.aiCallsPerDay} extractions/day). Resets at midnight UTC.`, code: 'LIMIT_AI' },
        { status: 429 },
      )
    }

    let extracted
    if (url) {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      })
      if (!res.ok) {
        return NextResponse.json(
          { error: `Could not fetch listing page (${res.status}). Try uploading a screenshot instead.` },
          { status: 422 },
        )
      }
      const html = await res.text()
      extracted = await extractFromHtml(html, url)
    } else {
      extracted = await extractFromImage(imageBase64!, mimeType ?? 'image/jpeg')
    }

    await incrementAiCalls(user.id)

    // For screenshots: use the uploaded image itself as the photo
    if (extracted.photos.length === 0 && imageBase64) {
      extracted.photos = [`data:${mimeType ?? 'image/jpeg'};base64,${imageBase64}`]
    }

    // For URLs with no photos extracted: search for a representative image
    if (extracted.photos.length === 0) {
      const query = [search.criteria.modelName, extracted.referenceNumber.value]
        .filter(Boolean)
        .join(' ')
      const repImage = await findRepresentativeImage(query)
      if (repImage) extracted.photos = [repImage]
    }

    // Proxy external photo URLs through our server to bypass CDN hotlink protection
    extracted.photos = extracted.photos.map((photoUrl) =>
      photoUrl.startsWith('data:') ? photoUrl : `/api/image-proxy?url=${encodeURIComponent(photoUrl)}`
    )

    const listing = await createListing(searchId, url, extracted)
    await rerankListings(searchId)

    return NextResponse.json({ listingId: listing.id }, { status: 201 })
  } catch (e) {
    console.error('POST /api/listings', e)
    return NextResponse.json({ error: 'Failed to extract listing. Please try again.' }, { status: 500 })
  }
}
