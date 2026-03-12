'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Plus, LogOut, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WatchIcon } from '@/components/ui/watch-icon'
import { createClient } from '@/lib/supabase/client'
import { UpgradeDialog } from '@/components/upgrade-dialog'
import type { Search as SearchType } from '@/types'
import type { Tier } from '@/lib/plans'

interface AppSidebarProps {
  searches: SearchType[]
  userEmail: string
  tier: Tier
}

export function AppSidebar({ searches, userEmail, tier }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initial = userEmail.charAt(0).toUpperCase()

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-4 h-14 border-b border-zinc-800 shrink-0 hover:opacity-80 transition-opacity">
        <WatchIcon category="chronograph" className="h-5 w-5 text-amber-400" />
        <span className="text-amber-400 font-semibold text-base tracking-tight">WatchScout</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-2">
          Searches
        </p>
        {searches.map((search) => {
          const isActive = pathname.startsWith(`/searches/${search.id}`)
          return (
            <Link
              key={search.id}
              href={`/searches/${search.id}`}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-zinc-800 text-zinc-50'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              )}
            >
              {search.watchCategory
                ? <WatchIcon category={search.watchCategory} className="h-4 w-4 shrink-0" />
                : <Search className="h-4 w-4 shrink-0" />
              }
              <span className="truncate">{search.name}</span>
              <span className="ml-auto text-xs text-zinc-500 tabular-nums">
                {search.listingIds.length}
              </span>
            </Link>
          )
        })}
        <Link
          href="/searches/new"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors mt-1',
            pathname === '/searches/new'
              ? 'bg-zinc-800 text-zinc-50'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          )}
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>New Search</span>
        </Link>
      </nav>

      {/* Plan */}
      {tier !== 'POWER' && (
        <div className="px-3 pb-2">
          <div className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2.5 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-zinc-400">Free plan</p>
              <p className="text-xs text-zinc-600">Unlock your hunt or go Power</p>
            </div>
            <button
              onClick={() => setUpgradeOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors shrink-0"
            >
              <Zap className="h-3 w-3" />
              Upgrade
            </button>
          </div>
        </div>
      )}

      <UpgradeDialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      {/* Footer */}
      <div className="border-t border-zinc-800 p-3">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors group"
        >
          <div className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-200 text-xs font-semibold select-none shrink-0">
            {initial}
          </div>
          <span className="flex-1 text-left truncate">{userEmail}</span>
          <LogOut className="h-3.5 w-3.5 shrink-0 text-zinc-600 group-hover:text-zinc-400" />
        </button>
      </div>
    </div>
  )
}
