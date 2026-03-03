'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { Menu, LogOut } from 'lucide-react'

interface AppHeaderProps {
  onMenuClick: () => void
  userEmail: string
}

export function AppHeader({ onMenuClick, userEmail }: AppHeaderProps) {
  const router = useRouter()
  const initial = userEmail.charAt(0).toUpperCase()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="flex items-center h-14 px-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden mr-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-sm font-medium select-none hover:border-zinc-500 transition-colors">
            {initial}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 bg-zinc-900 border-zinc-800">
          <DropdownMenuLabel className="text-zinc-500 font-normal truncate">
            {userEmail}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
