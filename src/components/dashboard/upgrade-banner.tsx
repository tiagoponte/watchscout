'use client'

import { useState } from 'react'
import { CheckCircle, X } from 'lucide-react'

export function UpgradeBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 text-sm">
      <CheckCircle className="h-4 w-4 shrink-0 text-amber-400" />
      <span className="flex-1">Your plan has been upgraded. Enjoy your new limits!</span>
      <button onClick={() => setDismissed(true)} className="text-amber-400/60 hover:text-amber-400">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
