'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { AppSidebar } from './app-sidebar'
import { AppHeader } from './app-header'
import type { Search } from '@/types'

interface AppShellProps {
  children: React.ReactNode
  searches: Search[]
  userEmail: string
}

export function AppShell({ children, searches, userEmail }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0">
        <AppSidebar searches={searches} userEmail={userEmail} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-zinc-900 border-zinc-800">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebar searches={searches} userEmail={userEmail} />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        <AppHeader onMenuClick={() => setMobileOpen(true)} userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">{children}</main>
      </div>
    </div>
  )
}
