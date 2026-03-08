import { NextResponse } from 'next/server'
import { getApiUserContext } from '@/lib/server/get-user-id'
import { translateMessage } from '@/lib/claude'
import { canMakeAiCall, incrementAiCalls } from '@/lib/db/users'

export async function POST(request: Request) {
  try {
    const user = await getApiUserContext()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { english, language } = await request.json() as { english?: string; language?: string }
    if (!english || !language)
      return NextResponse.json({ error: 'english and language required' }, { status: 400 })

    const aiAllowed = await canMakeAiCall(user.id)
    if (!aiAllowed) {
      return NextResponse.json(
        { error: `Daily AI limit reached (${user.limits.aiCallsPerDay}/day). Resets at midnight UTC.`, code: 'LIMIT_AI' },
        { status: 429 },
      )
    }

    const sellerText = await translateMessage(english, language)
    await incrementAiCalls(user.id)

    return NextResponse.json({ sellerText })
  } catch (e) {
    console.error('POST /api/questionnaire/translate', e)
    return NextResponse.json({ error: 'Failed to translate. Please try again.' }, { status: 500 })
  }
}
