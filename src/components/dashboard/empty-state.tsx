import Link from 'next/link'
import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 mb-4">
        <Search className="h-7 w-7 text-zinc-600" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-200 mb-2">No searches yet</h2>
      <p className="text-sm text-zinc-500 max-w-sm mb-6">
        Start your first watch hunt. Configure your search criteria and begin adding listings.
      </p>
      <Button asChild className="bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold">
        <Link href="/searches/new">
          <Plus className="h-4 w-4 mr-1.5" />
          New Search
        </Link>
      </Button>
    </div>
  )
}
