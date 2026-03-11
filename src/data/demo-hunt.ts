import { Search, ListingCard, RankedListing } from '@/types'
import { scoreListings } from '@/lib/scoring'

const proxy = (url: string) => `/api/image-proxy?url=${encodeURIComponent(url)}`

// One real photo per listing, proxied to avoid CDN hotlink protection
const DEMO_PHOTOS: Record<string, string[]> = {
  lst_demo_01: [proxy('https://s.turbifycdn.com/aah/movadobaby/omega-speedmaster-professional-moonwatch-311-30-42-30-01-005-259.jpg')],
  lst_demo_02: [proxy('https://cdn.watchbase.com/watch/lg/omega/speedmaster/311-30-42-30-01-005-a3.png')],
  lst_demo_03: [proxy('https://www.omegawatches.com/media/catalog/product/o/m/omega-speedmaster-moonwatch-professional-chronograph-42-mm-31130423001005-watch-wrist-e997ef.png')],
  lst_demo_04: [proxy('https://feldmarwatch.com/wp-content/uploads/2020/12/311.30.42.30.01.005.jpg')],
}

export const demoSearch: Search = {
  id: 'srch_demo_speedmaster',
  name: 'Omega Speedmaster Professional',
  watchCategory: 'chronograph',
  criteria: {
    modelName: 'Omega Speedmaster Professional',
    referenceNumber: '311.30.42.30.01.005',
    budgetMin: 4000,
    budgetMax: 7000,
    currency: 'EUR',
    acceptableConditions: ['mint', 'very_good', 'good'],
    mustHaves: ['Box & papers preferred', 'Unpolished'],
    dealBreakers: ['Heavy polishing', 'Unknown service history'],
    sellerTypePreference: 'no_preference',
    notes: 'Looking for a complete Moonwatch. Full service docs a plus.',
  },
  status: 'active',
  listingIds: ['lst_demo_01', 'lst_demo_02', 'lst_demo_03', 'lst_demo_04'],
  createdAt: '2026-02-05T10:00:00Z',
  updatedAt: '2026-03-01T09:00:00Z',
}

