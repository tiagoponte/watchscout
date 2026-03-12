'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PLAN_LIMITS, PLAN_PRICES } from '@/lib/plans'

interface UpgradeDialogProps {
  open: boolean
  onClose: () => void
  reason?: 'LIMIT_SEARCHES' | 'LIMIT_AI'
}

const REASON_COPY: Record<string, string> = {
  LIMIT_SEARCHES: 'You\'ve reached the search limit on your current plan.',
  LIMIT_AI:       'You\'ve used all your AI calls for today on your current plan.',
}

export function UpgradeDialog({ open, onClose, reason }: UpgradeDialogProps) {
  const [loading, setLoading] = useState(false)

  async function upgradePower() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseType: 'power' }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  const { label, price } = PLAN_PRICES.UNLIMITED
  const limits = PLAN_LIMITS.UNLIMITED

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Upgrade to Unlimited</DialogTitle>
          {reason && reason in REASON_COPY && (
            <DialogDescription>{REASON_COPY[reason]}</DialogDescription>
          )}
        </DialogHeader>

        <div className="rounded-lg border border-zinc-800 p-4 flex flex-col gap-3 mt-2">
          <div>
            <p className="font-semibold text-zinc-50">{label}</p>
            <p className="text-amber-400 text-sm font-medium">{price}</p>
          </div>
          <ul className="text-xs text-zinc-400 space-y-1">
            <li>Unlimited searches</li>
            <li>Unlimited listings per search</li>
            <li>{limits.aiCallsPerDay} AI calls/day</li>
            <li>Full questionnaire &amp; scoring</li>
          </ul>
          <Button
            className="w-full bg-amber-400 text-zinc-950 hover:bg-amber-300"
            disabled={loading}
            onClick={upgradePower}
          >
            {loading ? 'Redirecting…' : `Get ${label}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
