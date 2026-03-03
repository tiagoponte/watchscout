'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface PhotoGalleryProps {
  photos: string[]
  alt?: string
  thumbnailIndex?: number
}

export function PhotoGallery({ photos, alt = 'Watch photo', thumbnailIndex = 0 }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [thumbIdx, setThumbIdx] = useState(thumbnailIndex)

  if (photos.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-600 text-sm">
        No photos available
      </div>
    )
  }

  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-3">
          {photos.map((src, i) => (
            <div key={i} className="relative shrink-0 w-48 h-36 group/photo">
              <button
                onClick={() => setLightboxIndex(i)}
                className={`block w-full h-full rounded-lg overflow-hidden border bg-zinc-900 hover:border-zinc-600 transition-colors cursor-zoom-in ${
                  i === thumbIdx ? 'border-amber-400/60' : 'border-zinc-800'
                }`}
              >
                <Image
                  src={src}
                  alt={`${alt} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="192px"
                />
              </button>
              {/* Thumbnail star — sibling to photo button, not nested inside it */}
              <button
                onClick={() => setThumbIdx(i)}
                aria-label={i === thumbIdx ? 'Current thumbnail' : 'Set as thumbnail'}
                className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  i === thumbIdx
                    ? 'bg-amber-400 text-zinc-950 opacity-100'
                    : 'bg-zinc-950/80 text-zinc-400 opacity-0 group-hover/photo:opacity-100 hover:text-amber-400'
                }`}
              >
                <Star className="h-3 w-3" fill={i === thumbIdx ? 'currentColor' : 'none'} />
              </button>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => { if (!open) setLightboxIndex(null) }}>
        <DialogContent className="max-w-3xl p-0 bg-zinc-950 border-zinc-800">
          <DialogTitle className="sr-only">
            {lightboxIndex !== null ? `${alt} ${lightboxIndex + 1}` : 'Photo'}
          </DialogTitle>
          {lightboxIndex !== null && (
            <div className="relative w-full aspect-[4/3]">
              <Image
                src={photos[lightboxIndex]}
                alt={`${alt} ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
