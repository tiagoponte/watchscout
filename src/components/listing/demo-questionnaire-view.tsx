import { Copy } from 'lucide-react'
import type { DemoQuestionnaire } from '@/data/demo-hunt'

function CopyButton({ text }: { text: string }) {
  // Server-side copy is not possible; wrap in a minimal client button
  return (
    <button
      data-copy={text}
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      onClick={undefined}
    >
      <Copy className="h-3 w-3" />
      Copy
    </button>
  )
}

interface DemoQuestionnaireViewProps {
  questionnaire: DemoQuestionnaire
}

export function DemoQuestionnaireView({ questionnaire }: DemoQuestionnaireViewProps) {
  const isEnglish = questionnaire.language.toLowerCase() === 'english'

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {/* Non-English version */}
        {!isEnglish && (
          <div className="space-y-1.5">
            <p className="text-xs text-zinc-400 uppercase tracking-wider">
              In {questionnaire.language}
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
                {questionnaire.sellerText}
              </pre>
            </div>
          </div>
        )}

        {/* English version */}
        <div className="space-y-1.5">
          <p className="text-xs text-zinc-400 uppercase tracking-wider">
            {isEnglish ? 'Generated questionnaire' : 'English'}
          </p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <pre className="text-xs text-zinc-400 whitespace-pre-wrap font-sans leading-relaxed">
              {questionnaire.englishText}
            </pre>
          </div>
        </div>
      </div>

      {/* Seller reply (if parsed) */}
      {questionnaire.sellerReply && (
        <div className="space-y-1.5 pt-2 border-t border-zinc-800">
          <p className="text-xs text-zinc-400 uppercase tracking-wider">
            Seller reply — {questionnaire.language}
          </p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
              {questionnaire.sellerReply}
            </pre>
          </div>
          <p className="text-xs text-emerald-500 mt-1">
            ✓ Response parsed — listing card updated automatically
          </p>
        </div>
      )}

      {/* Demo notice at bottom */}
      <p className="text-xs text-zinc-600 italic pt-2 border-t border-zinc-800">
        Generate and send questionnaires in your own hunts.
      </p>
    </div>
  )
}
