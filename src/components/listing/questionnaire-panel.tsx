'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, Copy, Check } from 'lucide-react'

const PLACEHOLDER_QUESTIONNAIRE = `Dear seller,

Thank you for your listing. I am interested in your Omega Speedmaster Date and have a few questions:

1. Has the case or bracelet ever been polished by a watchmaker or jeweller?
2. When was the watch last serviced, and by whom? Do you have the service documents?
3. Were any parts replaced during the last service (e.g. hands, crown, pushers, crystals)?
4. What are the current bracelet links available — how many extra links are included?
5. Is the reference/serial number visible and intact on the case back?

Thank you for your time. I look forward to your response.`

export function QuestionnairePanel() {
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)
  const [response, setResponse] = useState('')

  function handleGenerate() {
    setGenerated(true)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(PLACEHOLDER_QUESTIONNAIRE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {!generated ? (
        <div className="flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-zinc-800">
          <Sparkles className="h-7 w-7 text-zinc-600 mb-3" />
          <p className="text-sm text-zinc-400 mb-1">AI-generated questionnaire</p>
          <p className="text-xs text-zinc-600 mb-4 text-center max-w-xs">
            Based on the known and unknown fields of this listing, Claude will generate a tailored
            questionnaire in the seller&apos;s language.
          </p>
          <Button
            onClick={handleGenerate}
            className="bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold"
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            Generate Questionnaire
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-zinc-400 text-xs uppercase tracking-wider">
              Generated questionnaire
            </Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-zinc-400 hover:text-zinc-100"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 mr-1" />
              ) : (
                <Copy className="h-3.5 w-3.5 mr-1" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
              {PLACEHOLDER_QUESTIONNAIRE}
            </pre>
          </div>
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
          placeholder="Paste the seller's reply here and click 'Parse Response' to automatically update the listing card..."
          className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 min-h-24 resize-none"
        />
        <Button
          className="w-full bg-zinc-800 text-zinc-200 hover:bg-zinc-700 font-medium"
          disabled={!response.trim()}
        >
          <Sparkles className="h-4 w-4 mr-1.5" />
          Parse Response &amp; Update Card
        </Button>
      </div>
    </div>
  )
}
