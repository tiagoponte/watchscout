import Link from 'next/link'
import { Search as SearchIcon, ChevronRight, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { WatchIcon } from '@/components/ui/watch-icon'
import { Search, RankedListing } from '@/types'
import { formatCurrency, formatRelativeDate, getScoreColor, getScoreLabel, getRiskColor, getRiskLabel } from '@/lib/format'

interface SearchCardProps {
  search: Search
  topRankedListing?: RankedListing | null
  contactedCount?: number
}

const statusConfig = {
  active: { label: 'Active', className: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  paused: { label: 'Paused', className: 'bg-zinc-900 text-zinc-400 border-zinc-700' },
  decided: { label: 'Decided', className: 'bg-blue-950 text-blue-400 border-blue-800' },
}

export function SearchCard({ search, topRankedListing, contactedCount = 0 }: SearchCardProps) {
  const status = statusConfig[search.status]
  const { criteria } = search
  const totalListings = search.listingIds.length
  const topListing = topRankedListing?.listing ?? null
  const topCurrency = topListing?.currency.value ?? 'EUR'
  const topPrice = topListing != null
    ? (topListing.allInPrice ?? topListing.askingPrice.value)
    : null

  return (
    <Link href={`/searches/${search.id}`} className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">
      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-800 shrink-0">
                {search.watchCategory
                  ? <WatchIcon category={search.watchCategory} className="h-10 w-10 text-amber-400" />
                  : <SearchIcon className="h-5 w-5 text-amber-400" />
                }
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-zinc-100 truncate">{search.name}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                  {criteria.referenceNumber && (
                    <span className="text-xs text-zinc-500">Ref. {criteria.referenceNumber}</span>
                  )}
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-zinc-400 transition-colors shrink-0" />
          </div>
        </CardHeader>
        <div className="mx-6 border-t border-zinc-800" />
        <CardContent className="space-y-2.5 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Budget</span>
            <span className="text-zinc-200 tabular-nums font-medium">
              {formatCurrency(criteria.budgetMin, criteria.currency)} –{' '}
              {formatCurrency(criteria.budgetMax, criteria.currency)}
            </span>
          </div>

          {/* Progress summary — Marco #2 */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Listings</span>
            <span className="tabular-nums">
              <span className="text-zinc-200 font-semibold">{totalListings}</span>
              {contactedCount > 0 && (
                <span className="text-zinc-500 font-normal">
                  {' · '}{contactedCount} contacted
                </span>
              )}
            </span>
          </div>

          {/* Top pick — price + trust + score + label */}
          {topRankedListing && topListing && (
            <>
              <div className="flex items-center justify-between text-sm pt-0.5">
                <span className="text-zinc-500">Top pick</span>
                <div className="flex items-center gap-1.5">
                  {topListing.platformProtection.value && (
                    <Shield className="h-3 w-3 text-emerald-500 shrink-0" />
                  )}
                  <span className="text-zinc-300 text-xs tabular-nums">
                    {topPrice != null ? formatCurrency(topPrice, topCurrency) : '—'}
                  </span>
                  <span className="text-zinc-700">·</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={`text-sm font-bold tabular-nums cursor-default ${getScoreColor(topRankedListing.compositeScore)}`}>
                        {topRankedListing.compositeScore}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Score out of 100 — combines price, condition,<br />seller trust and more. Higher is better.</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-xs text-zinc-500">{getScoreLabel(topRankedListing.compositeScore)}</span>
                </div>
              </div>
              {topListing.riskScore != null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Risk</span>
                  <div className="flex items-center gap-1.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`text-sm font-semibold tabular-nums cursor-default ${getRiskColor(topListing.riskScore)}`}>
                          {topListing.riskScore}
                          <span className="text-xs text-zinc-600 font-normal ml-0.5">/100</span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Risk score — lower is better. Measures seller trust,<br />platform protection and listing red flags.</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-xs text-zinc-500">{getRiskLabel(topListing.riskScore)}</span>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Updated</span>
            <span className="text-zinc-400">{formatRelativeDate(search.updatedAt)}</span>
          </div>

          {search.criteria.notes && (
            <p className="text-xs text-zinc-400 pt-1 border-t border-zinc-800 line-clamp-2">
              {search.criteria.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
