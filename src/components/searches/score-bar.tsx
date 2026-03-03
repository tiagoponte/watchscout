import { cn } from '@/lib/utils'

interface ScoreBarProps {
  score: number
  variant?: 'value' | 'risk'
  showLabel?: boolean
  className?: string
}

function barColor(score: number, variant: 'value' | 'risk'): string {
  if (variant === 'risk') {
    if (score <= 25) return 'bg-emerald-500'
    if (score <= 50) return 'bg-amber-400'
    return 'bg-red-500'
  }
  if (score >= 75) return 'bg-emerald-500'
  if (score >= 50) return 'bg-amber-400'
  return 'bg-red-500'
}

function labelColor(score: number, variant: 'value' | 'risk'): string {
  if (variant === 'risk') {
    if (score <= 25) return 'text-emerald-400'
    if (score <= 50) return 'text-amber-400'
    return 'text-red-400'
  }
  if (score >= 75) return 'text-emerald-400'
  if (score >= 50) return 'text-amber-400'
  return 'text-red-400'
}

export function ScoreBar({ score, variant = 'value', showLabel = true, className }: ScoreBarProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', barColor(score, variant))}
          style={{ width: `${score}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn('text-xs font-semibold tabular-nums w-6 text-right', labelColor(score, variant))}>
          {Math.round(score)}
        </span>
      )}
    </div>
  )
}
