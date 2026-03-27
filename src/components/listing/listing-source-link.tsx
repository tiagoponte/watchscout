'use client'

import { useState } from 'react'
import { Check, ExternalLink, Link as LinkIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getPlatformLabel } from '@/lib/format'
import type { Platform } from '@/types'
import { updateListingUrlAction } from '@/app/(app)/searches/[searchId]/listings/[listingId]/actions'

interface ListingSourceLinkProps {
  listingId: string
  searchId: string
  platform: Platform
  url?: string
  isDemo?: boolean
}

export function ListingSourceLink({ listingId, searchId, platform, url: initialUrl, isDemo }: ListingSourceLinkProps) {
  const [url, setUrl] = useState(initialUrl)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  async function handleSave() {
    const trimmed = input.trim()
    if (!trimmed) return
    try { new URL(trimmed) } catch { setError(true); return }
    setSaving(true)
    setError(false)
    await updateListingUrlAction(listingId, searchId, trimmed)
    setUrl(trimmed)
    setEditing(false)
    setSaving(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') { setEditing(false); setError(false) }
  }

  if (url) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-zinc-500 hover:text-amber-400 hover:bg-transparent transition-colors"
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View listing on ${getPlatformLabel(platform)}`}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>View on {getPlatformLabel(platform)}</p></TooltipContent>
      </Tooltip>
    )
  }

  if (isDemo) return null

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          autoFocus
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false) }}
          onKeyDown={handleKeyDown}
          placeholder="Paste listing URL…"
          className={`h-7 text-xs w-48 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-600 ${error ? 'border-red-500' : ''}`}
          disabled={saving}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-emerald-400 hover:text-emerald-300 hover:bg-transparent"
          onClick={handleSave}
          disabled={saving || !input.trim()}
          aria-label="Save URL"
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-500 hover:text-zinc-300 hover:bg-transparent"
          onClick={() => { setEditing(false); setError(false) }}
          aria-label="Cancel"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-700 hover:text-zinc-400 hover:bg-transparent transition-colors"
          onClick={() => setEditing(true)}
          aria-label="Add source URL"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent><p>Add source URL</p></TooltipContent>
    </Tooltip>
  )
}
