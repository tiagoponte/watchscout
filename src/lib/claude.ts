import Anthropic from '@anthropic-ai/sdk'
import type { CardField, ConditionRating, IncludedItems, SellerInfo, Platform } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ExtractedListing {
  platform: Platform
  platformListingId?: string
  referenceNumber: CardField<string>
  askingPrice: CardField<number>
  currency: CardField<string>
  shippingCost: CardField<number>
  conditionRating: CardField<ConditionRating>
  includedItems: CardField<IncludedItems>
  sellerWarrantyMonths: CardField<number>
  returnsPolicy: CardField<string>
  platformProtection: CardField<boolean>
  photos: string[]
  seller: CardField<SellerInfo>
}

// Tool schema for structured extraction
const EXTRACT_TOOL: Anthropic.Tool = {
  name: 'save_listing',
  description: 'Save the structured watch listing data extracted from the page.',
  input_schema: {
    type: 'object' as const,
    properties: {
      platform: {
        type: 'string',
        enum: ['chrono24', 'ebay', 'watchfinder', 'watchbox', 'crown_caliber', 'manual'],
        description: 'Detected platform from the URL or page content.',
      },
      platformListingId: {
        type: 'string',
        description: 'Platform-specific listing ID if visible in the URL or page.',
      },
      referenceNumber: {
        type: 'object',
        description: 'Watch reference/model number (e.g. "3210.50", "116610LN")',
        properties: {
          value: { type: ['string', 'null'] },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
          notes: { type: ['string', 'null'] },
        },
        required: ['value', 'confidence'],
      },
      askingPrice: {
        type: 'object',
        description: 'Listed price as a number, without currency symbol.',
        properties: {
          value: { type: ['number', 'null'] },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
        },
        required: ['value', 'confidence'],
      },
      currency: {
        type: 'object',
        description: 'ISO 4217 currency code (EUR, USD, GBP, CHF, etc.)',
        properties: {
          value: { type: ['string', 'null'] },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
        },
        required: ['value', 'confidence'],
      },
      shippingCost: {
        type: 'object',
        description: 'Shipping cost shown on the listing page, as a number. 0 if free.',
        properties: {
          value: { type: ['number', 'null'] },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
          notes: { type: ['string', 'null'] },
        },
        required: ['value', 'confidence'],
      },
      conditionRating: {
        type: 'object',
        description: 'Condition of the watch.',
        properties: {
          value: {
            type: ['string', 'null'],
            enum: ['mint', 'very_good', 'good', 'fair', 'poor', null],
          },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
          notes: { type: ['string', 'null'] },
        },
        required: ['value', 'confidence'],
      },
      includedItems: {
        type: 'object',
        description: 'What accessories are included with the watch.',
        properties: {
          value: {
            type: ['object', 'null'],
            properties: {
              box: { type: ['boolean', 'null'] },
              papers: { type: ['boolean', 'null'] },
              extraLinks: { type: ['boolean', 'null'] },
              warrantyCard: { type: ['boolean', 'null'] },
            },
          },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
          notes: { type: ['string', 'null'] },
        },
        required: ['value', 'confidence'],
      },
      sellerWarrantyMonths: {
        type: 'object',
        description: 'Seller or dealer warranty length in months, if offered.',
        properties: {
          value: { type: ['number', 'null'] },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
        },
        required: ['value', 'confidence'],
      },
      returnsPolicy: {
        type: 'object',
        description: 'Returns policy text, if stated.',
        properties: {
          value: { type: ['string', 'null'] },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
        },
        required: ['value', 'confidence'],
      },
      platformProtection: {
        type: 'object',
        description: 'Whether the platform offers buyer protection (e.g. Chrono24 Buyer Protection, eBay Money Back).',
        properties: {
          value: { type: ['boolean', 'null'] },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
        },
        required: ['value', 'confidence'],
      },
      photos: {
        type: 'array',
        description: 'Full URLs of all watch listing photos. Use the provided image URLs where relevant — include only watch/product photos, not icons, logos, or UI elements.',
        items: { type: 'string' },
      },
      seller: {
        type: 'object',
        description: 'Seller information.',
        properties: {
          value: {
            type: ['object', 'null'],
            properties: {
              name: { type: 'string' },
              type: { type: 'string', enum: ['dealer', 'private'] },
              rating: { type: ['number', 'null'] },
              reviewCount: { type: ['number', 'null'] },
              responseTime: { type: ['string', 'null'] },
              memberSince: { type: ['string', 'null'] },
            },
            required: ['name', 'type'],
          },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
        },
        required: ['value', 'confidence'],
      },
    },
    required: [
      'platform', 'referenceNumber', 'askingPrice', 'currency', 'shippingCost',
      'conditionRating', 'includedItems', 'sellerWarrantyMonths', 'returnsPolicy',
      'platformProtection', 'photos', 'seller',
    ],
  },
}

