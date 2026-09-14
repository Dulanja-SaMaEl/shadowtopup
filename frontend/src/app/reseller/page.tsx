import type { Metadata } from 'next';
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
  TrendingUp,
  Home,
  ChevronRight,
} from 'lucide-react';
import {
  SITE_NAME,
  createCanonicalUrl,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from '@/lib/seo';

const resellerFaqs = [
  {
    question: 'How do I become a Free Fire top-up reseller in Sri Lanka?',
    answer:
      'Create an account on ShadowTopUp, top up your Shadow Wallet balance via Dialog eZ Cash or Bank Transfer, and request a reseller tier upgrade directly from your user dashboard.',
  },
  {
    question: 'What discounts do resellers get on Free Fire diamonds?',
    answer:
      'Silver resellers get up to 8% discount, Gold resellers get up to 15% discount, and Diamond tier partners receive up to 20% discount off standard retail pricing across all diamond packs and passes.',
  },
  {
    question: 'How are reseller orders fulfilled?',
    answer:
      'Reseller orders use our automated dispatch engine. Deductions are made from your prepaid Shadow Wallet balance, and diamonds are delivered to your customer’s Player UID in under 30 seconds.',
  },
  {
    question: 'Can resellers generate branded receipts for their customers?',
    answer:
      'Yes! ShadowTopUp allows resellers to input their custom store name and generate branded customer receipts with player nickname and transaction ID.',
  },
];

export const metadata: Metadata = {
  title: 'Gaming Top Up Reseller Program | ShadowTopUp',
  description:
    'Join the ShadowTopUp wholesale gaming reseller program in Sri Lanka. Unlock automated wholesale discounts on Free Fire diamonds, passes, instant UID delivery, and prepaid wallet orders.',
  alternates: {
    canonical: createCanonicalUrl('/reseller'),
  },
  openGraph: {
    title: `Gaming Top Up Reseller Program | ${SITE_NAME}`,
    description:
      'Wholesale reseller program for gaming top-ups in Sri Lanka. Earn up to 20% margin on Free Fire diamonds with automated delivery.',
    url: createCanonicalUrl('/reseller'),
    type: 'website',
    siteName: SITE_NAME,
    images: [
      {
        url: '/logo-wide.png',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Wholesale Reseller Program`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Gaming Top Up Reseller Program | ${SITE_NAME}`,
    description:
      'Wholesale reseller discounts on Free Fire diamonds and passes for Sri Lankan top-up shops.',
    images: ['/logo-wide.png'],
  },
};

const tiers = [
  {
    name: 'SILVER RESELLER',
    discount: '8% OFF',
    requirements: 'Active Wallet Balance',
    color: 'from-cyan-500/20 to-blue-600/30 border-cyan-500/40 text-cyan-400',
    perks: ['8% discount on all diamond packs', 'Instant Player UID validation', 'Standard support desk'],
  },
  {
    name: 'GOLD RESELLER',
    discount: '15% OFF',
    requirements: 'High Volume Top-Ups',
    color: 'from-amber-500/20 to-yellow-600/30 border-amber-500/40 text-amber-400',
    perks: ['15% wholesale discount', 'Custom receipt store branding', 'Priority queue top-up fulfillment'],
  },
  {
    name: 'DIAMOND RESELLER',
    discount: '20% OFF',
    requirements: 'Bulk Commercial Vendor',
    color: 'from-indigo-500/20 to-purple-600/30 border-purple-500/40 text-purple-300',
    perks: ['20% wholesale discount', 'Dedicated WhatsApp support desk', 'Instant wallet deposit approvals'],
  },
  {
    name: 'HEROIC PARTNER',
    discount: 'VIP ACCESS',
    requirements: 'Platform Partner',
    color: 'from-red-500/20 to-rose-600/30 border-red-500/40 text-red-400',
    perks: ['VIP pricing margins', 'Exclusive early access to new games', 'Dedicated account manager'],
  },
  {
    name: 'GRANDMASTER',
    discount: 'MAX MARGIN',
    requirements: 'Enterprise Top-Up Hub',
    color: 'from-emerald-500/20 to-teal-600/30 border-emerald-500/40 text-emerald-400',
    perks: ['Maximum wholesale pricing', 'Custom API integration access', '24/7 direct hotline'],
  },
];

export default function ResellerProgramPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Reseller Program', path: '/reseller' },
  ]);

  const faqSchema = generateFAQSchema(resellerFaqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

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
        <div className="relative overflow-hidden p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#141229] via-[#0c0a1a] to-[#120f26] border border-purple-950/50 shadow-2xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" /> WHOLESALE GAMING TOP-UP PARTNER PROGRAM
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            START YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400">GAMING TOP-UP BUSINESS</span> IN SRI LANKA
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-xs sm:text-sm leading-relaxed">
            ShadowTopUp provides Sri Lanka&apos;s leading wholesale gaming recharge infrastructure. Reload Free Fire diamonds and memberships for your clients with automatic Player UID validation and tiered wholesale discounts.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              CREATE RESELLER ACCOUNT <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              LOGIN TO DASHBOARD
            </Link>
          </div>
        </div>

        {/* 5 Wholesale Tiers */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
              RESELLER DISCOUNT TIERS
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Discounts are automatically calculated at checkout based on your approved membership tier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tiers.map((tier, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-3xl bg-gradient-to-b border flex flex-col justify-between space-y-4 ${tier.color}`}
              >
                <div className="space-y-3 text-center">
                  <Trophy className="w-8 h-8 mx-auto opacity-90" />
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-wider">{tier.name}</h3>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full bg-black/50 text-xs font-mono font-bold">
                      {tier.discount}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono opacity-75">{tier.requirements}</p>
                </div>

                <ul className="space-y-2 border-t border-white/10 pt-4 text-left text-[11px]">
                  {tier.perks.map((perk, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-1.5 opacity-90">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Reseller Benefits Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Under 30-Second Delivery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never make your customers wait. Automated redemption ensures diamonds are delivered to target Free Fire accounts instantly.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Prepaid Shadow Wallet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deposit via Dialog eZ Cash or bank transfer to keep balance ready. Execute multi-package orders seamlessly with zero checkout delays.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Zero Account Bans</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fulfillment occurs strictly through verified official Garena Shell top-up channels. Safe for your clients&apos; Free Fire accounts.
            </p>
          </div>
        </section>

        {/* Reseller FAQs */}
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" /> RESELLER FAQ
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">
              Frequently Asked Questions by Resellers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resellerFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#141229] border border-purple-950/40 space-y-2"
              >
                <h3 className="text-sm font-bold text-white flex items-start gap-2">
                  <span className="text-amber-400 font-mono shrink-0">Q:</span>
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed pl-5">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
