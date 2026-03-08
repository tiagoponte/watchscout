import Anthropic from '@anthropic-ai/sdk'
import type { CardField, ConditionRating, IncludedItems, SellerInfo, Platform, ListingCard, PolishingStatus, ServiceType } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface WatchRegion {
  xPercent: number
  yPercent: number
  widthPercent: number
  heightPercent: number
}

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
  manufactureYear: CardField<number>
  listingLanguage?: string
  braceletType?: 'bracelet' | 'strap'
  watchRegion?: WatchRegion
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
      manufactureYear: {
        type: 'object',
        description: 'Year the watch was manufactured or purchased new (e.g. 2019, 2024). Look for production year, purchase year, or "unworn/new old stock" indicators.',
        properties: {
          value: { type: ['number', 'null'] },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
          notes: { type: ['string', 'null'] },
        },
        required: ['value', 'confidence'],
      },
      listingLanguage: {
        type: 'string',
        description: 'Language the SELLER wrote the listing description in (e.g. "Spanish", "German", "French", "English"). Focus only on seller-authored text (item description, seller notes) — ignore platform UI labels, navigation, and boilerplate.',
      },
      braceletType: {
        type: 'string',
        enum: ['bracelet', 'strap'],
        description: 'Whether the watch is fitted with a metal bracelet or a strap (leather, rubber, fabric, NATO, etc.). Infer from the listing description, photos, or watch reference.',
      },
      watchRegion: {
        type: 'object',
        description: 'For screenshots only: bounding box of the watch in the image, as percentages (0–100) of image width/height. Include generous padding around the watch. Omit for URL-sourced HTML.',
        properties: {
          xPercent:      { type: 'number', description: 'Left edge of watch as % of image width' },
          yPercent:      { type: 'number', description: 'Top edge of watch as % of image height' },
          widthPercent:  { type: 'number', description: 'Width of watch region as % of image width' },
          heightPercent: { type: 'number', description: 'Height of watch region as % of image height' },
        },
        required: ['xPercent', 'yPercent', 'widthPercent', 'heightPercent'],
      },
    },
    required: [
      'platform', 'referenceNumber', 'askingPrice', 'currency', 'shippingCost',
      'conditionRating', 'includedItems', 'sellerWarrantyMonths', 'returnsPolicy',
      'platformProtection', 'photos', 'seller', 'manufactureYear',
    ],
  },
}

