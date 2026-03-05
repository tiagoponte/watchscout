import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractFromHtml, extractFromImage } from '@/lib/claude'
import { createListing, rerankListings } from '@/lib/db/listings'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
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

    // Extract listing data from URL or screenshot
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

    // Save to DB and rerank
    const listing = await createListing(searchId, url, extracted)
    await rerankListings(searchId)

    return NextResponse.json({ listingId: listing.id }, { status: 201 })
  } catch (e) {
    console.error('POST /api/listings', e)
    return NextResponse.json({ error: 'Failed to extract listing. Please try again.' }, { status: 500 })
  }
}
