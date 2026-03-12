'use client'

import { useState } from 'react'
import { Unlock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  searchId: string
}

export function UnlockHuntBanner({ searchId }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleUnlock() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseType: 'hunt', searchId }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-amber-400/30 bg-amber-950/20 p-5 mb-6">
      <div className="flex items-start gap-3">
        <Unlock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-zinc-100 mb-1">Your shortlist is ready to go deeper.</p>
          <p className="text-sm text-zinc-400 mb-4">
            Unlock this hunt for €24.99 — one-time, no subscription. Get 15 listings and 50 AI interactions to find the right watch.
          </p>
          <Button
            onClick={handleUnlock}
            disabled={loading}
            className="bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold"
          >
            {loading ? 'Redirecting…' : 'Unlock this hunt →'}
          </Button>
        </div>
      </div>
    </div>
  )
}