const SYSTEM_PROMPT = `You are a watch listing data extractor. Extract structured information from pre-owned luxury watch listings.

Confidence levels:
- "confirmed": explicitly and clearly stated on the page
- "claimed": seller claims it but it cannot be independently verified
- "unknown": not found or ambiguous

For photos: use the image URLs provided in the prompt. Include only watch/product photos — exclude icons, logos, avatars, and UI elements. Prefer og:image and large product images.
For watchRegion: when processing a screenshot, identify the bounding box of the watch (case, dial, strap) in the image. Include generous padding (~10% on each side). Return percentages relative to the full image dimensions. Omit this field when processing HTML/URL content.
For condition: map platform-specific terms (e.g. "Like New"→mint, "Good"→good, "Unworn"→mint).
For platform: infer from the URL or page content.
For listingLanguage: identify the language the SELLER used to write their listing description and notes — ignore platform UI text, navigation labels, and boilerplate. Set to "English", "Spanish", "German", "French", "Italian", "Dutch", "Japanese", etc. If the seller description is absent or clearly in English, set to "English".
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
    max_tokens: 4096,
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

// Tool schema for offer suggestion
const OFFER_TOOL: Anthropic.Tool = {
  name: 'save_offer_suggestion',
  description: 'Save the structured offer suggestion based on market analysis.',
  input_schema: {
    type: 'object' as const,
    properties: {
      marketValue: {
        type: 'number',
        description: 'Estimated fair market value in the listing currency.',
      },
      suggestedOffer: {
        type: 'number',
        description: 'Recommended opening offer price — realistic but leaves room to negotiate.',
      },
      lowOffer: {
        type: 'number',
        description: 'Lowest reasonable offer that a serious seller would still consider.',
      },
      reasoning: {
        type: 'string',
        description: 'One or two sentences explaining the valuation and offer strategy.',
      },
    },
    required: ['marketValue', 'suggestedOffer', 'lowOffer', 'reasoning'],
  },
}

export interface OfferSuggestion {
  marketValue: number
  suggestedOffer: number
  lowOffer: number
  reasoning: string
}

export async function generateOfferSuggestion(
  watchName: string,
  listing: ListingCard,
): Promise<OfferSuggestion> {
  const currency = listing.currency.value ?? 'EUR'
  const items = listing.includedItems.value
  const context = [
    `Watch: ${watchName}`,
    listing.referenceNumber.value ? `Reference: ${listing.referenceNumber.value}` : null,
    `Asking price: ${listing.askingPrice.value} ${currency}`,
    listing.conditionRating.value ? `Condition: ${listing.conditionRating.value}` : null,
    listing.manufactureYear.value ? `Year: ${listing.manufactureYear.value}` : null,
    items ? `Box: ${items.box ? 'yes' : 'no'}, Papers: ${items.papers ? 'yes' : 'no'}` : null,
    listing.seller.value ? `Seller: ${listing.seller.value.type}` : null,
    listing.polishingStatus.value && listing.polishingStatus.value !== 'unknown'
      ? `Polishing: ${listing.polishingStatus.value}` : null,
    listing.lastServiceYear.value ? `Last serviced: ${listing.lastServiceYear.value}` : null,
  ].filter(Boolean).join('\n')

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: `You are an expert pre-owned luxury watch market analyst.
Based on the listing details, estimate the fair market value and suggest an offer strategy.
Use your knowledge of current secondary market prices for this reference.
Be realistic — don't lowball aggressively, but leave room to negotiate.
Always call save_offer_suggestion.`,
    tools: [OFFER_TOOL],
    tool_choice: { type: 'tool', name: 'save_offer_suggestion' },
    messages: [{ role: 'user', content: context }],
  })

  const toolUse = message.content.find(b => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') throw new Error('Claude did not call the offer tool')
  return toolUse.input as OfferSuggestion
}

// Tool schema for questionnaire generation (structured, bilingual output)
const QUESTIONNAIRE_TOOL: Anthropic.Tool = {
  name: 'save_questionnaire',
  description: 'Save the generated questionnaire in both the seller\'s language and English.',
  input_schema: {
    type: 'object' as const,
    properties: {
      detectedLanguage: {
        type: 'string',
        description: 'The language the seller message is written in, e.g. "German", "French", "English".',
      },
      sellerText: {
        type: 'string',
        description: 'The questionnaire message written in the seller\'s detected language.',
      },
      englishText: {
        type: 'string',
        description: 'English translation of the message. If the seller language is English, repeat the same text.',
      },
    },
    required: ['detectedLanguage', 'sellerText', 'englishText'],
  },
}

export interface GeneratedQuestionnaire {
  detectedLanguage: string
  sellerText: string
  englishText: string
}

// Tool schema for parsing seller questionnaire responses
const PARSE_RESPONSE_TOOL: Anthropic.Tool = {
  name: 'save_questionnaire_answers',
  description: 'Save structured answers extracted from the seller\'s response.',
  input_schema: {
    type: 'object' as const,
    properties: {
      polishingStatus: {
        type: 'object',
        description: 'Whether the case/bracelet has been polished.',
        properties: {
          value: { type: ['string', 'null'], enum: ['unpolished', 'light_polish', 'heavily_polished', 'unknown', null] },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
          notes: { type: ['string', 'null'] },
        },
        required: ['value', 'confidence'],
      },
      lastServiceYear: {
        type: 'object',
        description: 'Year the watch was last serviced.',
        properties: {
          value: { type: ['number', 'null'] },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
          notes: { type: ['string', 'null'] },
        },
        required: ['value', 'confidence'],
      },
      lastServiceType: {
        type: 'object',
        description: 'Type of service performed.',
        properties: {
          value: { type: ['string', 'null'], enum: ['full_service', 'partial_service', 'unknown', null] },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
        },
        required: ['value', 'confidence'],
      },
      partsReplaced: {
        type: 'object',
        description: 'Parts replaced during service (e.g. crystal, crown, hands).',
        properties: {
          value: { type: ['array', 'null'], items: { type: 'string' } },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
          notes: { type: ['string', 'null'] },
        },
        required: ['value', 'confidence'],
      },
      braceletSizingInfo: {
        type: 'object',
        description: 'Bracelet sizing information: wrist size, spare links, etc.',
        properties: {
          value: { type: ['string', 'null'] },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
        },
        required: ['value', 'confidence'],
      },
      actualShippingToUser: {
        type: 'object',
        description: 'Actual shipping cost quoted by seller, as a number. 0 if free.',
        properties: {
          value: { type: ['number', 'null'] },
          confidence: { type: 'string', enum: ['confirmed', 'claimed', 'unknown'] },
          notes: { type: ['string', 'null'] },
        },
        required: ['value', 'confidence'],
      },
    },
    required: ['polishingStatus', 'lastServiceYear', 'lastServiceType', 'partsReplaced', 'braceletSizingInfo', 'actualShippingToUser'],
  },
}

export interface ParsedSellerResponse {
  polishingStatus: CardField<PolishingStatus>
  lastServiceYear: CardField<number>
  lastServiceType: CardField<ServiceType>
  partsReplaced: CardField<string[]>
  braceletSizingInfo: CardField<string>
  actualShippingToUser: CardField<number>
}

export async function generateQuestionnaire(
  watchName: string,
  listing: ListingCard,
  sellerLanguage?: string,
): Promise<GeneratedQuestionnaire> {
  const knownFacts: string[] = []
  if (listing.referenceNumber.value) knownFacts.push(`Reference: ${listing.referenceNumber.value}`)
  if (listing.conditionRating.value) knownFacts.push(`Stated condition: ${listing.conditionRating.value}`)
  const items = listing.includedItems.value
  if (items?.box != null) knownFacts.push(`Box: ${items.box ? 'yes' : 'no'}`)
  if (items?.papers != null) knownFacts.push(`Papers: ${items.papers ? 'yes' : 'no'}`)

  const currentYear = new Date().getFullYear()
  const watchAge = listing.manufactureYear.value != null
    ? currentYear - listing.manufactureYear.value
    : null
  const isNewWatch = watchAge !== null && watchAge <= 2

  const askAbout: string[] = []
  if (!isNewWatch && listing.polishingStatus.confidence === 'pending')
    askAbout.push('polishing history — has the case or bracelet ever been polished by a jeweller or watchmaker?')
  if (!isNewWatch) {
    if (listing.lastServiceYear.confidence === 'pending')
      askAbout.push('last service date, who performed it, and whether service documents are available')
    if (listing.partsReplaced.confidence === 'pending')
      askAbout.push('any parts replaced during service (e.g. crystal, crown, pushers, hands)')
  }
  const isBraceletWatch = listing.braceletType === 'bracelet'
  if (isBraceletWatch && listing.braceletSizingInfo.confidence === 'pending')
    askAbout.push('bracelet sizing: current fitted wrist size and how many spare links are included')
  if (listing.shippingCost.confidence !== 'confirmed')
    askAbout.push('exact shipping cost to the buyer')

  // Language cues: explicit override > detected listing language > URL domain, seller name, platform
  const effectiveLanguage = sellerLanguage || listing.listingLanguage
  const langCues = [
    effectiveLanguage ? `Seller language: ${effectiveLanguage}` : null,
    listing.url ? `Listing URL: ${listing.url}` : null,
    listing.seller.value?.name ? `Seller name: ${listing.seller.value.name}` : null,
    `Platform: ${listing.platform}`,
  ].filter(Boolean).join('\n')

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    tools: [QUESTIONNAIRE_TOOL],
    tool_choice: { type: 'tool', name: 'save_questionnaire' },
    system: `You are helping a watch buyer write a short, professional message to a seller.

