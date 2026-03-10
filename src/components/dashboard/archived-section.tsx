'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { SearchCard } from './search-card'
import type { Search, RankedListing } from '@/types'

interface ArchivedSectionProps {
  searches: { search: Search; topRankedListing: RankedListing | null }[]
}

export function ArchivedSection({ searches }: ArchivedSectionProps) {
  const [open, setOpen] = useState(false)

  if (searches.length === 0) return null

  return (
    <div className="mt-10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider hover:text-zinc-300 transition-colors mb-4"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        Archived ({searches.length})
      </button>

      {open && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {searches.map(({ search, topRankedListing }) => (
            <SearchCard
              key={search.id}
              search={search}
              topRankedListing={topRankedListing}
            />
          ))}
        </div>
      )}
    </div>
  )
}
