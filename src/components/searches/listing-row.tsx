'use client'

import Image from 'next/image'
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, ImageOff, MoreHorizontal, ShoppingBag, Trash2, Undo2 } from 'lucide-react'
import { RankedListing } from '@/types'
import { RankBadge } from './rank-badge'
import { ScoreBar } from './score-bar'
import { ConfidenceIndicator } from '@/components/listing/confidence-indicator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { formatCurrency, getPlatformLabel, getScoreColor } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { deleteListingAction, markAsPurchasedAction, unmarkAsPurchasedAction } from '@/app/(app)/searches/[searchId]/actions'

interface ListingRowProps {
  rankedListing: RankedListing
  searchId: string
  decidedListingId?: string
}

const conditionLabels: Record<string, string> = {
  mint: 'Mint',
  very_good: 'Very Good',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}

export function ListingRow({ rankedListing, searchId, decidedListingId }: ListingRowProps) {
  const { listing, rank, compositeScore, rankDelta } = rankedListing
  const price = listing.askingPrice.value
  const currency = listing.currency.value ?? 'EUR'
  const router = useRouter()
  const [imgError, setImgError] = React.useState(false)
  const href = `/searches/${searchId}/listings/${listing.id}`
  const isPurchased = decidedListingId === listing.id

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Remove this listing from your search?')) return
    await deleteListingAction(listing.id, searchId)
    router.refresh()
  }

  async function handleMarkPurchased(e: React.MouseEvent) {
    e.stopPropagation()
    await markAsPurchasedAction(listing.id, searchId)
    router.refresh()
  }

  async function handleUnmark(e: React.MouseEvent) {
    e.stopPropagation()
    await unmarkAsPurchasedAction(searchId)
    router.refresh()
  }

  return (
    <Link
      href={href}
      data-testid="listing-row"
      className={`group flex items-center gap-4 px-4 py-3.5 border-b border-zinc-800 hover:bg-zinc-900 transition-colors ${isPurchased ? 'bg-amber-950/20 border-l-2 border-l-amber-400' : ''}`}
    >
      {/* Rank + thumbnail — compound identity unit */}
      <div className="flex items-center gap-2 shrink-0">
        <RankBadge rank={rank} delta={rankDelta} />
        <div className="w-12 h-12 rounded-md overflow-hidden bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-800">
          {listing.photos.length > 0 && !imgError ? (
            <Image
              src={listing.photos[listing.thumbnailPhotoIndex ?? 0]}
              alt="Listing thumbnail"
              width={48}
              height={48}
              className="object-contain w-full h-full"
              unoptimized
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center border border-dashed border-zinc-700 rounded-md bg-zinc-900">
              <ImageOff className="h-4 w-4 text-zinc-600" />
            </div>
          )}
        </div>
      </div>

      {/* Platform + seller + price (price shown inline on mobile only) */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-zinc-900 border-zinc-700 text-zinc-400 shrink-0">
            {getPlatformLabel(listing.platform)}
          </Badge>
          {isPurchased && (
            <Badge variant="outline" className="text-xs bg-amber-950/40 border-amber-700/50 text-amber-400 shrink-0">
              Purchased
            </Badge>
          )}
          <span className="text-xs text-zinc-500 truncate hidden sm:inline">
            {listing.referenceNumber.value ? `Ref. ${listing.referenceNumber.value}` : ''}
          </span>
        </div>
        <p className="text-sm text-zinc-200 font-medium mt-0.5 truncate">
          {listing.seller.value?.name ?? 'Unknown seller'}
          {listing.seller.value?.type === 'dealer' && (
            <span className="text-xs text-zinc-500 ml-1.5 font-normal">Dealer</span>
          )}
        </p>
        {/* Price inline on mobile */}
        <p className="text-xs text-zinc-400 tabular-nums mt-0.5 sm:hidden">
          {price != null ? formatCurrency(price, currency) : '—'}
          {listing.allInPrice && listing.allInPrice !== price && (
            <span className="text-zinc-600"> · {formatCurrency(listing.allInPrice, currency)} all-in</span>
          )}
        </p>
      </div>

      {/* Condition — md+ only */}
      <div className="hidden md:block w-24 shrink-0">
        <p className="text-xs text-zinc-500 mb-0.5">Condition</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm text-zinc-300">
            {listing.conditionRating.value ? conditionLabels[listing.conditionRating.value] : '—'}
          </span>
          <ConfidenceIndicator confidence={listing.conditionRating.confidence} />
        </div>
      </div>

      {/* Price — sm+ only */}
      <div className="hidden sm:block w-28 shrink-0 text-right">
        <p className="text-xs text-zinc-500 mb-0.5">Price</p>
        <p className="text-sm text-zinc-100 font-semibold tabular-nums">
          {price != null ? formatCurrency(price, currency) : '—'}
        </p>
        {listing.allInPrice && listing.allInPrice !== price && (
          <p className="text-xs text-zinc-500 tabular-nums">
            {formatCurrency(listing.allInPrice, currency)} all-in
          </p>
        )}
      </div>

      {/* Score — number only on mobile, bars on md+ */}
      <div className="shrink-0">
        <div className="sm:hidden">
          <span className={`text-sm font-bold tabular-nums ${getScoreColor(compositeScore)}`}>
            {compositeScore}
          </span>
        </div>
        <div className="hidden sm:block w-24">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-default">
                <p className="text-xs text-zinc-500 mb-1">Score</p>
                <ScoreBar score={compositeScore} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Score out of 100 — combines price, condition,<br />seller trust and more. Higher is better.</p>
            </TooltipContent>
          </Tooltip>
          {listing.riskScore != null && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="mt-2 cursor-default">
                  <p className="text-xs text-zinc-500 mb-1">Risk</p>
                  <ScoreBar score={listing.riskScore} variant="risk" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Risk score out of 100 — lower is better.<br />Measures seller trust, platform protection<br />and listing red flags.</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Actions + arrow */}
      <div className="flex items-center shrink-0 -mr-2">
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Listing actions"
                className="h-8 w-8 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isPurchased ? (
                <DropdownMenuItem className="cursor-pointer" onClick={handleUnmark}>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Unmark as purchased
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="cursor-pointer" onClick={handleMarkPurchased}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Mark as purchased
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-400 focus:text-red-400 focus:bg-red-950/40 cursor-pointer"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove listing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-zinc-400 transition-colors p-0 mr-0" />
      </div>
    </Link>
  )
}
