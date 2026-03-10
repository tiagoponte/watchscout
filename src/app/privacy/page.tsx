import Link from 'next/link'
import { WatchIcon } from '@/components/ui/watch-icon'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800/60">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <WatchIcon category="chronograph" className="h-5 w-5 text-amber-400" />
            <span className="text-amber-400 font-semibold text-base tracking-tight">WatchScout</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-zinc-50 mb-2">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 mb-12">Last updated: March 2026</p>

        <div className="space-y-10 text-sm text-zinc-400 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">1. Who we are</h2>
            <p>
              WatchScout (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is an AI-powered assistant for researching
              pre-owned luxury watches. The service is operated as an independent product accessible
              at <span className="text-zinc-300">watchscout.app</span>. For privacy matters,
              contact us at <a href="mailto:hello@watchscout.app" className="text-amber-400 hover:text-amber-300">hello@watchscout.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">2. What data we collect</h2>
            <ul className="space-y-3 list-disc list-inside marker:text-zinc-600">
              <li>
                <span className="text-zinc-300 font-medium">Email address</span> — collected when you sign in
                via magic link. Used solely for authentication and transactional emails (subscription receipts,
                sign-in links).
              </li>
              <li>
                <span className="text-zinc-300 font-medium">Watch listing data</span> — URLs, screenshots,
                and extracted watch details that you add to your searches. This data is stored so we can
                display and rank your listings.
              </li>
              <li>
                <span className="text-zinc-300 font-medium">Usage data</span> — AI call counts and search/listing
                counts, used to enforce plan limits.
              </li>
              <li>
                <span className="text-zinc-300 font-medium">Billing data</span> — if you subscribe, payment
                is handled entirely by Stripe. We store only your Stripe customer ID; we never see or store
                your card details.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">3. How we use your data</h2>
            <ul className="space-y-3 list-disc list-inside marker:text-zinc-600">
              <li>To authenticate you and maintain your session.</li>
              <li>To store and display your watch searches and listings.</li>
              <li>To pass listing content to Claude (Anthropic&rsquo;s AI) for extraction, scoring, and questionnaire generation. Content sent to Claude is subject to <a href="https://www.anthropic.com/privacy" className="text-amber-400 hover:text-amber-300" target="_blank" rel="noopener noreferrer">Anthropic&rsquo;s Privacy Policy</a>.</li>
              <li>To process subscription payments via Stripe.</li>
              <li>We do not sell, rent, or share your personal data with third parties for marketing purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">4. Third-party services</h2>
            <div className="space-y-3">
              <div>
                <p className="text-zinc-300 font-medium">Supabase</p>
                <p>Handles authentication (magic link / OTP) and database storage. Data is stored in the EU (AWS eu-west-1). <a href="https://supabase.com/privacy" className="text-amber-400 hover:text-amber-300" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a>.</p>
              </div>
              <div>
                <p className="text-zinc-300 font-medium">Stripe</p>
                <p>Handles all payment processing. We never store card details. <a href="https://stripe.com/privacy" className="text-amber-400 hover:text-amber-300" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a>.</p>
              </div>
              <div>
                <p className="text-zinc-300 font-medium">Anthropic (Claude API)</p>
                <p>Listing content and user-provided text is sent to Anthropic for AI processing. <a href="https://www.anthropic.com/privacy" className="text-amber-400 hover:text-amber-300" target="_blank" rel="noopener noreferrer">Anthropic Privacy Policy</a>.</p>
              </div>
              <div>
                <p className="text-zinc-300 font-medium">Vercel</p>
                <p>Hosts the application. Request logs may be retained for up to 30 days. <a href="https://vercel.com/legal/privacy-policy" className="text-amber-400 hover:text-amber-300" target="_blank" rel="noopener noreferrer">Vercel Privacy Policy</a>.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">5. Cookies and local storage</h2>
            <p>
              We use session cookies set by Supabase Auth to keep you logged in. We do not use
              tracking cookies, advertising cookies, or third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">6. Data retention</h2>
            <p>
              Your data is retained for as long as your account is active. You can request deletion at
              any time by emailing <a href="mailto:hello@watchscout.app" className="text-amber-400 hover:text-amber-300">hello@watchscout.app</a>.
              We will delete your account and all associated data within 30 days of your request.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">7. Your rights (GDPR)</h2>
            <p className="mb-3">If you are in the European Economic Area, you have the right to:</p>
            <ul className="space-y-1 list-disc list-inside marker:text-zinc-600">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate data.</li>
              <li>Request deletion of your data (&ldquo;right to be forgotten&rdquo;).</li>
              <li>Object to or restrict processing.</li>
              <li>Data portability.</li>
              <li>Lodge a complaint with your local data protection authority.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email <a href="mailto:hello@watchscout.app" className="text-amber-400 hover:text-amber-300">hello@watchscout.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">8. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. Material changes will be communicated
              via email. Continued use of the service after changes constitutes acceptance of the
              updated policy.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-zinc-800 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">© 2026 WatchScout. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
