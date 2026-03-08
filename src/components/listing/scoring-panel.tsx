'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScoreBar } from '@/components/searches/score-bar'
import { getScoreColor } from '@/lib/format'
import type { FactorScores } from '@/types'
import { updateScoresAction } from '@/app/(app)/searches/[searchId]/listings/[listingId]/actions'

// Matches WEIGHTS in src/lib/scoring.ts (integers, sum = 100)
const FACTOR_KEYS: { key: keyof FactorScores; label: string; weight: number }[] = [
  { key: 'allInPrice', label: 'All-in Price', weight: 30 },
  { key: 'conditionGrade', label: 'Condition Grade', weight: 15 },
  { key: 'serviceRecency', label: 'Service Recency', weight: 15 },
  { key: 'boxAndPapers', label: 'Box & Papers', weight: 10 },
  { key: 'polishingStatus', label: 'Polishing Status', weight: 10 },
  { key: 'sellerReputation', label: 'Seller Reputation', weight: 8 },
  { key: 'platformProtection', label: 'Platform Protection', weight: 5 },
  { key: 'returnsPolicy', label: 'Returns Policy', weight: 4 },
  { key: 'sellerResponsiveness', label: 'Responsiveness', weight: 3 },
  { key: 'warrantyRemaining', label: 'Warranty Remaining', weight: 0 },
]

const TOTAL_WEIGHT = FACTOR_KEYS.reduce((s, f) => s + f.weight, 0) // 100

function computeComposite(scores: FactorScores): number {
  return Math.round(
    FACTOR_KEYS.reduce((sum, { key, weight }) => sum + scores[key] * weight, 0) / TOTAL_WEIGHT,
  )
}

interface ScoringPanelProps {
  initialFactorScores: FactorScores
  initialCompositeScore: number
  listingId: string
  searchId: string
}

export function ScoringPanel({
  initialFactorScores,
  initialCompositeScore,
  listingId,
  searchId,
}: ScoringPanelProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [scores, setScores] = useState<FactorScores>(initialFactorScores)
  const [savedScores, setSavedScores] = useState<FactorScores>(initialFactorScores)
  const [savedComposite, setSavedComposite] = useState(initialCompositeScore)
  const [isPending, startTransition] = useTransition()

  const liveComposite = isEditing ? computeComposite(scores) : savedComposite
  const displayScores = isEditing ? scores : savedScores

  function handleEdit() {
    setScores(savedScores)
    setIsEditing(true)
  }

  function handleCancel() {
    setScores(savedScores)
    setIsEditing(false)
  }

  function handleSave() {
    const composite = computeComposite(scores)
    startTransition(async () => {
      await updateScoresAction(listingId, searchId, scores, composite)
      setSavedScores(scores)
      setSavedComposite(composite)
      setIsEditing(false)
      router.refresh()
    })
  }

  function setScore(key: keyof FactorScores, value: number) {
    setScores((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-0 text-xs text-zinc-500 uppercase tracking-wider pb-2 border-b border-zinc-800 font-semibold">
        <span>Factor</span>
        <span className="text-right w-12">Weight</span>
        <span className="text-right w-20">Score</span>
      </div>

      {/* Factor rows */}
      {FACTOR_KEYS.map(({ key, label, weight }) => {
        const score = displayScores[key]
        return (
          <div key={key} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4">
            <div>
              <p className="text-sm text-zinc-300">{label}</p>
              {isEditing ? (
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={scores[key]}
                  onChange={(e) => setScore(key, Number(e.target.value))}
                  className="w-full mt-1 h-1.5 rounded-full appearance-none cursor-pointer
                    bg-zinc-800 accent-amber-400"
                />
              ) : (
                <ScoreBar score={score} showLabel={false} className="mt-1" />
              )}
            </div>
            <span className="text-xs text-zinc-600 tabular-nums text-right w-12">
              {weight > 0 ? `${weight}%` : '—'}
            </span>
            <span className={`text-sm font-semibold tabular-nums text-right w-20 ${getScoreColor(score)}`}>
              {isEditing ? scores[key] : score}
            </span>
          </div>
        )
      })}

      {/* Composite + actions */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-700 mt-2">
        <span className="text-sm font-bold text-zinc-200">Composite Score</span>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <span className={`text-xl font-bold tabular-nums ${getScoreColor(liveComposite)}`}>
                {liveComposite}
                <span className="text-sm text-zinc-600 font-normal ml-0.5">/100</span>
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                disabled={isPending}
                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 h-7 px-2"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isPending}
                className="bg-amber-400 text-zinc-950 hover:bg-amber-300 h-7 px-3 font-semibold"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                {isPending ? 'Saving…' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <span className={`text-xl font-bold tabular-nums ${getScoreColor(savedComposite)}`}>
                {savedComposite}
                <span className="text-sm text-zinc-600 font-normal ml-0.5">/100</span>
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 h-7 px-2"
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
