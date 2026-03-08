'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PLAN_LIMITS, PLAN_PRICES } from '@/lib/plans'

interface UpgradeDialogProps {
  open: boolean
  onClose: () => void
  reason?: 'LIMIT_SEARCHES' | 'LIMIT_LISTINGS' | 'LIMIT_AI'
}

const REASON_COPY: Record<string, string> = {
  LIMIT_SEARCHES:  'You\'ve reached the search limit on your current plan.',
  LIMIT_LISTINGS:  'You\'ve reached the listing limit per search on your current plan.',
  LIMIT_AI:        'You\'ve used all your AI calls for today on your current plan.',
}

export function UpgradeDialog({ open, onClose, reason }: UpgradeDialogProps) {
  const [loading, setLoading] = useState<'SCOUT' | 'PRO' | null>(null)

  async function upgrade(tier: 'SCOUT' | 'PRO') {
    setLoading(tier)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade your plan</DialogTitle>
          {reason && (
            <DialogDescription>{REASON_COPY[reason]}</DialogDescription>
          )}
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-2">
          {(['SCOUT', 'PRO'] as const).map((tier) => {
            const { label, price } = PLAN_PRICES[tier]
            const limits = PLAN_LIMITS[tier]
            return (
              <div key={tier} className="rounded-lg border border-zinc-800 p-4 flex flex-col gap-3">
                <div>
                  <p className="font-semibold text-zinc-50">{label}</p>
                  <p className="text-amber-400 text-sm font-medium">{price}</p>
                </div>
                <ul className="text-xs text-zinc-400 space-y-1 flex-1">
                  <li>{limits.searches === Infinity ? 'Unlimited' : limits.searches} searches</li>
                  <li>{limits.listingsPerSearch === Infinity ? 'Unlimited' : limits.listingsPerSearch} listings/search</li>
                  <li>{limits.aiCallsPerDay} AI calls/day</li>
                </ul>
                <Button
                  size="sm"
                  className="w-full bg-amber-400 text-zinc-950 hover:bg-amber-300"
                  disabled={!!loading}
                  onClick={() => upgrade(tier)}
                >
                  {loading === tier ? 'Redirecting…' : `Get ${label}`}
                </Button>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
