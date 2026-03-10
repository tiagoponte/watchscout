export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getSearch } from '@/lib/db/searches'
import { getUserContext } from '@/lib/server/get-user-id'
import { getRankedListings } from '@/lib/db/listings'
import { ListingRow } from '@/components/searches/listing-row'
import { AddListingDialog } from '@/components/searches/add-listing-dialog'
import { formatCurrency } from '@/lib/format'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: Promise<{ searchId: string }>
}

const statusConfig = {
  active:   { label: 'Active',   className: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  paused:   { label: 'Paused',   className: 'bg-zinc-900 text-zinc-400 border-zinc-700' },
  decided:  { label: 'Decided',  className: 'bg-blue-950 text-blue-400 border-blue-800' },
  archived: { label: 'Archived', className: 'bg-zinc-900 text-zinc-500 border-zinc-700' },
}

export default async function SearchPage({ params }: Props) {
  const { searchId } = await params
  const { id: userId } = await getUserContext()
  const search = await getSearch(searchId, userId)
  if (!search) notFound()

  const rankings = await getRankedListings(searchId)
  const status = statusConfig[search.status]
  const { criteria } = search

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-200 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-zinc-100">{search.name}</h1>
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-500 flex-wrap">
            {criteria.referenceNumber && <span>Ref. {criteria.referenceNumber}</span>}
            <span>
              {formatCurrency(criteria.budgetMin, criteria.currency)} –{' '}
              {formatCurrency(criteria.budgetMax, criteria.currency)}
            </span>
            <span>{rankings.length} listings</span>
          </div>
        </div>
        <AddListingDialog searchId={searchId} />
      </div>

      {/* Criteria pills */}
      {(criteria.mustHaves.length > 0 || criteria.dealBreakers.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {criteria.mustHaves.map((item) => (
            <span
              key={item}
              className="text-xs px-2 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-emerald-400"
            >
              ✓ {item}
            </span>
          ))}
          {criteria.dealBreakers.map((item) => (
            <span
              key={item}
              className="text-xs px-2 py-1 rounded-full bg-red-950/40 border border-red-800/50 text-red-400"
            >
              ✗ {item}
            </span>
          ))}
        </div>
      )}

      {/* Listings table */}
      {rankings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-lg border border-zinc-800 text-center">
          <p className="text-zinc-500 mb-4">No listings added yet.</p>
          <AddListingDialog searchId={searchId} />
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          {rankings.map((r) => (
            <ListingRow key={r.listing.id} rankedListing={r} searchId={searchId} decidedListingId={search.decidedListingId} />
          ))}
        </div>
      )}

      {criteria.notes && (
        <p className="text-xs text-zinc-600 italic mt-4 px-1">{criteria.notes}</p>
      )}
    </div>
  )
}
