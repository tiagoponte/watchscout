import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSearch } from '@/lib/db/searches'
import { SearchCriteria, WatchCategory } from '@/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
