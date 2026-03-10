import { prisma } from '@/lib/prisma'
import { Search, SearchCriteria, WatchCategory, SearchStatus } from '@/types'
import type { Search as PrismaSearch, Listing as PrismaListing } from '@/generated/prisma/client'

type SearchWithListings = PrismaSearch & { listings: Pick<PrismaListing, 'id'>[] }

function mapSearch(row: SearchWithListings): Search {
  return {
    id: row.id,
    name: row.name,
    watchCategory: (row.watchCategory as WatchCategory) ?? undefined,
    criteria: row.criteria as unknown as SearchCriteria,
    status: row.status as SearchStatus,
    listingIds: row.listings.map((l: { id: string }) => l.id),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    decidedListingId: row.decidedListingId ?? undefined,
  }
}

export async function getSearches(userId: string): Promise<Search[]> {
  const rows = await prisma.search.findMany({
    where: { userId, status: { not: 'archived' } },
    include: { listings: { select: { id: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(mapSearch)
}

export async function getArchivedSearches(userId: string): Promise<Search[]> {
  const rows = await prisma.search.findMany({
    where: { userId, status: 'archived' },
    include: { listings: { select: { id: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  return rows.map(mapSearch)
}

export async function archiveSearch(searchId: string, userId: string): Promise<void> {
  await prisma.search.updateMany({
    where: { id: searchId, userId },
    data: { status: 'archived' },
  })
}

export async function unarchiveSearch(searchId: string, userId: string): Promise<void> {
  await prisma.search.updateMany({
    where: { id: searchId, userId },
    data: { status: 'active' },
  })
}

export async function deleteSearch(searchId: string, userId: string): Promise<void> {
  await prisma.search.deleteMany({ where: { id: searchId, userId } })
}

export async function getSearch(searchId: string, userId: string): Promise<Search | null> {
  const row = await prisma.search.findFirst({
    where: { id: searchId, userId },
    include: { listings: { select: { id: true } } },
  })
  return row ? mapSearch(row) : null
}

export async function markAsPurchased(searchId: string, listingId: string, userId: string): Promise<void> {
  await prisma.search.updateMany({
    where: { id: searchId, userId },
    data: { status: 'decided', decidedListingId: listingId },
  })
}

export async function unmarkAsPurchased(searchId: string, userId: string): Promise<void> {
  await prisma.search.updateMany({
    where: { id: searchId, userId },
    data: { status: 'active', decidedListingId: null },
  })
}

export async function createSearch(data: {
  userId: string
  name: string
  criteria: SearchCriteria
  watchCategory?: WatchCategory
}): Promise<Search> {
  const id = `srch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const row = await prisma.search.create({
    data: {
      id,
      userId: data.userId,
      name: data.name,
      criteria: data.criteria as object,
      status: 'active',
      watchCategory: data.watchCategory ?? null,
    },
    include: { listings: { select: { id: true } } },
  })
  return mapSearch(row)
}
