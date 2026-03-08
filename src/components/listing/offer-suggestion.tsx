'use client'

import { useState } from 'react'
import { Loader2, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import type { OfferSuggestion } from '@/lib/claude'

interface OfferSuggestionPanelProps {
  listingId: string
  searchId: string
  currency: string
}

export function OfferSuggestionPanel({ listingId, searchId, currency }: OfferSuggestionPanelProps) {
  const [suggestion, setSuggestion] = useState<OfferSuggestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, searchId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate')
      setSuggestion(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate offer suggestion')
    } finally {
      setLoading(false)
    }
  }

  if (suggestion) {
    return (
      <div className="mt-4 pt-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Offer Strategy</p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-zinc-900 rounded-md px-3 py-2.5 border border-zinc-800">
            <p className="text-xs text-zinc-600 mb-0.5">Market Value</p>
            <p className="text-sm font-semibold text-zinc-300 tabular-nums">
              {formatCurrency(suggestion.marketValue, currency)}
            </p>
          </div>
          <div className="bg-amber-950/30 rounded-md px-3 py-2.5 border border-amber-800/50">
            <p className="text-xs text-amber-600 mb-0.5">Suggested Offer</p>
            <p className="text-sm font-bold text-amber-400 tabular-nums">
              {formatCurrency(suggestion.suggestedOffer, currency)}
            </p>
          </div>
          <div className="bg-zinc-900 rounded-md px-3 py-2.5 border border-zinc-800">
            <p className="text-xs text-zinc-600 mb-0.5">Floor Offer</p>
            <p className="text-sm font-semibold text-zinc-400 tabular-nums">
              {formatCurrency(suggestion.lowOffer, currency)}
            </p>
          </div>
        </div>
        <p className="text-xs text-zinc-500 italic leading-relaxed">{suggestion.reasoning}</p>
      </div>
    )
  }

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800">
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="shrink-0 w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center">
          {loading
            ? <Loader2 className="h-4 w-4 text-zinc-400 animate-spin" />
            : <TrendingDown className="h-4 w-4 text-amber-400" />}
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-200">
            {loading ? 'Analysing market…' : 'Get offer strategy'}
          </p>
          <p className="text-xs text-zinc-500">
            {loading ? 'Claude is estimating market value' : 'AI estimate of market value and opening offer'}
          </p>
        </div>
      </button>
    </div>
  )
}
