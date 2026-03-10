import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchCard } from '@/components/dashboard/search-card'
import { EmptyState } from '@/components/dashboard/empty-state'
import { UpgradeBanner } from '@/components/dashboard/upgrade-banner'
import { ArchivedSection } from '@/components/dashboard/archived-section'
export const dynamic = 'force-dynamic'

import { getSearches, getArchivedSearches } from '@/lib/db/searches'
import { getRankedListings } from '@/lib/db/listings'
import { getUserContext } from '@/lib/server/get-user-id'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>
}) {
  const { id: userId } = await getUserContext()
  const { upgraded } = await searchParams
  const [searches, archivedSearches] = await Promise.all([
    getSearches(userId),
    getArchivedSearches(userId),
  ])
  const searchesWithRankings = await Promise.all(
    searches.map(async (search) => {
      const rankings = await getRankedListings(search.id)
      return { search, rankings }
    })
  )
  const archivedWithRankings = await Promise.all(
    archivedSearches.map(async (search) => {
      const rankings = await getRankedListings(search.id)
      return { search, topRankedListing: rankings[0] ?? null }
    })
  )

  return (
    <div className="max-w-5xl mx-auto">
      {upgraded === '1' && <UpgradeBanner />}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {searches.length} active {searches.length === 1 ? 'search' : 'searches'}
          </p>
        </div>
        <Button asChild className="bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold">
          <Link href="/searches/new">
            <Plus className="h-4 w-4 mr-1.5" />
            New Search
          </Link>
        </Button>
      </div>

      {searchesWithRankings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {searchesWithRankings.map(({ search, rankings }) => {
            const topRankedListing = rankings[0] ?? null
            const contactedCount = rankings.filter((r) => r.listing.contactedAt).length
            const decidedListing = search.decidedListingId
              ? rankings.find((r) => r.listing.id === search.decidedListingId) ?? null
              : null
            return (
              <SearchCard
                key={search.id}
                search={search}
                topRankedListing={topRankedListing}
                decidedListing={decidedListing}
                contactedCount={contactedCount}
              />
            )
          })}
        </div>
      )}

      <ArchivedSection searches={archivedWithRankings} />
    </div>
  )
}
