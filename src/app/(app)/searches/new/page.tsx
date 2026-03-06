'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const CONDITIONS = [
  { value: 'mint', label: 'Mint' },
  { value: 'very_good', label: 'Very Good' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
]

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF']

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'Fr',
}

const SELLER_TYPES = [
  { value: 'no_preference', label: 'No preference' },
  { value: 'dealer', label: 'Dealers only' },
  { value: 'private', label: 'Private only' },
]

const WATCH_CATEGORIES = [
  { value: 'chronograph', label: 'Chronograph' },
  { value: 'diver', label: 'Diver' },
  { value: 'dress', label: 'Dress' },
  { value: 'field', label: 'Field' },
]

const MUST_HAVE_SUGGESTIONS = [
  'Box or papers',
  'Full box and papers',
  'Unpolished case',
  'Service history',
  'Seller warranty',
  'Returns accepted',
]

const DEAL_BREAKER_SUGGESTIONS = [
  'Heavily polished',
  'Dial refinished',
  'Parts replaced',
  'No service records',
  'No returns',
  'Frankenwatch parts',
]

export default function NewSearchPage() {
  const router = useRouter()
  const [modelName, setModelName] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [conditions, setConditions] = useState<string[]>(['mint', 'very_good', 'good'])
  const [watchCategory, setWatchCategory] = useState('')
  const [sellerType, setSellerType] = useState('no_preference')
  const [mustHaveInput, setMustHaveInput] = useState('')
  const [touched, setTouched] = useState({ modelName: false, budgetMin: false, budgetMax: false })
  const [mustHaves, setMustHaves] = useState<string[]>([])
  const [dealBreakerInput, setDealBreakerInput] = useState('')
  const [dealBreakers, setDealBreakers] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleCondition(value: string) {
    setConditions((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    )
  }

  function addMustHave() {
    const v = mustHaveInput.trim()
    if (v && !mustHaves.includes(v)) {
      setMustHaves((prev) => [...prev, v])
      setMustHaveInput('')
    }
  }

  async function handleSubmit() {
    if (!modelName.trim() || !budgetMin || !budgetMax || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelName.trim(),
          watchCategory: watchCategory || undefined,
          criteria: {
            modelName: modelName.trim(),
            referenceNumber: referenceNumber.trim() || undefined,
            budgetMin: Number(budgetMin),
            budgetMax: Number(budgetMax),
            currency,
            acceptableConditions: conditions,
            mustHaves,
            dealBreakers,
            sellerTypePreference: sellerType,
            notes: notes.trim() || undefined,
          },
        }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/searches/${data.id}`)
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function addDealBreaker() {
    const v = dealBreakerInput.trim()
    if (v && !dealBreakers.includes(v)) {
      setDealBreakers((prev) => [...prev, v])
      setDealBreakerInput('')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-200 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold text-zinc-100 mb-1">New Search</h1>
      <p className="text-sm text-zinc-500 mb-8">
        Define your hunt criteria and WatchScout will help you find and evaluate listings.
      </p>

      <div className="space-y-8">
        {/* Watch Identity */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Watch Identity
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="model-name" className="text-zinc-300">
                Model Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="model-name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, modelName: true }))}
                placeholder="e.g. Omega Speedmaster Date"
                className={`bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 ${touched.modelName && !modelName.trim() ? 'border-red-500' : ''}`}
              />
              {touched.modelName && !modelName.trim() && (
                <p className="text-xs text-red-400">Required</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ref-number" className="text-zinc-300">
                Reference Number
              </Label>
              <Input
                id="ref-number"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. 3210.50"
                className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Category</Label>
            <div className="flex flex-wrap gap-2">
              {WATCH_CATEGORIES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setWatchCategory((prev) => prev === value ? '' : value)}
                  aria-pressed={watchCategory === value}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    watchCategory === value
                      ? 'bg-amber-400/10 border-amber-400/40 text-amber-400'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Budget */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Budget</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="budget-min" className="text-zinc-300">
                Minimum <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 pointer-events-none select-none">
                  {CURRENCY_SYMBOLS[currency] ?? currency}
                </span>
                <Input
                  id="budget-min"
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, budgetMin: true }))}
                  placeholder="2500"
                  className={`bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 pl-8 ${touched.budgetMin && !budgetMin ? 'border-red-500' : ''}`}
                />
              </div>
              {touched.budgetMin && !budgetMin && (
                <p className="text-xs text-red-400">Required</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-max" className="text-zinc-300">
                Maximum <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 pointer-events-none select-none">
                  {CURRENCY_SYMBOLS[currency] ?? currency}
                </span>
                <Input
                  id="budget-max"
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, budgetMax: true }))}
                  placeholder="3500"
                  className={`bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 pl-8 ${touched.budgetMax && !budgetMax ? 'border-red-500' : ''}`}
                />
              </div>
              {touched.budgetMax && !budgetMax && (
                <p className="text-xs text-red-400">Required</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c} className="text-zinc-100 focus:bg-zinc-800">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Acceptable Conditions */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Acceptable Conditions
          </h2>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleCondition(value)}
                aria-pressed={conditions.includes(value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  conditions.includes(value)
                    ? 'bg-amber-400/10 border-amber-400/40 text-amber-400'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Seller Preference */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Seller Preference
          </h2>
          <div className="flex flex-wrap gap-2">
            {SELLER_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSellerType(value)}
                aria-pressed={sellerType === value}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  sellerType === value
                    ? 'bg-amber-400/10 border-amber-400/40 text-amber-400'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Must Haves */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Must Haves
          </h2>
          <div className="flex flex-wrap gap-2">
            {MUST_HAVE_SUGGESTIONS.map((s) => {
              const selected = mustHaves.includes(s)
              return (
                <button
                  key={s}
                  onClick={() =>
                    setMustHaves((prev) =>
                      selected ? prev.filter((x) => x !== s) : [...prev, s]
                    )
                  }
                  aria-pressed={selected}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selected
                      ? 'bg-emerald-950/40 border-emerald-700 text-emerald-400'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {selected && <Check className="h-3 w-3 shrink-0" />}
                  {s}
                </button>
              )
            })}
          </div>
          <div className="space-y-2">
            <Label htmlFor="must-have-input" className="text-xs text-zinc-500">
              Or add your own
            </Label>
            <div className="flex gap-2">
              <Input
                id="must-have-input"
                value={mustHaveInput}
                onChange={(e) => setMustHaveInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMustHave())}
                placeholder="e.g. Crystal unscratched"
                className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              />
              <Button
                variant="outline"
                onClick={addMustHave}
                aria-label="Add must-have"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {mustHaves.filter((item) => !MUST_HAVE_SUGGESTIONS.includes(item)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {mustHaves
                .filter((item) => !MUST_HAVE_SUGGESTIONS.includes(item))
                .map((item) => (
                  <Badge
                    key={item}
                    variant="outline"
                    className="bg-emerald-950/30 border-emerald-800/50 text-emerald-400 gap-1 pr-1"
                  >
                    {item}
                    <button
                      onClick={() => setMustHaves((p) => p.filter((x) => x !== item))}
                      aria-label={`Remove ${item}`}
                      className="p-1 -m-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
            </div>
          )}
        </div>

        <Separator className="bg-zinc-800" />

        {/* Deal Breakers */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Deal Breakers
          </h2>
          <div className="flex flex-wrap gap-2">
            {DEAL_BREAKER_SUGGESTIONS.map((s) => {
              const selected = dealBreakers.includes(s)
              return (
                <button
                  key={s}
                  onClick={() =>
                    setDealBreakers((prev) =>
                      selected ? prev.filter((x) => x !== s) : [...prev, s]
                    )
                  }
                  aria-pressed={selected}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selected
                      ? 'bg-red-950/40 border-red-700 text-red-400'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {selected && <Check className="h-3 w-3 shrink-0" />}
                  {s}
                </button>
              )
            })}
          </div>
          <div className="space-y-2">
            <Label htmlFor="deal-breaker-input" className="text-xs text-zinc-500">
              Or add your own
            </Label>
            <div className="flex gap-2">
              <Input
                id="deal-breaker-input"
                value={dealBreakerInput}
                onChange={(e) => setDealBreakerInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDealBreaker())}
                placeholder="e.g. Missing crown"
                className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              />
              <Button
                variant="outline"
                onClick={addDealBreaker}
                aria-label="Add deal-breaker"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {dealBreakers.filter((item) => !DEAL_BREAKER_SUGGESTIONS.includes(item)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dealBreakers
                .filter((item) => !DEAL_BREAKER_SUGGESTIONS.includes(item))
                .map((item) => (
                  <Badge
                    key={item}
                    variant="outline"
                    className="bg-red-950/30 border-red-800/50 text-red-400 gap-1 pr-1"
                  >
                    {item}
                    <button
                      onClick={() => setDealBreakers((p) => p.filter((x) => x !== item))}
                      aria-label={`Remove ${item}`}
                      className="p-1 -m-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
            </div>
          )}
        </div>

        <Separator className="bg-zinc-800" />

        {/* Notes */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Additional Notes
          </h2>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any other preferences or context for this search..."
            className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 min-h-24 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="space-y-3 pt-2">
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <div className="flex items-center gap-3">
            <Button
              className="bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold px-6"
              disabled={!modelName.trim() || !budgetMin || !budgetMax || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Creating…' : 'Create Search'}
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              <Link href="/dashboard">Cancel</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
