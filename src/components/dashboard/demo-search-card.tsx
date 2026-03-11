import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { WatchIcon } from '@/components/ui/watch-icon'
import { demoSearch, getDemoRankings } from '@/data/demo-hunt'
import { formatCurrency, getScoreColor, getScoreLabel, getRiskColor, getRiskLabel } from '@/lib/format'

export function DemoSearchCard() {
  const rankings = getDemoRankings()
  const topRanked = rankings[0] ?? null
  const topListing = topRanked?.listing ?? null
  const topCurrency = topListing?.currency.value ?? 'EUR'
  const topPrice = topListing != null
    ? (topListing.allInPrice ?? topListing.askingPrice.value)
    : null

  return (
    <Link
      href="/searches/demo"
      className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
    >
      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors h-full">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-3 overflow-hidden">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800 shrink-0 mt-0.5">
                <WatchIcon category="chronograph" className="h-7 w-7 text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-zinc-100 leading-snug line-clamp-2">
                  {demoSearch.name}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs">
                    Sample Hunt
                  </Badge>
                  {demoSearch.criteria.referenceNumber && (
                    <span className="text-xs text-zinc-500 truncate">
                      Ref. {demoSearch.criteria.referenceNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-6 border-t border-zinc-800" />
        <CardContent className="space-y-2.5 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Budget</span>
            <span className="text-zinc-200 tabular-nums font-medium">
              {formatCurrency(demoSearch.criteria.budgetMin, demoSearch.criteria.currency)} –{' '}
              {formatCurrency(demoSearch.criteria.budgetMax, demoSearch.criteria.currency)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Listings</span>
            <span className="text-zinc-200 font-semibold tabular-nums">
              {rankings.length}
            </span>
          </div>

          {topRanked && topListing && (
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
                      <span className={`text-sm font-bold tabular-nums cursor-default ${getScoreColor(topRanked.compositeScore)}`}>
                        {topRanked.compositeScore}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Score out of 100 — combines price, condition,<br />seller trust and more. Higher is better.</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-xs text-zinc-500">{getScoreLabel(topRanked.compositeScore)}</span>
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
                        <p>Risk score — lower is better.</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-xs text-zinc-500">{getRiskLabel(topListing.riskScore)}</span>
                  </div>
                </div>
              )}
            </>
          )}

          <p className="text-xs text-zinc-600 pt-1 border-t border-zinc-800">
            Explore this sample hunt to see how WatchScout works →
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
