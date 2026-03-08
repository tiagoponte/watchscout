import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { ListingCard, RankedListing, FactorScores, Platform } from '@/types'
import type { ExtractedListing, ParsedSellerResponse } from '@/lib/claude'
import { scoreListings } from '@/lib/scoring'
import type { Listing as PrismaListing } from '@/generated/prisma/client'

// Prisma returns Json fields as JsonValue — cast through unknown to reach our typed shapes
function j<T>(v: unknown): T { return v as T }

function mapListing(row: PrismaListing): ListingCard {
  return {
    id: row.id,
    searchId: row.searchId,
    platform: row.platform as Platform,
    platformListingId: row.platformListingId ?? undefined,
    url: row.url ?? undefined,
    referenceNumber: j<ListingCard['referenceNumber']>(row.referenceNumber),
    askingPrice: j<ListingCard['askingPrice']>(row.askingPrice),
    currency: j<ListingCard['currency']>(row.currency),
    shippingCost: j<ListingCard['shippingCost']>(row.shippingCost),
    conditionRating: j<ListingCard['conditionRating']>(row.conditionRating),
    includedItems: j<ListingCard['includedItems']>(row.includedItems),
    sellerWarrantyMonths: j<ListingCard['sellerWarrantyMonths']>(row.sellerWarrantyMonths),
    returnsPolicy: j<ListingCard['returnsPolicy']>(row.returnsPolicy),
    platformProtection: j<ListingCard['platformProtection']>(row.platformProtection),
    photos: row.photos,
    thumbnailPhotoIndex: row.thumbnailPhotoIndex ?? undefined,
    seller: j<ListingCard['seller']>(row.seller),
    manufactureYear: row.manufactureYear
      ? j<ListingCard['manufactureYear']>(row.manufactureYear)
      : { value: null, confidence: 'unknown' as const },
    listingLanguage: row.listingLanguage ?? null,
    braceletType: row.braceletType ?? null,
    polishingStatus: j<ListingCard['polishingStatus']>(row.polishingStatus),
    lastServiceYear: j<ListingCard['lastServiceYear']>(row.lastServiceYear),
    lastServiceType: j<ListingCard['lastServiceType']>(row.lastServiceType),
    partsReplaced: j<ListingCard['partsReplaced']>(row.partsReplaced),
    braceletSizingInfo: j<ListingCard['braceletSizingInfo']>(row.braceletSizingInfo),
    actualShippingToUser: j<ListingCard['actualShippingToUser']>(row.actualShippingToUser),
    allInPrice: row.allInPrice,
    valueScore: row.valueScore,
    riskScore: row.riskScore,
    conditionConfidence: row.conditionConfidence,
    addedAt: row.addedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    contactedAt: row.contactedAt?.toISOString(),
    notes: row.notes ?? undefined,
  }
}

function mapRankedListing(row: PrismaListing): RankedListing {
  return {
    listing: mapListing(row),
    rank: row.rank!,
    compositeScore: row.compositeScore!,
    factorScores: row.factorScores as unknown as FactorScores,
    rankDelta: row.rankDelta,
  }
}

export async function getRankedListings(searchId: string): Promise<RankedListing[]> {
  const rows = await prisma.listing.findMany({
    where: { searchId, rank: { not: null } },
    orderBy: { rank: 'asc' },
  })
  return rows.map(mapRankedListing)
}

export async function getListing(
  searchId: string,
  listingId: string
): Promise<RankedListing | null> {
  const row = await prisma.listing.findFirst({
    where: { id: listingId, searchId },
  })
  if (!row || row.rank === null) return null
  return mapRankedListing(row)
}

export async function deleteListing(listingId: string, searchId: string): Promise<void> {
  await prisma.listing.delete({ where: { id: listingId, searchId } })
}

const pending = { value: null, confidence: 'pending' as const }

