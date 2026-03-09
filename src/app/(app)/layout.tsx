import { getSearches } from '@/lib/db/searches'
import { AppShell } from '@/components/layout/app-shell'
import { getUserContext } from '@/lib/server/get-user-id'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { id: userId, email: userEmail, tier } = await getUserContext()
  const searches = await getSearches(userId)

  return (
    <AppShell searches={searches} userEmail={userEmail} tier={tier}>
      {children}
    </AppShell>
  )
}
