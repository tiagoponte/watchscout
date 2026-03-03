import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// Module-level cache so we only hit the DB once per server process in E2E mode
let _e2eUser: { id: string; email: string } | null = null

/**
 * Returns the current authenticated user's ID.
 * In E2E test mode (E2E_SKIP_AUTH=true), skips Supabase auth.
 *   - If E2E_USER_ID env var is set, uses it directly (fastest, no DB call).
 *   - Otherwise, queries the DB once and caches the result for the process lifetime.
 */
export async function getUserContext(): Promise<{ id: string; email: string }> {
  if (process.env.E2E_SKIP_AUTH === 'true') {
    // Fast path: userId provided directly via env var
    if (process.env.E2E_USER_ID) {
      return { id: process.env.E2E_USER_ID, email: 'test@e2e.local' }
    }
    // Cached path: reuse result from first DB call
    if (_e2eUser) return _e2eUser
    // Cold path: derive from seeded data (one-time per server process)
    const search = await prisma.search.findFirst()
    if (!search) throw new Error('E2E mode: no seeded searches found — run prisma/seed.ts first')
    _e2eUser = { id: search.userId, email: 'test@e2e.local' }
    return _e2eUser
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { id: user.id, email: user.email ?? '' }
}
