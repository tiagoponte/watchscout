import { DataConfidence } from '@/types'
import { ConfidenceIndicator } from './confidence-indicator'

interface DataFieldProps {
  label: string
  value: React.ReactNode
  confidence: DataConfidence
  notes?: string
  className?: string
}

export function DataField({ label, value, confidence, notes, className }: DataFieldProps) {
  return (
    <div className={`flex items-start justify-between gap-4 py-2.5 border-b border-zinc-800 last:border-0 ${className ?? ''}`}>
      <div className="min-w-0">
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm text-zinc-100">
          {value ?? <span className="text-zinc-600 italic">—</span>}
        </p>
        {notes && <p className="text-xs text-zinc-500 mt-0.5 italic">{notes}</p>}
      </div>
      <div className="shrink-0 mt-0.5">
        <ConfidenceIndicator confidence={confidence} />
      </div>
    </div>
  )
}
