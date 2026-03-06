import { NextResponse } from 'next/server'
import { getApiUserContext } from '@/lib/server/get-user-id'
import { createSearch } from '@/lib/db/searches'
import { canCreateSearch } from '@/lib/db/users'
import { SearchCriteria, WatchCategory } from '@/types'

export async function POST(request: Request) {
  try {
    const user = await getApiUserContext()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const allowed = await canCreateSearch(user.id)
    if (!allowed) {
      return NextResponse.json(
        { error: `Search limit reached for your plan (${user.limits.searches} max). Upgrade to create more.`, code: 'LIMIT_SEARCHES' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { name, criteria, watchCategory } = body as {
      name: string
      criteria: SearchCriteria
      watchCategory?: WatchCategory
    }

    if (!name || !criteria?.modelName || !criteria?.budgetMin || !criteria?.budgetMax) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const search = await createSearch({ userId: user.id, name, criteria, watchCategory })
    return NextResponse.json(search, { status: 201 })
  } catch (e) {
    console.error('POST /api/searches', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
