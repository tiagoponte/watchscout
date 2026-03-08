'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CardSectionProps {
  title: string
  id?: string
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

export function CardSection({
  title,
  id,
  defaultOpen = true,
  children,
  className,
}: CardSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    function handleHash() {
      if (window.location.hash === `#${id}`) {
        setOpen(true)
        wrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [id])

  return (
    <div ref={wrapperRef} id={id} className={cn('border border-zinc-800 rounded-lg overflow-hidden', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900 hover:bg-zinc-800/60 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
          {title}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-zinc-500 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && <div className="px-4 py-3 bg-zinc-950">{children}</div>}
    </div>
  )
}
