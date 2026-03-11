import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ListingRow } from '@/components/searches/listing-row'
import { formatCurrency } from '@/lib/format'
import { demoSearch, getDemoRankings } from '@/data/demo-hunt'

export default function DemoSearchPage() {
  const rankings = getDemoRankings()

  return (
    <div className="max-w-4xl mx-auto">
      {/* Demo CTA banner */}
      <div className="flex items-center justify-between gap-4 mb-5 px-4 py-3 rounded-lg border border-amber-800/50 bg-amber-950/20">
        <p className="text-sm text-amber-300/80">
          Sample hunt — explore how WatchScout works before starting your own.
        </p>
        <Button
          asChild
          size="sm"
          className="bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold shrink-0"
        >
          <Link href="/searches/new">Start your own hunt →</Link>
        </Button>
      </div>

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
            <h1 className="text-2xl font-bold text-zinc-100">{demoSearch.name}</h1>
            <Badge variant="outline" className="bg-emerald-950 text-emerald-400 border-emerald-800">
              Active
            </Badge>
            <Badge variant="outline" className="bg-zinc-900 text-zinc-400 border-zinc-700 text-xs">
              Sample
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-500 flex-wrap">
            {demoSearch.criteria.referenceNumber && (
              <span>Ref. {demoSearch.criteria.referenceNumber}</span>
            )}
            <span>
              {formatCurrency(demoSearch.criteria.budgetMin, demoSearch.criteria.currency)} –{' '}
              {formatCurrency(demoSearch.criteria.budgetMax, demoSearch.criteria.currency)}
            </span>
            <span>{rankings.length} listings</span>
          </div>
        </div>
        {/* No AddListingDialog in demo mode */}
      </div>

      {/* Criteria pills */}
      {(demoSearch.criteria.mustHaves.length > 0 || demoSearch.criteria.dealBreakers.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {demoSearch.criteria.mustHaves.map((item) => (
            <span
              key={item}
              className="text-xs px-2 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-emerald-400"
            >
              ✓ {item}
            </span>
          ))}
          {demoSearch.criteria.dealBreakers.map((item) => (
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
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        {rankings.map((r) => (
          <ListingRow key={r.listing.id} rankedListing={r} searchId="demo" isDemo />
        ))}
      </div>

      {demoSearch.criteria.notes && (
        <p className="text-xs text-zinc-600 italic mt-4 px-1">{demoSearch.criteria.notes}</p>
      )}
    </div>
  )
}