// Listing order in the array doesn't matter — getDemoRankings() sorts by rank.
export const demoListings: ListingCard[] = [
  // ─── Listing 1: Germany, Chrono24, Private, €4,850 — Questionnaire parsed ──
  {
    id: 'lst_demo_01',
    searchId: 'srch_demo_speedmaster',
    platform: 'chrono24',
    platformListingId: 'c24-demo-7834521',
    url: 'https://www.chrono24.com/omega/speedmaster-professional--id7834521.htm',
    listingLanguage: 'German',
    referenceNumber: { value: '311.30.42.30.01.005', confidence: 'confirmed', source: 'listing title' },
    askingPrice: { value: 4850, confidence: 'confirmed', source: 'listing page' },
    currency: { value: 'EUR', confidence: 'confirmed' },
    shippingCost: { value: 25, confidence: 'confirmed', source: 'seller response', notes: 'DHL insured' },
    conditionRating: { value: 'good', confidence: 'claimed', source: 'seller description' },
    includedItems: {
      value: { box: false, papers: false, extraLinks: null, warrantyCard: false },
      confidence: 'claimed',
      source: 'seller listing',
      notes: 'Watch only — no box or papers',
    },
    sellerWarrantyMonths: { value: null, confidence: 'unknown' },
    returnsPolicy: { value: '14-day return', confidence: 'confirmed', source: 'Chrono24 standard' },
    platformProtection: { value: true, confidence: 'confirmed', source: 'Chrono24 Buyer Protection' },
    photos: DEMO_PHOTOS.lst_demo_01,
    seller: {
      value: {
        name: 'Klaus_Watches_DE',
        type: 'private',
        rating: 4.8,
        reviewCount: 62,
        responseTime: '< 4 hours',
        memberSince: '2019',
      },
      confidence: 'confirmed',
    },
    manufactureYear: { value: null, confidence: 'unknown' },
    // Questionnaire parsed: these fields were populated from seller's German response
    polishingStatus: {
      value: 'unpolished',
      confidence: 'confirmed',
      source: 'Seller questionnaire response',
      notes: '"Nie poliert, alle Oberflächen original"',
    },
    lastServiceYear: { value: 2019, confidence: 'claimed', source: 'Seller questionnaire response' },
    lastServiceType: {
      value: 'full_service',
      confidence: 'claimed',
      source: 'Seller questionnaire response',
      notes: 'Omega authorised service centre',
    },
    partsReplaced: {
      value: [],
      confidence: 'claimed',
      source: 'Seller questionnaire response',
      notes: '"Keine Teile ausgetauscht"',
    },
    braceletSizingInfo: {
      value: 'Sized to 18.5cm, 2 extra half-links included',
      confidence: 'claimed',
      source: 'Seller questionnaire response',
    },
    actualShippingToUser: { value: 25, confidence: 'confirmed', source: 'Seller questionnaire response' },
    allInPrice: 4875,
    valueScore: 72,
    riskScore: 44,
    conditionConfidence: 58,
    addedAt: '2026-02-08T14:00:00Z',
    updatedAt: '2026-02-22T10:00:00Z',
    contactedAt: '2026-02-10T16:00:00Z',
    notes: 'Responsive seller. Service 2019 at Omega AD confirmed via questionnaire. No parts replaced, never polished.',
  },

  // ─── Listing 2: UK, Watchfinder, Dealer, €6,200 — Complete, no questionnaire ─
  {
    id: 'lst_demo_02',
    searchId: 'srch_demo_speedmaster',
    platform: 'watchfinder',
    url: 'https://www.watchfinder.com/omega/speedmaster/listing-demo-12345',
    referenceNumber: { value: '311.30.42.30.01.005', confidence: 'confirmed', source: 'Watchfinder database' },
    askingPrice: { value: 6200, confidence: 'confirmed', source: 'listing page' },
    currency: { value: 'EUR', confidence: 'confirmed' },
    shippingCost: { value: 0, confidence: 'confirmed', source: 'Watchfinder free shipping policy', notes: 'Free insured shipping' },
    conditionRating: { value: 'mint', confidence: 'confirmed', source: 'Watchfinder internal grading' },
    includedItems: {
      value: { box: true, papers: true, extraLinks: true, warrantyCard: true },
      confidence: 'confirmed',
      source: 'Watchfinder listing',
      notes: 'Full set: box, papers, extra links, warranty card',
    },
    sellerWarrantyMonths: { value: 12, confidence: 'confirmed', source: 'Watchfinder standard warranty' },
    returnsPolicy: { value: '14-day return', confidence: 'confirmed', source: 'Watchfinder policy' },
    platformProtection: { value: true, confidence: 'confirmed', source: 'Watchfinder authenticity guarantee' },
    photos: DEMO_PHOTOS.lst_demo_02,
    seller: {
      value: {
        name: 'Watchfinder & Co.',
        type: 'dealer',
        rating: 4.9,
        reviewCount: 14200,
        responseTime: 'Business hours',
        memberSince: '2002',
      },
      confidence: 'confirmed',
    },
    manufactureYear: { value: null, confidence: 'unknown' },
    polishingStatus: {
      value: 'unpolished',
      confidence: 'confirmed',
      source: 'Watchfinder inspection report',
      notes: 'Confirmed unpolished by Watchfinder technician',
    },
    lastServiceYear: { value: 2022, confidence: 'confirmed', source: 'Omega service documents' },
    lastServiceType: { value: 'full_service', confidence: 'confirmed', source: 'Omega service documents' },
    partsReplaced: {
      value: ['Gaskets', 'Crown tube'],
      confidence: 'confirmed',
      source: 'Omega service documents',
    },
    braceletSizingInfo: { value: '3 extra links included, adjusted to 19cm', confidence: 'confirmed' },
    actualShippingToUser: { value: 0, confidence: 'confirmed' },
    allInPrice: 6200,
    valueScore: 71,
    riskScore: 14,
    conditionConfidence: 96,
    addedAt: '2026-02-05T11:00:00Z',
    updatedAt: '2026-02-05T11:00:00Z',
    notes: 'Priciest option but most complete. Full set, 2022 Omega service, confirmed unpolished. Lowest risk.',
  },

  // ─── Listing 3: Japan, eBay, Private, €4,100 — Questionnaire generated (Japanese), not sent ──
  {
    id: 'lst_demo_03',
    searchId: 'srch_demo_speedmaster',
    platform: 'ebay',
    platformListingId: 'eb-demo-394821033',
    url: 'https://www.ebay.com/itm/394821033',
    listingLanguage: 'Japanese',
    referenceNumber: { value: '311.30.42.30.01.005', confidence: 'claimed', source: 'seller title' },
    askingPrice: { value: 4100, confidence: 'confirmed', source: 'eBay listing' },
    currency: { value: 'EUR', confidence: 'confirmed' },
    shippingCost: { value: null, confidence: 'unknown', notes: 'International shipping cost TBC' },
    conditionRating: { value: 'good', confidence: 'claimed', source: 'seller grading' },
    includedItems: {
      value: { box: false, papers: false, extraLinks: null, warrantyCard: false },
      confidence: 'claimed',
      source: 'listing description',
      notes: 'Watch only, no box or papers',
    },
    sellerWarrantyMonths: { value: null, confidence: 'unknown' },
    returnsPolicy: { value: '30-day Money Back Guarantee', confidence: 'confirmed', source: 'eBay Money Back Guarantee' },
    platformProtection: { value: true, confidence: 'confirmed', source: 'eBay Money Back Guarantee' },
    photos: DEMO_PHOTOS.lst_demo_03,
    seller: {
      value: {
        name: 'tokyo_watch_atelier',
        type: 'private',
        rating: null,
        reviewCount: null,
        responseTime: null,
        memberSince: '2021',
      },
      confidence: 'confirmed',
    },
    manufactureYear: { value: null, confidence: 'unknown' },
    polishingStatus: { value: null, confidence: 'unknown' },
    lastServiceYear: { value: null, confidence: 'unknown' },
    lastServiceType: { value: null, confidence: 'unknown' },
    partsReplaced: { value: null, confidence: 'unknown' },
    braceletSizingInfo: { value: null, confidence: 'unknown' },
    actualShippingToUser: { value: null, confidence: 'unknown' },
    allInPrice: null,
    valueScore: 58,
    riskScore: 61,
    conditionConfidence: 38,
    addedAt: '2026-02-15T08:30:00Z',
    updatedAt: '2026-02-15T08:30:00Z',
    notes: 'Cheapest option. Japanese seller — questionnaire generated in Japanese, ready to send.',
  },

  // ─── Listing 4: France, Chrono24, Private, €4,450 — Just added, many unknowns ──
  {
    id: 'lst_demo_04',
    searchId: 'srch_demo_speedmaster',
    platform: 'chrono24',
    platformListingId: 'c24-demo-9012847',
    url: 'https://www.chrono24.com/omega/speedmaster-professional--id9012847.htm',
    listingLanguage: 'French',
    referenceNumber: { value: '311.30.42.30.01.005', confidence: 'claimed', source: 'seller title' },
    askingPrice: { value: 4450, confidence: 'confirmed', source: 'listing page' },
    currency: { value: 'EUR', confidence: 'confirmed' },
    shippingCost: { value: null, confidence: 'unknown' },
    conditionRating: { value: null, confidence: 'unknown' },
    includedItems: { value: null, confidence: 'unknown' },
    sellerWarrantyMonths: { value: null, confidence: 'unknown' },
    returnsPolicy: { value: null, confidence: 'unknown' },
    platformProtection: { value: true, confidence: 'confirmed', source: 'Chrono24 Buyer Protection' },
    photos: DEMO_PHOTOS.lst_demo_04,
    seller: {
      value: {
        name: 'montres_fr_76',
        type: 'private',
        rating: null,
        reviewCount: null,
        responseTime: null,
        memberSince: '2024',
      },
      confidence: 'confirmed',
    },
    manufactureYear: { value: null, confidence: 'unknown' },
    polishingStatus: { value: null, confidence: 'unknown' },
    lastServiceYear: { value: null, confidence: 'unknown' },
    lastServiceType: { value: null, confidence: 'unknown' },
    partsReplaced: { value: null, confidence: 'unknown' },
    braceletSizingInfo: { value: null, confidence: 'unknown' },
    actualShippingToUser: { value: null, confidence: 'unknown' },
    allInPrice: null,
    valueScore: 41,
    riskScore: 79,
    conditionConfidence: 15,
    addedAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-01T09:00:00Z',
    notes: 'Newly added — very sparse listing. Send questionnaire to unlock details.',
  },
]

