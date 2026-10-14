'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Trophy,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Wallet,
  ArrowRight,
  HelpCircle,
  Home,
  ChevronRight,
  X,
  PhoneCall,
  Sparkles,
  Clock,
  BadgePercent,
  Check,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface ResellerClientProps {
  faqs: FaqItem[];
}

export default function ResellerClient({ faqs }: ResellerClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'standard' | 'elite'>('standard');

  const adminWhatsAppNumber = '94765604635';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs font-mono text-slate-400 border-b border-purple-950/30 pb-4"
      >
        <Link href="/" className="hover:text-cyan-400 flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-amber-400 font-bold">Reseller Program</span>
      </nav>

      {/* Hero Header */}
      <div className="relative overflow-hidden p-8 sm:p-12 rounded-2xl bg-[#110e24] border border-purple-950/60 text-center space-y-6 shadow-2xl">
        <div className="absolute inset-0 cyber-grid opacity-35 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
        <div className="laser-line w-full absolute top-0 left-0" />

        {/* Clean Reseller Header Pill (No internal debug brackets) */}
        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/70 border border-purple-600/50 text-purple-300 text-xs font-semibold shadow-[0_0_12px_rgba(168,85,247,0.25)]">
          <Award className="w-4 h-4 text-cyan-300" />
          <span>RESELLER PROGRAM</span>
        </div>

        <h1 className="relative z-10 text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Official Gaming Top-Up Reseller Platform for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-purple-400">Sri Lanka</span>
        </h1>

        <p className="relative z-10 max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
          High-margin recharge infrastructure for gaming shops, digital vendors, and independent sellers.
          Fulfill Free Fire diamonds and memberships in 30 seconds with automated UID verification.
        </p>

        {/* Action Buttons: Apply for Reseller opens Preview Modal */}
        <div className="relative z-10 flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_28px_rgba(168,85,247,0.6)] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" /> Apply for Reseller
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#181434] border border-purple-900/60 hover:border-purple-500/50 text-slate-200 font-semibold text-xs uppercase tracking-wider transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] text-center"
          >
            Reseller Dashboard
          </Link>
        </div>
      </div>

      {/* Tier Comparison Cards (Standard vs Elite) */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Reseller Membership Tiers
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Choose the tier that fits your store. Wholesale discounts apply automatically at checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* STANDARD TIER CARD */}
          <div className="p-7 rounded-2xl bg-[#110e24] border border-purple-950/60 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-6 shadow-xl relative group">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                  Permanent Validity
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Standard Reseller</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-cyan-400">FREE</span>
                  <span className="text-xs text-slate-400 font-medium">for verified sellers</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-center gap-2">
                <BadgePercent className="w-4 h-4 text-cyan-400 shrink-0" />
                <span><strong>Up to 5% Discount</strong> off standard retail prices</span>
              </div>

              <ul className="space-y-3 pt-2 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Free registration for shop owners & sellers</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Requires simple admin verification / approval</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Permanent</strong> lifetime reseller account validity</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Automated 30-second Free Fire UID delivery</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Prepaid Shadow Wallet balance integration</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setSelectedTier('standard');
                setIsModalOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Apply for Standard <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* ELITE TIER CARD */}
          <div className="p-7 rounded-2xl bg-[#14102e] border-2 border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:border-purple-400 transition-all flex flex-col justify-between space-y-6 relative group">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
              Recommended for High Volume
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start pt-1">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> 1 Year Validity
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Elite Reseller</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-amber-400">Starting 2,000 LKR</span>
                  <span className="text-xs text-slate-400 font-medium">paid tier</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-center gap-2">
                <BadgePercent className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Up to 10% Special Discount</strong> for maximum profit</span>
              </div>

              <ul className="space-y-3 pt-2 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Maximum wholesale profit margin on all packages</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Valid for 1 year</strong> after activation</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Contact admin directly for activation details</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Custom store name branding on customer receipts</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>VIP priority queue top-up processing</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setSelectedTier('elite');
                setIsModalOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              Apply for Elite <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Reseller Benefits Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-[#110e24] border border-white/[0.08] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Under 30-Second Delivery</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Automated server dispatch. Diamonds and memberships credit to your customer&apos;s Player ID in seconds.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#110e24] border border-white/[0.08] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wallet className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Prepaid Shadow Wallet</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Deposit via Dialog eZ Cash or bank transfer. Fulfill orders smoothly without checkout delays.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#110e24] border border-white/[0.08] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Official & Safe</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Fulfilled exclusively through official Garena channels. Zero risk of account penalties or clawbacks.
          </p>
        </div>
      </section>

      {/* Reseller FAQs */}
      <section className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
            <HelpCircle className="w-4 h-4" /> FAQ
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Frequently Asked Questions by Resellers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#110e24] border border-white/[0.08] space-y-2"
            >
              <h3 className="text-sm font-semibold text-white">
                {faq.question}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE RESELLER APPLICATION & PREVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#110e24] border border-purple-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                RESELLER APPLICATION & PREVIEW
              </span>
              <h3 className="text-2xl font-black text-white">
                Choose Your Reseller Partnership
              </h3>
              <p className="text-xs text-slate-400">
                Review tier benefits and proceed with instant application or contact our admin team.
              </p>
            </div>

            {/* Tier Selector Tabs */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-black/40 border border-purple-950/60">
              <button
                onClick={() => setSelectedTier('standard')}
                className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedTier === 'standard'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Standard (Free)
              </button>
              <button
                onClick={() => setSelectedTier('elite')}
                className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedTier === 'elite'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Elite (Paid • 2,000 LKR)
              </button>
            </div>

            {/* Tier Detail Body */}
            {selectedTier === 'standard' ? (
              <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-cyan-900/40 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-cyan-400" /> Standard Reseller Tier
                    </h4>
                    <p className="text-xs text-slate-400">Permanent access for digital top-up sellers</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xl font-black text-cyan-400">FREE</span>
                    <span className="block text-[10px] text-cyan-300/80 font-mono">Requires Admin Approval</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400" />
                    <span><strong>Discount:</strong> Up to 5% discounted retail prices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400" />
                    <span><strong>Validity:</strong> Permanent / Lifetime validity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400" />
                    <span><strong>Requirement:</strong> Admin verification via dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400" />
                    <span><strong>Fulfillment:</strong> Automated Player UID direct top-up</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/dashboard"
                    className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-600/30"
                  >
                    Go to Dashboard to Apply <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-amber-900/40 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-400" /> Elite Reseller Tier
                    </h4>
                    <p className="text-xs text-slate-400">Highest margin wholesale partnership</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xl font-black text-amber-400">2,000 LKR</span>
                    <span className="block text-[10px] text-amber-300/80 font-mono">Starting Price • 1 Year</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span><strong>Discount:</strong> Up to 10% special discounted retail prices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span><strong>Validity:</strong> Valid for 1 year after activation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span><strong>Store Branding:</strong> Custom store name printed on receipts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span><strong>Activation:</strong> Contact Admin directly for details & activation</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent('Hello Shadow Store Admin, I want to activate the Elite Reseller Tier (Starting 2000 LKR / 1 Year Validity). Please send activation details.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
                  >
                    <PhoneCall className="w-4 h-4" /> Contact Admin on WhatsApp
                  </a>
                  <Link
                    href="/dashboard"
                    className="flex-1 py-3 rounded-xl bg-[#1c183b] border border-purple-900/60 hover:border-purple-500 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-center"
                  >
                    View in Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
