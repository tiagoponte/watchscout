'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Sparkles, Copy, Check, Loader2, Languages } from 'lucide-react'
import type { ListingCard } from '@/types'
import type { GeneratedQuestionnaire } from '@/lib/claude'

interface QuestionnairePanelProps {
  listing: ListingCard
  searchId: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-xs text-zinc-400 hover:text-zinc-100"
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

export function QuestionnairePanel({ listing, searchId }: QuestionnairePanelProps) {
  const [questionnaire, setQuestionnaire] = useState<GeneratedQuestionnaire | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [sellerLanguage, setSellerLanguage] = useState(listing.listingLanguage ?? '')

  // Editable texts — initialised after generation
  const [englishText, setEnglishText] = useState('')
  const [sellerText, setSellerText] = useState('')

  // Re-translate state
  const [retranslating, setRetranslating] = useState(false)
  const [retranslateError, setRetranslateError] = useState<string | null>(null)

  // Parse response state
  const [response, setResponse] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [parseDone, setParseDone] = useState(false)
  const router = useRouter()

  async function handleGenerate() {
    setGenerating(true)
    setGenerateError(null)
    try {
      const res = await fetch('/api/questionnaire/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id, searchId, sellerLanguage: sellerLanguage.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate')
      setQuestionnaire(data)
      setEnglishText(data.englishText)
      setSellerText(data.sellerText)
      router.refresh()
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : 'Failed to generate questionnaire')
    } finally {
      setGenerating(false)
    }
  }

  async function handleRetranslate() {
    if (!questionnaire) return
    setRetranslating(true)
    setRetranslateError(null)
    try {
      const res = await fetch('/api/questionnaire/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ english: englishText, language: questionnaire.detectedLanguage }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to translate')
      setSellerText(data.sellerText)
    } catch (e) {
      setRetranslateError(e instanceof Error ? e.message : 'Failed to translate')
    } finally {
      setRetranslating(false)
    }
  }

  async function handleParse() {
    setParsing(true)
    setParseError(null)
    setParseDone(false)
    try {
      const res = await fetch('/api/questionnaire/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id, searchId, sellerResponse: response }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to parse')
      setParseDone(true)
      router.refresh()
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Failed to parse response')
    } finally {
      setParsing(false)
    }
  }

  const isEnglish = !questionnaire || questionnaire.detectedLanguage.toLowerCase() === 'english'

  return (
    <div className="space-y-4">
      {!questionnaire ? (
        <div className="flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-zinc-800">
          <Sparkles className="h-7 w-7 text-zinc-600 mb-3" />
          <p className="text-sm text-zinc-400 mb-1">AI-generated questionnaire</p>
          <p className="text-xs text-zinc-600 mb-4 text-center max-w-xs">
            Claude will write a tailored message in the seller&apos;s language based on
            what&apos;s still unknown about this listing.
          </p>
          <div className="flex items-center gap-2 mb-4 w-full max-w-xs">
            <Label htmlFor="seller-language" className="text-zinc-500 text-xs whitespace-nowrap">Seller language</Label>
            <Input
              id="seller-language"
              value={sellerLanguage}
              onChange={(e) => setSellerLanguage(e.target.value)}
              placeholder="e.g. Spanish"
              className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-600 h-7 text-xs"
              disabled={generating}
            />
          </div>
          {generateError && (
            <p className="text-xs text-red-400 mb-3 text-center max-w-xs">{generateError}</p>
          )}
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1.5" />
            )}
            {generating ? 'Generating…' : 'Generate Questionnaire'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Non-English: seller-language version (read-only, reflects latest translation) */}
          {!isEnglish && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-400 text-xs uppercase tracking-wider">
                  In {questionnaire.detectedLanguage}
                </Label>
                <CopyButton text={sellerText} />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {sellerText}
                </pre>
              </div>
            </div>
          )}

          {/* English version — always editable */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">
                {isEnglish ? 'Generated questionnaire' : 'English'}
              </Label>
              <CopyButton text={englishText} />
            </div>
            <Textarea
              value={englishText}
              onChange={(e) => setEnglishText(e.target.value)}
              className={`text-xs font-mono leading-relaxed resize-none min-h-36 ${
                isEnglish
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                  : 'bg-zinc-900/50 border-zinc-800/60 text-zinc-400'
              }`}
            />
          </div>

          {/* Re-translate button — only for non-English */}
          {!isEnglish && (
            <div>
              {retranslateError && <p className="text-xs text-red-400 mb-1">{retranslateError}</p>}
              <Button
                variant="outline"
                size="sm"
                className="w-full border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500"
                disabled={retranslating || !englishText.trim()}
                onClick={handleRetranslate}
              >
                {retranslating
                  ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  : <Languages className="h-3.5 w-3.5 mr-1.5" />}
                {retranslating ? 'Translating…' : `Re-translate to ${questionnaire.detectedLanguage}`}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 pt-2 border-t border-zinc-800">
        <Label htmlFor="seller-response" className="text-zinc-400 text-xs uppercase tracking-wider">
          Paste seller response
        </Label>
        <Textarea
          id="seller-response"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Paste the seller's reply here and click 'Parse Response' to automatically update the listing card…"
          className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 min-h-24 resize-none"
        />
        {parseError && <p className="text-xs text-red-400">{parseError}</p>}
        {parseDone && <p className="text-xs text-emerald-400">Listing card updated successfully.</p>}
        <Button
          className="w-full bg-zinc-800 text-zinc-200 hover:bg-zinc-700 font-medium"
          disabled={!response.trim() || parsing}
          onClick={handleParse}
        >
          {parsing ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-1.5" />
          )}
          {parsing ? 'Parsing…' : 'Parse Response & Update Card'}
        </Button>
      </div>
    </div>
  )
}
