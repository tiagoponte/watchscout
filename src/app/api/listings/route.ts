import { NextResponse } from 'next/server'
import sharp from 'sharp'
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

    const aiAllowed = await canMakeAiCall(user.id, searchId)
    if (!aiAllowed) {
      return NextResponse.json(
        { error: `AI limit reached for your plan. Upgrade to continue.`, code: 'LIMIT_AI' },
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
      // Cloudflare and similar WAFs return a 200 challenge page instead of the real listing
      if (
        html.includes('cf-browser-verification') ||
        html.includes('challenge-form') ||
        html.includes('__cf_chl') ||
        html.includes('Checking your browser') ||
        html.length < 500
      ) {
        return NextResponse.json(
          { error: 'This site is protected and cannot be fetched directly. Please upload a screenshot of the listing instead.' },
          { status: 422 },
        )
      }
      extracted = await extractFromHtml(html, url)
    } else {
      extracted = await extractFromImage(imageBase64!, mimeType ?? 'image/jpeg')
    }

    await incrementAiCalls(user.id, searchId)

    // Screenshots: Claude can see images but cannot know real URLs — discard any hallucinated ones.
    // Instead, crop the screenshot to the watch bounding box Claude identified.
    if (imageBase64) {
      extracted.photos = []
      if (extracted.watchRegion) {
        try {
          const { xPercent, yPercent, widthPercent, heightPercent } = extracted.watchRegion
          const buf = Buffer.from(imageBase64, 'base64')
          const meta = await sharp(buf).metadata()
          const w = meta.width!, h = meta.height!
          const left   = Math.max(0, Math.round((xPercent / 100) * w))
          const top    = Math.max(0, Math.round((yPercent / 100) * h))
          const width  = Math.min(Math.round((widthPercent / 100) * w),  w - left)
          const height = Math.min(Math.round((heightPercent / 100) * h), h - top)
          const cropped = await sharp(buf)
            .extract({ left, top, width, height })
            .jpeg({ quality: 85 })
            .toBuffer()
          extracted.photos = [`data:image/jpeg;base64,${cropped.toString('base64')}`]
        } catch {
          // crop failed — fall through to Bing
        }
      }
    }

    // If still no photos: try Bing as a fallback (covers both URL and screenshot crop failures)
    if (extracted.photos.length === 0) {
      const query = [search.criteria.modelName, extracted.referenceNumber.value]
        .filter(Boolean)
        .join(' ')
      const repImage = await findRepresentativeImage(query)
      if (repImage) extracted.photos = [repImage]
      // Last resort: use the screenshot itself (already resized to ≤900px by the client)
      else if (imageBase64) extracted.photos = [`data:image/jpeg;base64,${imageBase64}`]
    }

    // Proxy external photo URLs through our server to bypass CDN hotlink protection
    extracted.photos = extracted.photos.map((photoUrl) =>
      photoUrl.startsWith('data:') ? photoUrl : `/api/image-proxy?url=${encodeURIComponent(photoUrl)}`
    )

    const listing = await createListing(searchId, url, extracted)
    await rerankListings(searchId)

    return NextResponse.json({ listingId: listing.id }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('POST /api/listings', msg)
    return NextResponse.json({ error: `Extraction failed: ${msg}` }, { status: 500 })
  }
}
