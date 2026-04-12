import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      {/* Minimal public header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
        <Link href="/" className="text-amber-400 font-bold text-lg tracking-tight">
          WatchScout
        </Link>
        <Button
          asChild
          size="sm"
          className="bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold"
        >
          <Link href="/login">Sign up free →</Link>
        </Button>
      </header>

      {/* Demo content */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  )
}
