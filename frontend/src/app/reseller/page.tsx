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
      'Standard Resellers get up to 8% discount, Elite Resellers get up to 15% discount, and Diamond tier partners receive up to 20% discount off standard retail pricing across all diamond packs and passes.',
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
    name: 'STANDARD RESELLER',
    discount: '8% OFF',
    requirements: 'Active Wallet Balance',
    color: 'from-cyan-500/20 to-blue-600/30 border-cyan-500/40 text-cyan-400',
    perks: ['8% discount on all diamond packs', 'Instant Player UID validation', 'Standard support desk'],
  },
  {
    name: 'ELITE RESELLER',
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
        <div className="relative overflow-hidden p-8 sm:p-12 rounded-xl bg-[#110e24] border border-purple-950/60 text-center space-y-6 shadow-2xl">
          <div className="absolute inset-0 cyber-grid opacity-35 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
          <div className="laser-line w-full absolute top-0 left-0" />

          <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-600/50 text-purple-300 text-xs font-mono font-semibold shadow-[0_0_10px_rgba(168,85,247,0.25)]">
            <Award className="w-3.5 h-3.5 text-cyan-300" /> [ WHOLESALE PARTNER PROGRAM ]
          </div>

          <h1 className="relative z-10 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Wholesale Gaming Top-Up Platform for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-purple-400">Sri Lanka</span>
          </h1>

          <p className="relative z-10 max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            Reliable recharge infrastructure for gaming shops, digital merchants, and independent resellers. Top up Free Fire diamonds and passes with instant UID validation and tiered wholesale discounts.
          </p>

          <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all neon-glow-btn"
            >
              Create Reseller Account <ArrowRight className="w-4 h-4 text-cyan-300" />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg bg-[#181434] border border-purple-950/80 hover:border-purple-500/50 text-slate-200 font-semibold text-xs uppercase tracking-wider transition-all hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]"
            >
              Login to Reseller Dashboard
            </Link>
          </div>
        </div>

        {/* Wholesale Tiers */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Wholesale Discount Tiers
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Discounts are automatically calculated at checkout according to your active partner tier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tiers.map((tier, idx) => {
              const isPopular = tier.name === 'GOLD RESELLER';
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-xl flex flex-col justify-between space-y-4 border transition-all ${
                    isPopular
                      ? 'bg-[#151230] border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] relative ring-1 ring-purple-400/40'
                      : 'bg-[#110e24] border-purple-950/60 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-purple-600 text-[10px] font-semibold tracking-wide text-white uppercase shadow-[0_0_10px_rgba(168,85,247,0.6)]">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-3 text-center">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-purple-400">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{tier.name}</h3>
                      <span className="inline-block mt-1.5 px-2.5 py-1 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
                        {tier.discount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{tier.requirements}</p>
                  </div>

                  <ul className="space-y-2 border-t border-white/[0.08] pt-4 text-left text-xs">
                    {tier.perks.map((perk, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Reseller Benefits Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-xl bg-[#110e24] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Under 30-Second Delivery</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Automated dispatch connects directly to game servers. Diamonds and passes land in your customer&apos;s account within seconds of purchase.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#110e24] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Prepaid Shadow Wallet</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Deposit via Dialog eZ Cash or bank transfer to maintain a float. Fulfill single or batch orders instantly without checkout friction.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#110e24] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Official & Ban-Safe</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Orders are fulfilled exclusively through authorized Garena Shell channels. Zero risk of account penalties or diamond clawbacks for your buyers.
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
            {resellerFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[#110e24] border border-white/[0.08] space-y-2"
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
      </div>
    </>
  );
}
