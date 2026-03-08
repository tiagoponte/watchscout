'use client'

import { useEffect, useRef } from 'react'
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
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const summaryRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const summary = summaryRef.current
    const details = detailsRef.current
    if (!summary || !details) return
    const handleClick = (e: Event) => {
      e.preventDefault()
      details.open = !details.open
    }
    summary.addEventListener('click', handleClick)
    return () => summary.removeEventListener('click', handleClick)
  }, [])

  useEffect(() => {
    if (!id) return
    function handleHash() {
      if (window.location.hash === `#${id}` && detailsRef.current) {
        detailsRef.current.open = true
        detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [id])

  return (
    <details
      ref={detailsRef}
      id={id}
      open={defaultOpen || undefined}
      className={cn('group border border-zinc-800 rounded-lg overflow-hidden', className)}
    >
      <summary
        ref={summaryRef as React.RefObject<HTMLElement>}
        role="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900 hover:bg-zinc-800/60 transition-colors text-left list-none cursor-pointer"
      >
        <span className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
          {title}
        </span>
        <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="px-4 py-3 bg-zinc-950">{children}</div>
    </details>
  )
}
