'use client'

import { useState } from 'react'
import { Check, Link as LinkIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateListingUrlAction } from '@/app/(app)/searches/[searchId]/listings/[listingId]/actions'

interface ListingSourceLinkProps {
  listingId: string
  searchId: string
}

/**
 * Shown on screenshot listings (no URL). Renders an "Add source URL" text prompt
 * in the listing header; expands inline to a paste input on click.
 */
export function ListingSourceLink({ listingId, searchId }: ListingSourceLinkProps) {
  const [saved, setSaved] = useState(false)
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
    setSaved(true)
    setEditing(false)
    setSaving(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') { setEditing(false); setError(false) }
  }

  if (saved) return null

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 mt-1">
        <Input
          autoFocus
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false) }}
          onKeyDown={handleKeyDown}
          placeholder="Paste listing URL…"
          className={`h-7 text-xs w-52 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-600 ${error ? 'border-red-500' : ''}`}
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
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1 mt-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
    >
      <LinkIcon className="h-3 w-3" />
      Add source URL
    </button>
  )
}
