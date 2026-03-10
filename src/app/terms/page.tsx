import Link from 'next/link'
import { WatchIcon } from '@/components/ui/watch-icon'

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-zinc-50 mb-2">Terms of Service</h1>
        <p className="text-sm text-zinc-500 mb-12">Last updated: March 2026</p>

        <div className="space-y-10 text-sm text-zinc-400 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">1. Acceptance of terms</h2>
            <p>
              By creating an account or using WatchScout, you agree to these Terms of Service.
              If you do not agree, do not use the service. These terms form a binding agreement
              between you and WatchScout. For questions, contact us at{' '}
              <a href="mailto:hello@watchscout.app" className="text-amber-400 hover:text-amber-300">hello@watchscout.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">2. What WatchScout does</h2>
            <p>
              WatchScout is a research assistant for buying pre-owned luxury watches. It helps you
              organise listings, generate seller questions, and rank options based on your preferences.
              WatchScout is a tool to support your decision-making — it does not buy or sell watches,
              act as a broker, or guarantee the accuracy of any listing data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">3. No financial or purchasing advice</h2>
            <p>
              AI-generated scores, offer suggestions, and market value estimates are informational
              only and do not constitute financial, investment, or purchasing advice. WatchScout
              makes no representations about the accuracy of extracted listing data, seller
              responses, or market valuations. Always conduct your own due diligence before making
              any purchase.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">4. Accounts</h2>
            <ul className="space-y-3 list-disc list-inside marker:text-zinc-600">
              <li>You must provide a valid email address to create an account.</li>
              <li>You are responsible for all activity under your account.</li>
              <li>You may not share your account credentials or use another person&rsquo;s account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">5. Subscriptions and payments</h2>
            <ul className="space-y-3 list-disc list-inside marker:text-zinc-600">
              <li>WatchScout offers a free plan and paid plans (Scout at €9.99/month, Pro at €19.99/month).</li>
              <li>Paid plans are billed monthly. Billing is handled by Stripe.</li>
              <li>Subscriptions automatically renew each month unless cancelled.</li>
              <li>You may cancel at any time from within the Stripe billing portal. Cancellation takes effect at the end of the current billing period — no partial refunds are issued for unused time.</li>
              <li>Prices may change with 30 days&rsquo; notice by email.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">6. Acceptable use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="space-y-2 list-disc list-inside marker:text-zinc-600">
              <li>Use the service for any unlawful purpose.</li>
              <li>Attempt to reverse-engineer, scrape, or automate access to the service beyond normal use.</li>
              <li>Upload content that infringes third-party intellectual property rights.</li>
              <li>Circumvent plan limits through multiple accounts or other means.</li>
              <li>Resell or sublicense access to the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">7. Intellectual property</h2>
            <p>
              The WatchScout application, design, and branding are our property. You retain ownership
              of any data you upload. You grant us a limited licence to process that data solely to
              provide the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">8. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, WatchScout is provided &ldquo;as is&rdquo; without
              warranties of any kind. We are not liable for any indirect, incidental, or consequential
              damages arising from your use of the service, including losses from watch purchases made
              using information derived from WatchScout. Our total liability to you for any claim shall
              not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">9. Service availability</h2>
            <p>
              We aim for high availability but do not guarantee uninterrupted access. We may suspend
              the service for maintenance or upgrade with reasonable notice where possible.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">10. Termination</h2>
            <p>
              You may delete your account at any time by contacting us. We may terminate or suspend
              your account for breach of these terms. On termination, your data will be deleted
              within 30 days unless required to be retained by law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">11. Governing law</h2>
            <p>
              These terms are governed by the laws of Portugal. Disputes shall be subject to
              the exclusive jurisdiction of the courts of Portugal, without prejudice to any
              mandatory consumer protection rights you may have in your country of residence.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-100 mb-3">12. Changes to these terms</h2>
            <p>
              We may update these terms. Material changes will be communicated by email with at
              least 14 days&rsquo; notice. Continued use after the effective date constitutes acceptance.
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
