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
    where: { userId },
    include: { listings: { select: { id: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(mapSearch)
}

export async function getSearch(searchId: string, userId: string): Promise<Search | null> {
  const row = await prisma.search.findFirst({
    where: { id: searchId, userId },
    include: { listings: { select: { id: true } } },
  })
  return row ? mapSearch(row) : null
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
