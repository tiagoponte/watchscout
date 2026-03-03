import { prisma } from '@/lib/prisma'
import { ListingCard, RankedListing, FactorScores, Platform } from '@/types'
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
