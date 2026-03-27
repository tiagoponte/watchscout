'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Handles Capacitor deep links on Android (and iOS in future).
 *
 * When the user taps a magic-link email on Android, App Links routes the URL
 * to this app instead of the browser. Capacitor fires an `appUrlOpen` event
 * (warm start) or populates `getLaunchUrl()` (cold start). Both cases land
 * here and we push the path into the Next.js router — the server-rendered
 * /auth/callback route then exchanges the code for a session normally.
 *
 * This component is a no-op when running in a regular browser (the dynamic
 * import fails gracefully).
 */
export function DeepLinkHandler() {
  const router = useRouter()

  useEffect(() => {
    let cleanup: (() => void) | undefined

    async function init() {
      try {
        const { App } = await import('@capacitor/app')

        function handleUrl(url: string) {
          try {
            const { pathname, search, hash } = new URL(url)
            router.push(pathname + search + hash)
          } catch {
            // ignore malformed URLs
          }
        }

        // Cold start: app launched directly via deep link
        const launch = await App.getLaunchUrl()
        if (launch?.url) handleUrl(launch.url)

        // Warm start: deep link received while app is already running
        const listener = await App.addListener('appUrlOpen', (event) => {
          handleUrl(event.url)
        })

        cleanup = () => listener.remove()
      } catch {
        // Not running inside Capacitor — no-op
      }
    }

    init()
    return () => cleanup?.()
  }, [router])

  return null
}
