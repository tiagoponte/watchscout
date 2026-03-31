'use client'

import { useEffect } from 'react'

/**
 * Initialises native Android UI chrome on app start:
 * - Status bar: zinc-950 background, light icons (white on dark)
 *
 * No-op in regular browser — dynamic import fails gracefully.
 */
export function NativeInit() {
  useEffect(() => {
    async function init() {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar')
        // Style.Light = light/white icons, correct for a dark background
        await StatusBar.setStyle({ style: Style.Light })
        await StatusBar.setBackgroundColor({ color: '#09090b' }) // zinc-950
      } catch {
        // Not running in Capacitor — no-op
      }
    }
    init()
  }, [])

  return null
}
