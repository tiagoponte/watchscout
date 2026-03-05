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
        description: 'Full URLs of all watch listing photos found on the page.',
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

For photos: extract the full URLs of product/watch images. Exclude thumbnails of unrelated items, icons, or UI elements.
For condition: map platform-specific terms (e.g. "Like New"→mint, "Good"→good, "Unworn"→mint).
For platform: infer from the URL or page content.
Always call the save_listing tool with everything you find. Use null for values not found.`

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
  const text = stripHtml(html).slice(0, 60000)

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: [EXTRACT_TOOL],
    tool_choice: { type: 'tool', name: 'save_listing' },
    messages: [
      {
        role: 'user',
        content: `Extract all watch listing data from this page.\n\nURL: ${url}\n\nPage text:\n${text}`,
      },
    ],
  })

  return parseToolResult(message)
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