export interface DemoQuestionnaire {
  language: string
  sellerText: string
  englishText: string
  sellerReply?: string
}

export const demoQuestionnaires: Record<string, DemoQuestionnaire> = {
  lst_demo_01: {
    language: 'German',
    sellerText: `Guten Tag,

vielen Dank für Ihr Angebot des Omega Speedmaster Professional. Ich habe einige Fragen, bevor ich mich entscheide:

1. Wurde die Uhr jemals poliert? Sind alle Originaloberflächen unbehandelt?
2. Wann und wo wurde die Uhr zuletzt gewartet? Von einem Omega Servicecenter?
3. Wurden dabei Teile ausgetauscht (Zeiger, Krone, Glas, usw.)?
4. Wie hoch sind die Versandkosten inkl. Versicherung?

Herzlichen Dank im Voraus.`,
    englishText: `Hello,

Thank you for listing the Omega Speedmaster Professional. I have a few questions before deciding:

1. Has the watch ever been polished? Are all original surfaces untouched?
2. When and where was the watch last serviced? By an Omega service centre?
3. Were any parts replaced during servicing (hands, crown, crystal, etc.)?
4. What are the shipping costs including insurance?

Many thanks in advance.`,
    sellerReply: `Hallo,

danke für Ihre Fragen — hier meine Antworten:

1. Nie poliert. Alle Oberflächen sind original und unbehandelt.
2. Letzte Wartung war 2019 beim offiziellen Omega Servicecenter in München. Die Quittung liegt vor.
3. Es wurden keine Teile ausgetauscht — nur die üblichen Dichtungen im Rahmen der Routinewartung.
4. Versand per DHL Express versichert für €25.

Mit freundlichen Grüßen,
Klaus`,
  },
  lst_demo_03: {
    language: 'Japanese',
    sellerText: `こんにちは、オメガ スピードマスター プロフェッショナルのご出品ありがとうございます。購入を検討しておりますが、以下の点を確認させてください：

1. ケースやブレスレットが研磨されたことはありますか？オリジナルの仕上げは保たれていますか？
2. 最後にオーバーホールを行ったのはいつですか？オメガ正規サービスセンターでしょうか？
3. オーバーホール時に部品の交換（針・竜頭・風防など）はありましたか？
4. 日本からの国際配送は可能ですか？保険込みの送料はいくらですか？

よろしくお願いいたします。`,
    englishText: `Hello,

Thank you for listing this Omega Speedmaster Professional. I'm interested in purchasing it and have a few questions:

1. Has the watch ever been polished? Are the original surfaces preserved?
2. When and where was the watch last serviced? Was it at an authorised Omega service centre?
3. Were any parts replaced during servicing (hands, crown, crystal, etc.)?
4. Is international shipping available, and what is the cost including insurance?

Thank you very much.`,
  },
}

export function getDemoRankings(): RankedListing[] {
  const scores = scoreListings(demoListings)
  const scoreMap = new Map(scores.map((s) => [s.id, s]))
  return demoListings
    .map((listing) => {
      const scored = scoreMap.get(listing.id)!
      return {
        listing,
        rank: scored.rank,
        compositeScore: scored.compositeScore,
        factorScores: scored.factorScores,
        rankDelta: null,
      }
    })
    .sort((a, b) => a.rank - b.rank)
}
