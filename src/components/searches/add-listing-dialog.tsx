'use client'

import { useState } from 'react'
import { Plus, Link as LinkIcon, Upload } from 'lucide-react'
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

export function AddListingDialog() {
  const [url, setUrl] = useState('')

  return (
    <Dialog>
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
                placeholder="https://www.chrono24.com/..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              />
            </div>
            <p className="text-xs text-zinc-500">
              Supports Chrono24, eBay, Watchfinder, WatchBox, and Crown &amp; Caliber.
            </p>
            <Button
              className="w-full bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold"
              disabled={!url.trim()}
            >
              Extract Listing Data
            </Button>
          </TabsContent>

          <TabsContent value="screenshot" className="mt-4 space-y-4">
            <div className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-800/50 cursor-pointer hover:border-zinc-500 transition-colors">
              <Upload className="h-6 w-6 text-zinc-500 mb-2" />
              <p className="text-sm text-zinc-400">Click to upload or drag &amp; drop</p>
              <p className="text-xs text-zinc-600 mt-1">PNG, JPG up to 10MB</p>
            </div>
            <p className="text-xs text-zinc-500">
              AI will extract all available data from the screenshot.
            </p>
            <Button
              className="w-full bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold"
              disabled
            >
              Analyse Screenshot
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
