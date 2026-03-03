'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WatchIcon } from '@/components/ui/watch-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || submitting) return
    setSubmitting(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })

    setSubmitting(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5">
            <WatchIcon category="chronograph" className="h-7 w-7 text-amber-400" />
            <span className="text-amber-400 font-semibold text-xl tracking-tight">WatchScout</span>
          </div>
          <p className="text-zinc-500 text-sm text-center">
            AI-powered pre-owned watch buying assistant
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-center space-y-2">
            <p className="text-zinc-100 font-medium">Check your email</p>
            <p className="text-zinc-500 text-sm">
              We sent a magic link to <span className="text-zinc-300">{email}</span>.
              Click it to sign in — no password needed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-zinc-300">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <Button
              type="submit"
              disabled={!email.trim() || submitting}
              className="w-full bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold"
            >
              {submitting ? 'Sending…' : 'Send magic link'}
            </Button>

            <p className="text-xs text-zinc-600 text-center">
              No account needed — just enter your email to get started.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
