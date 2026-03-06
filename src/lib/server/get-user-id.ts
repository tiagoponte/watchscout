import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS, type Tier } from '@/lib/plans'

export interface UserContext {
  id: string
  email: string
  tier: Tier
  limits: typeof PLAN_LIMITS[Tier]
}

// Module-level cache so we only hit the DB once per server process in E2E mode
let _e2eUser: UserContext | null = null

async function buildContext(id: string, email: string): Promise<UserContext> {
  const user = await prisma.user.findUnique({ where: { id } })
  const tier = (user?.tier ?? 'FREE') as Tier
  return { id, email, tier, limits: PLAN_LIMITS[tier] }
}

async function resolveE2eUser(): Promise<UserContext> {
  if (_e2eUser) return _e2eUser

  let id = process.env.E2E_USER_ID
  let email = 'test@e2e.local'

  if (!id) {
    const search = await prisma.search.findFirst()
    if (!search) throw new Error('E2E mode: no seeded searches found — run prisma/seed.ts first')
    id = search.userId
  }

  _e2eUser = await buildContext(id, email)
  return _e2eUser
}

/**
 * For page/layout server components — redirects to /login if unauthenticated.
 */
export async function getUserContext(): Promise<UserContext> {
  if (process.env.E2E_SKIP_AUTH === 'true') return resolveE2eUser()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return buildContext(user.id, user.email ?? '')
}

/**
 * For API routes — returns null if unauthenticated (never redirects).
 */
export async function getApiUserContext(): Promise<UserContext | null> {
  if (process.env.E2E_SKIP_AUTH === 'true') return resolveE2eUser()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return buildContext(user.id, user.email ?? '')
}