If a "Seller language" is provided, write sellerText in that language. Otherwise detect from the URL domain (.de → German, .fr → French, .it → Italian, .es → Spanish, .nl → Dutch, .jp → Japanese, etc.) or seller name. Default to English if uncertain.
Write englishText as a clean English version (identical to sellerText if the language is English).

If questions are provided, ask only those — nothing more. Be concise and polite.
If no questions are provided, write a brief, friendly message expressing interest in the watch and asking the seller what their best price would be.`,
    messages: [
      {
        role: 'user',
        content: `Watch: ${watchName}
Seller type: ${listing.seller.value?.type ?? 'unknown'}
${langCues}
Known facts: ${knownFacts.join(', ') || 'none'}

${askAbout.length > 0
  ? `Questions to ask:\n${askAbout.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
  : 'No questions needed — write a short introductory message asking for their best price.'}`,
      },
    ],
  })

  const toolUse = message.content.find(b => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') throw new Error('Claude did not call the questionnaire tool')
  return toolUse.input as GeneratedQuestionnaire
}

export async function translateMessage(english: string, targetLanguage: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Translate the following message into ${targetLanguage}. Keep the same tone, structure, and formatting. Return only the translated text, nothing else.\n\n${english}`,
    }],
  })
  const block = message.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
  if (!block) throw new Error('No translation returned')
  return block.text.trim()
}

export async function parseSellerResponse(
  sellerResponse: string,
  listing: ListingCard,
): Promise<ParsedSellerResponse> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are extracting structured data from a watch seller's reply to a buyer questionnaire.
Extract: polishing history, service history (year + type), parts replaced, bracelet sizing, and shipping cost.
Confidence: "confirmed" if stated clearly, "claimed" if asserted but unverifiable, "unknown" if not mentioned.
Use null for values not mentioned. Always call save_questionnaire_answers.`,
    tools: [PARSE_RESPONSE_TOOL],
    tool_choice: { type: 'tool', name: 'save_questionnaire_answers' },
    messages: [
      {
        role: 'user',
        content: `Watch listing: ${listing.referenceNumber.value ?? 'unknown ref'} on ${listing.platform}

Seller response:
${sellerResponse}

Extract all relevant information.`,
      },
    ],
  })

  const toolUse = message.content.find(b => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') throw new Error('Claude did not call the parse tool')
  return toolUse.input as ParsedSellerResponse
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
