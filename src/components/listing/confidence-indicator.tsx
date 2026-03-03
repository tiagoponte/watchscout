import { DataConfidence } from '@/types'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, Clock, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfidenceIndicatorProps {
  confidence: DataConfidence
  className?: string
}

const config: Record<
  DataConfidence,
  { label: string; icon: React.ElementType; className: string }
> = {
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle,
    className: 'bg-emerald-950 text-emerald-400 border-emerald-800',
  },
  claimed: {
    label: 'Claimed',
    icon: AlertTriangle,
    className: 'bg-orange-950 text-orange-400 border-orange-800',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-blue-950 text-blue-400 border-blue-800',
  },
  unknown: {
    label: 'Unknown',
    icon: HelpCircle,
    className: 'bg-zinc-900 text-zinc-500 border-zinc-700',
  },
}

export function ConfidenceIndicator({ confidence, className }: ConfidenceIndicatorProps) {
  const { label, icon: Icon, className: colorClass } = config[confidence]
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 text-xs font-normal py-0.5', colorClass, className)}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}
