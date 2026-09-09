import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8 text-slate-300">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Return to Home
      </Link>

      <div className="space-y-3 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Lock className="w-4 h-4" /> Privacy & Data Protection
        </div>
        <h1 className="text-3xl font-black text-white uppercase">Privacy Policy</h1>
        <p className="text-xs text-slate-400 font-mono">Effective date: September 2026</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
          <p>
            When using ShadowTopUp, we collect information necessary to process your digital orders, including your email address, target Player Game UID (for delivery verification), order receipts, and transaction history.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. How Information Is Used</h2>
          <p>
            Your information is used exclusively for:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-xs">
            <li>Verifying player accounts with game servers before delivery</li>
            <li>Automating digital top-up dispatch and transaction logging</li>
            <li>Managing your Shadow Wallet balance and reseller tiers</li>
            <li>Providing customer support and order audit history</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Data Security & Storage</h2>
          <p>
            All communications and database queries use industry-standard HTTPS TLS encryption and PostgreSQL Row Level Security (RLS). We never sell, lease, or distribute customer details to any third-party marketing companies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. Contacting Support</h2>
          <p>
            For any questions or data inquiries regarding your account, please reach out via our support channels or visit our <Link href="/contact" className="text-cyan-400 hover:underline">Contact Page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
