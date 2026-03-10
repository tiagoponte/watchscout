import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
import { Check } from 'lucide-react'
import { WatchIcon } from '@/components/ui/watch-icon'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  // Redirect logged-in users straight to the app
  if (process.env.E2E_SKIP_AUTH === 'true') {
    redirect('/dashboard')
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <WatchIcon category="chronograph" className="h-5 w-5 text-amber-400" />
            <span className="text-amber-400 font-semibold text-base tracking-tight">WatchScout</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="#how-it-works" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5 hidden sm:block">
              How it works
            </Link>
            <Link href="#pricing" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5 hidden sm:block">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-zinc-300 hover:text-zinc-100 transition-colors px-3 py-1.5 ml-2">
              Sign in
            </Link>
            <Link href="/login" className="text-sm font-semibold bg-amber-400 text-zinc-950 hover:bg-amber-300 transition-colors px-4 py-1.5 rounded-md ml-1">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-6">
            The pre-owned watch buyer&apos;s edge
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-zinc-50 leading-[1.08] mb-5">
            You&apos;re not just<br />buying the watch.
          </h1>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-amber-400 mb-8">
            You&apos;re buying the seller.
          </p>
          <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-xl">
            In the pre-owned market, the seller&apos;s transparency about polishing, service history,
            and condition tells you more than any listing photo. WatchScout structures your hunt —
            ranking every listing against your criteria, generating the right questions in the
            seller&apos;s language, and re-ranking in real time as you learn more.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-base font-semibold bg-amber-400 text-zinc-950 hover:bg-amber-300 transition-colors px-6 py-3 rounded-md"
            >
              Start your hunt free →
            </Link>
            <p className="text-sm text-zinc-600">No credit card required · Free plan forever</p>
          </div>
        </div>
      </section>

      {/* ── Problem strip ── */}
      <section className="border-y border-zinc-800 bg-zinc-900/40">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-10 text-center">
            The pre-owned hunt, without WatchScout
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                label: 'Dozens of tabs',
                desc: 'Chrono24, eBay, Watchfinder, WatchBox — each with its own interface, each one a context switch.',
              },
              {
                label: 'Wrong language',
                desc: 'The best deals are in Germany, Japan, and France. Your questions get lost in translation.',
              },
              {
                label: 'Mental re-ranking',
                desc: 'New info arrives and you replay the whole board in your head. Something always gets missed.',
              },
              {
                label: 'High-stakes guesswork',
                desc: '€3,000–€30,000 decisions made from scattered notes and gut feel under time pressure.',
              },
            ].map(({ label, desc }) => (
              <div key={label} className="space-y-2">
                <p className="text-sm font-semibold text-zinc-300">{label}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Questionnaire spotlight ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 sm:p-14 flex flex-col sm:flex-row gap-10 items-start">
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-4">The feature that changes everything</p>
            <h2 className="text-3xl font-bold text-zinc-50 leading-tight mb-4">
              The best deal might be<br />listed in German.
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-6 max-w-lg">
              WatchScout detects the seller&apos;s language and generates your questionnaire in it —
              covering polishing history, service records, parts replaced, and shipping to your country.
              You get an English translation to review. Copy, paste, send.
            </p>
            <p className="text-sm text-zinc-500">
              Works for German, French, Japanese, Italian, Spanish — any listing you add.
            </p>
          </div>
          <div className="shrink-0 sm:w-56 space-y-2.5">
            {[
              'Has the case ever been polished?',
              'When was the last service, and what was done?',
              'Have any parts been replaced since purchase?',
              'What is the all-in shipping cost to [country]?',
            ].map((q) => (
              <div key={q} className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5">
                <p className="text-xs text-zinc-400 leading-snug">{q}</p>
              </div>
            ))}
            <p className="text-xs text-zinc-600 pt-1">↑ Generated in the seller&apos;s language</p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">How it works</p>
        <h2 className="text-3xl font-bold text-zinc-50 mb-14">Four steps from listing to decision.</h2>
        <div className="grid sm:grid-cols-2 gap-10">
          {[
            {
              n: '01',
              title: 'Define your hunt',
              desc: 'Set the model, reference, budget, and your non-negotiables. Box and papers? Unpolished case? No returns? It all goes in — WatchScout uses your criteria to score every listing you add.',
            },
            {
              n: '02',
              title: 'Add any listing',
              desc: 'Paste a URL or upload a screenshot. AI extracts the reference, price, condition, seller details, photos, and platform protections. No copy-pasting into spreadsheets.',
            },
            {
              n: '03',
              title: 'Ask the right questions',
              desc: 'For each listing, WatchScout generates a tailored questionnaire based on what\'s still unknown — written in the seller\'s language. Copy, paste, send. Paste the reply to update the card.',
            },
            {
              n: '04',
              title: 'The board re-ranks',
              desc: 'As answers come in, scores recalculate across 10 weighted factors: all-in price, service history, polishing status, seller reputation, and more. Your best option is always at the top.',
            },
          ].map(({ n, title, desc }) => (
            <div key={n} className="flex gap-5">
              <span className="text-2xl font-bold text-amber-400 tabular-nums shrink-0 w-8 pt-0.5">{n}</span>
              <div>
                <p className="font-semibold text-zinc-100 mb-2">{title}</p>
                <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ranking factors ── */}
      <section className="border-y border-zinc-800 bg-zinc-900/40">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">The ranking model</p>
          <h2 className="text-2xl font-bold text-zinc-50 mb-2">Ten factors. One score.</h2>
          <p className="text-sm text-zinc-500 mb-8 max-w-lg">
            Every listing gets a weighted composite score. Weights are adjustable — if you don&apos;t care about the box, say so.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {[
              { label: 'All-in price',       weight: '30%' },
              { label: 'Condition grade',    weight: '15%' },
              { label: 'Service history',    weight: '15%' },
              { label: 'Box & papers',       weight: '10%' },
              { label: 'Polishing status',   weight: '10%' },
              { label: 'Seller reputation',  weight: '8%'  },
              { label: 'Platform protection',weight: '5%'  },
              { label: 'Returns policy',     weight: '4%'  },
              { label: 'Responsiveness',     weight: '3%'  },
              { label: 'Seller warranty',    weight: '—'   },
            ].map(({ label, weight }) => (
              <div key={label} className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-3">
                <p className="text-xs font-medium text-zinc-300 leading-tight mb-1.5">{label}</p>
                <p className="text-xs text-amber-400 tabular-nums font-semibold">{weight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">Pricing</p>
        <h2 className="text-3xl font-bold text-zinc-50 mb-2">Start free. Upgrade when you need more.</h2>
        <p className="text-sm text-zinc-500 mb-12">Most hunts fit comfortably on the free plan.</p>

        <div className="grid sm:grid-cols-3 gap-4">
          {/* Free */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col">
            <p className="text-sm font-semibold text-zinc-300 mb-1">Free</p>
            <p className="text-3xl font-bold text-zinc-50 mb-1">€0</p>
            <p className="text-xs text-zinc-600 mb-6">forever</p>
            <ul className="space-y-2.5 flex-1 mb-6">
              {[
                '1 active search',
                '3 listings per search',
                '10 AI extractions / day',
                'Full questionnaire & scoring',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                  <Check className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block text-center text-sm font-semibold border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors px-4 py-2.5 rounded-md"
            >
              Get started free
            </Link>
          </div>

          {/* Scout */}
          <div className="rounded-xl border border-amber-400/30 bg-zinc-900 p-6 flex flex-col relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="text-xs font-semibold bg-amber-400 text-zinc-950 px-3 py-1 rounded-full whitespace-nowrap">
                Most popular
              </span>
            </div>
            <p className="text-sm font-semibold text-zinc-300 mb-1">Scout</p>
            <p className="text-3xl font-bold text-zinc-50 mb-1">€9.99</p>
            <p className="text-xs text-zinc-600 mb-6">per month</p>
            <ul className="space-y-2.5 flex-1 mb-6">
              {[
                '3 active searches',
                '15 listings per search',
                '50 AI extractions / day',
                'Full questionnaire & scoring',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                  <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block text-center text-sm font-semibold bg-amber-400 text-zinc-950 hover:bg-amber-300 transition-colors px-4 py-2.5 rounded-md"
            >
              Start with Scout
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col">
            <p className="text-sm font-semibold text-zinc-300 mb-1">Pro</p>
            <p className="text-3xl font-bold text-zinc-50 mb-1">€19.99</p>
            <p className="text-xs text-zinc-600 mb-6">per month</p>
            <ul className="space-y-2.5 flex-1 mb-6">
              {[
                'Unlimited searches',
                'Unlimited listings',
                '200 AI extractions / day',
                'Full questionnaire & scoring',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                  <Check className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block text-center text-sm font-semibold border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors px-4 py-2.5 rounded-md"
            >
              Go Pro
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="border-t border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-8">Why WatchScout exists</p>
          <blockquote className="text-zinc-400 text-lg leading-relaxed mb-3 max-w-2xl mx-auto">
            &ldquo;7 listings. 4 countries. 3 languages. 6 weeks of spreadsheets and gut feel.
            A €3,200 decision made with imperfect information under time pressure.&rdquo;
          </blockquote>
          <p className="text-sm text-zinc-600 mb-12">
            WatchScout was built from a real hunt for an Omega Speedmaster Date 3210.50.
            It turned into a product when it became clear everyone in the enthusiast community was running the same chaotic process.
          </p>
          <h2 className="text-3xl font-bold text-zinc-50 mb-4">Ready to start your hunt?</h2>
          <p className="text-zinc-500 mb-8 max-w-md mx-auto">
            Free plan. No credit card. Your first search up and running in under two minutes.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-base font-semibold bg-amber-400 text-zinc-950 hover:bg-amber-300 transition-colors px-8 py-3 rounded-md"
          >
            Get started free →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <WatchIcon category="chronograph" className="h-4 w-4 text-amber-400" />
            <span className="text-amber-400 font-semibold text-sm tracking-tight">WatchScout</span>
          </div>
          <p className="text-xs text-zinc-600">© 2026 WatchScout. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
