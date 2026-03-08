'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Link as LinkIcon, Upload, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UpgradeDialog } from '@/components/upgrade-dialog'

// Resize and re-encode a screenshot as JPEG before sending to the API.
// Keeps stored photos at a reasonable size (~100–200 KB as base64).
function resizeImage(file: File, maxDim = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1])
    }
    img.onerror = reject
    img.src = objectUrl
  })
}

interface Props {
  searchId: string
}

export function AddListingDialog({ searchId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<'LIMIT_SEARCHES' | 'LIMIT_LISTINGS' | 'LIMIT_AI' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function submit(body: object) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchId, ...body }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === 'LIMIT_LISTINGS' || data.code === 'LIMIT_AI') {
          setUpgradeReason(data.code)
        } else {
          setError(data.error ?? 'Something went wrong.')
        }
        return
      }
      setOpen(false)
      router.push(`/searches/${searchId}/listings/${data.listingId}`)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleUrl() {
    await submit({ url })
  }

  async function handleFile(file: File) {
    const imageBase64 = await resizeImage(file)
    await submit({ imageBase64, mimeType: 'image/jpeg' })
  }

  return (
    <>
    <UpgradeDialog
      open={!!upgradeReason}
      onClose={() => setUpgradeReason(null)}
      reason={upgradeReason ?? undefined}
    />
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError(null) }}>
      <DialogTrigger asChild>
        <Button className="bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Add a Listing</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="url" className="mt-2">
          <TabsList className="bg-zinc-800 w-full">
            <TabsTrigger value="url" className="flex-1 data-[state=active]:bg-zinc-700">
              <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
              Paste URL
            </TabsTrigger>
            <TabsTrigger value="screenshot" className="flex-1 data-[state=active]:bg-zinc-700">
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload Screenshot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="listing-url" className="text-zinc-300">
                Listing URL
              </Label>
              <Input
                id="listing-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && url.trim() && !loading && handleUrl()}
                placeholder="https://www.chrono24.com/..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-zinc-500">
              Supports Chrono24, eBay, Watchfinder, WatchBox, and Crown &amp; Caliber.
            </p>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button
              className="w-full bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold"
              disabled={!url.trim() || loading}
              onClick={handleUrl}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? 'Extracting…' : 'Extract Listing Data'}
            </Button>
          </TabsContent>

          <TabsContent value="screenshot" className="mt-4 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
            <div
              className={`flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                dragOver ? 'border-amber-400 bg-amber-400/5' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-500'
              } ${loading ? 'pointer-events-none opacity-50' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const file = e.dataTransfer.files?.[0]
                if (file) handleFile(file)
              }}
            >
              {loading ? (
                <Loader2 className="h-6 w-6 text-amber-400 animate-spin" />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-zinc-500 mb-2" />
                  <p className="text-sm text-zinc-400">Click to upload or drag &amp; drop</p>
                  <p className="text-xs text-zinc-600 mt-1">PNG, JPG up to 10MB</p>
                </>
              )}
            </div>
            <p className="text-xs text-zinc-500">
              AI will extract all available data from the screenshot.
            </p>
            {error && <p className="text-xs text-red-400">{error}</p>}
            {loading && (
              <p className="text-xs text-zinc-400 text-center">Analysing screenshot…</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
    </>
  )
}
