import type { Metadata } from 'next';
import Link from 'next/link';
import { RefreshCw, ArrowLeft, AlertCircle, Home, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import {
  SITE_NAME,
  SITE_URL,
  createCanonicalUrl,
  generateBreadcrumbSchema,
  generateWebPageSchema,
} from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Shadow Store Sri Lanka',
  description:
    'Read Shadow Store’s Refund and Cancellation Policy for Free Fire diamond top-ups, digital game passes, Dialog eZ Cash deposits, and wallet balance transactions.',
  alternates: {
    canonical: createCanonicalUrl('/refund-policy'),
  },
  openGraph: {
    title: `Refund & Cancellation Policy | ${SITE_NAME}`,
    description:
      'Transparent refund and cancellation terms for gaming top-ups and digital wallet transactions on Shadow Store.',
    url: createCanonicalUrl('/refund-policy'),
    type: 'website',
    siteName: SITE_NAME,
    images: [`${SITE_URL}/og-image.png`],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Refund & Cancellation Policy | ${SITE_NAME}`,
    description:
      'Transparent refund and cancellation terms for gaming top-ups and digital wallet transactions on Shadow Store.',
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function RefundPolicyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Refund Policy', path: '/refund-policy' },
  ]);

  const webPageSchema = generateWebPageSchema({
    title: 'Refund & Cancellation Policy | Shadow Store Sri Lanka',
    description:
      'Official Refund and Cancellation Policy for Free Fire diamonds, gaming credits, and digital transactions on Shadow Store.',
    path: '/refund-policy',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-slate-300">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-mono text-slate-400 border-b border-purple-950/30 pb-4"
        >
          <Link href="/" className="hover:text-cyan-400 flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-cyan-400 font-bold">Refund Policy</span>
        </nav>

        <div className="space-y-3 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            <RefreshCw className="w-4 h-4" /> Customer Protection & Trust
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-wide">
            Refund & Cancellation Policy
          </h1>
          <p className="text-xs text-slate-400 font-mono">Last updated: September 2026</p>
        </div>

        {/* Highlight Notice */}
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-cyan-400 mt-0.5" />
          <div>
            <strong className="text-white block mb-1">Instant Digital Products Policy:</strong>
            Because game top-ups (Free Fire diamonds, Level Up passes, and memberships) are intangible digital goods delivered directly to target Player IDs via live API integration, completed orders cannot be revoked, reversed, or refunded once fulfilled.
          </div>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              1. Eligible Refund Scenarios
            </h2>
            <p>
              You are entitled to a full refund or immediate wallet credit under the following specific conditions:
            </p>
            <ul className="space-y-2 list-disc list-inside text-slate-300 pl-2">
              <li>
                <strong className="text-white">API Fulfillment Failure:</strong> If the transaction was debited or paid for, but the digital items failed to credit to your game account due to server outages or automated delivery failure, our system will automatically refund 100% of the amount to your Shadow Wallet balance.
              </li>
              <li>
                <strong className="text-white">Duplicate Billing:</strong> If your Dialog eZ Cash, bank card, or wallet balance was debited multiple times for a single order due to network timeouts, contact our support desk with transaction references for a swift reversal of the duplicate charges.
              </li>
              <li>
                <strong className="text-white">Out of Stock Packages:</strong> If an ordered package is temporarily suspended or exhausted before server dispatch, the purchase amount will be credited back to your account wallet immediately.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              2. Non-Refundable Situations
            </h2>
            <p>Refunds cannot be granted under the following circumstances:</p>
            <ul className="space-y-2 list-disc list-inside text-slate-300 pl-2">
              <li>
                <strong className="text-white">Incorrect Player UID:</strong> Shadow Store provides an interactive real-time UID nickname checker. It is the customer&apos;s sole responsibility to confirm that the displayed in-game name matches their desired account before proceeding. Once diamonds are dispatched to the submitted Player ID, the game servers process them irrevocably.
              </li>
              <li>
                <strong className="text-white">Change of Mind:</strong> We cannot process refunds if you decide you no longer want the diamonds or pass after successful delivery.
              </li>
              <li>
                <strong className="text-white">In-Game Bans or Violations:</strong> Shadow Store dispatches 100% legitimate diamonds through authorized Garena channels. However, we are not responsible for any in-game penalties, suspensions, or account issues resulting from violations of Garena&apos;s terms of service, third-party software use, or shared credentials.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Shadow Wallet Deposits & Withdrawals</h2>
            <p>
              Funds deposited into your Shadow Wallet balance are designed for immediate or scheduled digital recharges at retail or wholesale reseller rates. If you accidentally deposit excessive funds via Dialog eZ Cash or Bank Transfer and have not spent them, you may request a manual withdrawal by contacting our support desk. Withdrawal requests may take 24–48 hours for bank verification and are subject to third-party payment gateway transaction fees (if applicable).
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Order Cancellation Timeline</h2>
            <p>
              Because orders are routed immediately to the automated dispatch engine upon payment confirmation, cancellation windows are strictly limited to pending or unpaid orders. Once an order enters the <span className="text-cyan-400 font-mono">“Processing”</span> or <span className="text-emerald-400 font-mono">“Completed”</span> state, automated dispatch has commenced and cancellation is no longer possible.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. How to Request Support or a Refund</h2>
            <p>
              If your transaction encountered an error, please reach out with your <strong>Order ID</strong>, <strong>Player UID</strong>, and <strong>Payment Proof / eZ Cash Transaction Ref</strong>:
            </p>
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/40 text-xs font-mono space-y-2">
              <p>WhatsApp Support: +94 77 692 9070</p>
              <p>Email: adminshadowstorelk.com@gmail.com</p>
              <p>Support Hours: 08:00 AM – 11:00 PM (Sri Lanka Time / IST, 7 Days a Week)</p>
            </div>
          </section>
        </div>

        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Homepage
          </Link>
          <Link
            href="/contact"
            className="text-xs font-mono text-purple-400 hover:underline"
          >
            Contact Customer Support
          </Link>
        </div>
      </div>
    </>
  );
}