export async function createListing(
  searchId: string,
  url: string | undefined,
  extracted: ExtractedListing,
): Promise<ListingCard> {
  const id = randomUUID()
  const row = await prisma.listing.create({
    data: {
      id,
      searchId,
      url: url ?? null,
      platform: extracted.platform,
      platformListingId: extracted.platformListingId ?? null,
      referenceNumber: extracted.referenceNumber as object,
      askingPrice: extracted.askingPrice as object,
      currency: extracted.currency as object,
      shippingCost: extracted.shippingCost as object,
      conditionRating: extracted.conditionRating as object,
      includedItems: extracted.includedItems as object,
      sellerWarrantyMonths: extracted.sellerWarrantyMonths as object,
      returnsPolicy: extracted.returnsPolicy as object,
      platformProtection: extracted.platformProtection as object,
      photos: extracted.photos,
      seller: extracted.seller as object,
      manufactureYear: extracted.manufactureYear as object,
      listingLanguage: extracted.listingLanguage ?? null,
      braceletType: extracted.braceletType ?? null,
      // To be discovered — all pending
      polishingStatus: pending as object,
      lastServiceYear: pending as object,
      lastServiceType: pending as object,
      partsReplaced: pending as object,
      braceletSizingInfo: pending as object,
      actualShippingToUser: pending as object,
      // Calculated
      allInPrice: (extracted.askingPrice.value ?? 0) + (extracted.shippingCost.value ?? 0) || null,
    },
  })
  return mapListing(row)
}

export async function markContacted(listingId: string, searchId: string): Promise<void> {
  await prisma.listing.updateMany({
    where: { id: listingId, searchId, contactedAt: null },
    data: { contactedAt: new Date() },
  })
}

export async function updateListingFromQuestionnaire(
  listingId: string,
  searchId: string,
  parsed: ParsedSellerResponse,
): Promise<ListingCard> {
  const current = await prisma.listing.findFirst({ where: { id: listingId, searchId } })
  if (!current) throw new Error('Listing not found')

  const askingPrice = j<ListingCard['askingPrice']>(current.askingPrice)
  const newShipping = parsed.actualShippingToUser.value

  const row = await prisma.listing.update({
    where: { id: listingId },
    data: {
      polishingStatus: parsed.polishingStatus as object,
      lastServiceYear: parsed.lastServiceYear as object,
      lastServiceType: parsed.lastServiceType as object,
      partsReplaced: parsed.partsReplaced as object,
      braceletSizingInfo: parsed.braceletSizingInfo as object,
      actualShippingToUser: parsed.actualShippingToUser as object,
      ...(newShipping != null && {
        allInPrice: (askingPrice.value ?? 0) + newShipping || null,
      }),
    },
  })
  return mapListing(row)
}

export async function updateFactorScores(
  listingId: string,
  searchId: string,
  factorScores: FactorScores,
  compositeScore: number,
): Promise<void> {
  await prisma.listing.update({
    where: { id: listingId, searchId },
    data: { factorScores: factorScores as object, compositeScore },
  })
}

export async function rerankByCompositeScore(searchId: string): Promise<void> {
  const rows = await prisma.listing.findMany({
    where: { searchId, compositeScore: { not: null } },
    orderBy: { compositeScore: 'desc' },
    select: { id: true, rank: true },
  })
  if (rows.length === 0) return

  await Promise.all(
    rows.map((row, i) =>
      prisma.listing.update({
        where: { id: row.id },
        data: { rank: i + 1, rankDelta: null },
      }),
    ),
  )
}

export async function rerankListings(searchId: string): Promise<void> {
  const rows = await prisma.listing.findMany({ where: { searchId } })
  if (rows.length === 0) return

  const listings = rows.map(mapListing)
  const scored = scoreListings(listings)

  await Promise.all(
    scored.map((s) =>
      prisma.listing.update({
        where: { id: s.id },
        data: {
          rank: s.rank,
          compositeScore: s.compositeScore,
          factorScores: s.factorScores as object,
          rankDelta: null,
        },
      }),
    ),
  )
}
