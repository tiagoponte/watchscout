import { cn } from '@/lib/utils'

interface RankBadgeProps {
  rank: number
  delta?: number | null
  className?: string
}

function rankStyle(rank: number): string {
  if (rank === 1) return 'bg-amber-400/10 text-amber-400 border-amber-400/30'
  if (rank === 2) return 'bg-zinc-400/10 text-zinc-300 border-zinc-500/30'
  if (rank === 3) return 'bg-orange-900/20 text-orange-400 border-orange-700/30'
  return 'bg-zinc-900 text-zinc-500 border-zinc-700'
}

export function RankBadge({ rank, className }: RankBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-8 h-8 rounded-full border text-sm font-bold tabular-nums',
        rankStyle(rank),
        className
      )}
    >
      {rank}
    </span>
  )
}
