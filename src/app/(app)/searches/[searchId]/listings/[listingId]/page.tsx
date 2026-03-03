export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getSearch } from '@/lib/db/searches'
import { getUserContext } from '@/lib/server/get-user-id'
import { getListing } from '@/lib/db/listings'
import { IntelligenceCard } from '@/components/listing/intelligence-card'

interface Props {
  params: Promise<{ searchId: string; listingId: string }>
}

export default async function ListingPage({ params }: Props) {
  const { searchId, listingId } = await params
  const { id: userId } = await getUserContext()
  const search = await getSearch(searchId, userId)
  if (!search) notFound()

  const rankedListing = await getListing(searchId, listingId)
  if (!rankedListing) notFound()

  return <IntelligenceCard rankedListing={rankedListing} searchId={searchId} watchName={search.name} />
}
