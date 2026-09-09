import Link from 'next/link';
import { ShieldCheck, FileText, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8 text-slate-300">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Return to Home
      </Link>

      <div className="space-y-3 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
          <FileText className="w-4 h-4" /> Legal Documentation
        </div>
        <h1 className="text-3xl font-black text-white uppercase">Terms of Service</h1>
        <p className="text-xs text-slate-400 font-mono">Last revised: September 2026</p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <strong className="text-white block mb-1">Independent Third-Party Service Disclaimer:</strong>
          ShadowTopUp is an independent third-party recharge and reseller platform. ShadowTopUp is NOT affiliated with, sponsored by, or endorsed by Garena, Sea Limited, or any of their respective titles. All game titles, logos, and trademarks belong to their respective copyright holders.
        </div>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Service Scope & Digital Fulfillment</h2>
          <p>
            ShadowTopUp facilitates top-ups for digital gaming credits and memberships via automated systems and official channel redemptions. By submitting an order, you warrant that you are the authorized holder of the target Player UID or have explicit permission to purchase top-ups on behalf of the account owner.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Player UID Accuracy & Verification</h2>
          <p>
            Our system provides real-time Player UID nickname verification before payment dispatch. It is the customer's sole responsibility to ensure that the target Player ID is correct. Once a digital top-up has been successfully dispatched to a player account, digital credits cannot be reversed or retrieved.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Shadow Wallet & Payments</h2>
          <p>
            Credits added to your Shadow Wallet balance can be used to instantly fulfill gaming packages. All transactions are logged with cryptographic identifiers. In the event an automated top-up cannot be fulfilled due to third-party maintenance, the full purchase value will be automatically refunded to your Shadow Wallet balance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. Reseller Partner Program</h2>
          <p>
            Silver and Gold reseller partner accounts must adhere to ethical resale guidelines. Reseller discounts are governed by wholesale margins set within the platform. Misuse of the platform or fraudulent payment attempts will result in immediate account termination.
          </p>
        </section>
      </div>
    </div>
  );
}