const SYSTEM_PROMPT = `You are a watch listing data extractor. Extract structured information from pre-owned luxury watch listings.

Confidence levels:
- "confirmed": explicitly and clearly stated on the page
- "claimed": seller claims it but it cannot be independently verified
- "unknown": not found or ambiguous

For photos: use the image URLs provided in the prompt. Include only watch/product photos — exclude icons, logos, avatars, and UI elements. Prefer og:image and large product images.
For condition: map platform-specific terms (e.g. "Like New"→mint, "Good"→good, "Unworn"→mint).
For platform: infer from the URL or page content.
Always call the save_listing tool with everything you find. Use null for values not found.`

// Extract product image URLs from raw HTML before stripping tags
function extractProductImages(html: string, baseUrl: string): string[] {
  const urls: string[] = []

  // og:image — most reliable, usually the main product photo
  const ogMatch =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
  if (ogMatch?.[1]) urls.push(ogMatch[1])

  // JSON-LD structured data images
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(m[1])
      const imgs = Array.isArray(data.image) ? data.image : data.image ? [data.image] : []
      for (const img of imgs) {
        if (typeof img === 'string') urls.push(img)
        else if (typeof img?.url === 'string') urls.push(img.url)
      }
    } catch { /* malformed JSON-LD */ }
  }

  // Prominent img tags — skip obvious non-product images
  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*/gi)) {
    const src = m[1]
    if (!src || src.startsWith('data:')) continue
    if (/\b(icon|logo|avatar|banner|pixel|spacer|sprite|svg)\b/i.test(src)) continue
    try {
      urls.push(src.startsWith('http') ? src : new URL(src, baseUrl).href)
    } catch { /* relative URL resolution failed */ }
    if (urls.length >= 15) break
  }

  return [...new Set(urls)]
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function parseToolResult(message: Anthropic.Message): ExtractedListing {
  const toolUse = message.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
  if (!toolUse) throw new Error('Claude did not call the extraction tool')
  return toolUse.input as ExtractedListing
}

export async function extractFromHtml(html: string, url: string): Promise<ExtractedListing> {
  const imageUrls = extractProductImages(html, url)
  const text = stripHtml(html).slice(0, 60000)

  const imageHint = imageUrls.length > 0
    ? `\n\nImage URLs found on this page — include the watch product photos in the photos array:\n${imageUrls.slice(0, 10).join('\n')}`
    : ''

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: [EXTRACT_TOOL],
    tool_choice: { type: 'tool', name: 'save_listing' },
    messages: [
      {
        role: 'user',
        content: `Extract all watch listing data from this page.\n\nURL: ${url}${imageHint}\n\nPage text:\n${text}`,
      },
    ],
  })

  const extracted = parseToolResult(message)

  // If Claude didn't include photos but we found image URLs, use them directly
  if (extracted.photos.length === 0 && imageUrls.length > 0) {
    extracted.photos = imageUrls.slice(0, 8)
  }

  return extracted
}

export async function extractFromImage(
  base64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
  sourceUrl?: string,
): Promise<ExtractedListing> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: [EXTRACT_TOOL],
    tool_choice: { type: 'tool', name: 'save_listing' },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: base64 },
          },
          {
            type: 'text',
            text: `Extract all watch listing data from this screenshot.${sourceUrl ? `\n\nSource URL: ${sourceUrl}` : ''}`,
          },
        ],
      },
    ],
  })

  return parseToolResult(message)
}

/**
 * Fallback: search Bing Images for a representative photo of a watch
 * given a query like "Seiko Prospex Marinemaster SJE101J1".
 * Returns the first image URL found, or null if the search fails.
 */
export async function findRepresentativeImage(query: string): Promise<string | null> {
  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&FORM=HDRSC2&first=1`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    })
    const html = await res.text()
    // Bing embeds image data in JSON blobs — murl is the media URL (direct image link)
    const match = html.match(/"murl":"([^"]+)"/)
    if (match?.[1]) {
      return match[1].replace(/\\u0026/g, '&').replace(/\\/g, '')
    }
  } catch { /* search failed — non-fatal */ }
  return null
}
