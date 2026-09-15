import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap,
  ShieldCheck,
  Award,
  ArrowRight,
  Gamepad2,
  CheckCircle2,
  Lock,
  Headphones,
  Star,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';
import { createClient } from '@supabase/supabase-js';
import {
  SITE_NAME,
  createCanonicalUrl,
  generateFAQSchema,
} from '@/lib/seo';

interface FeaturedGame {
  title: string;
  slug: string;
  category: string;
  image: string;
  badge: string;
  discount: string;
  available: boolean;
}

const defaultFeaturedGames: FeaturedGame[] = [
  {
    title: 'Garena Free Fire (SG / MY)',
    slug: 'free-fire',
    category: 'Battle Royale',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000',
    badge: 'Instant Delivery',
    discount: 'Starting from LKR 280.00',
    available: true,
  },
  {
    title: 'PUBG Mobile',
    slug: 'pubg-mobile',
    category: 'Battle Royale',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000',
    badge: 'Coming Soon',
    discount: 'In Development',
    available: false,
  },
  {
    title: 'Mobile Legends',
    slug: 'mobile-legends',
    category: 'MOBA',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000',
    badge: 'Coming Soon',
    discount: 'In Development',
    available: false,
  },
];

const resellerTiers = [
  {
    name: 'Silver Reseller',
    discount: '8% Off',
    minDeposit: 'LKR 5,000 Wallet Balance',
    sampleProfit: 'Profit ~LKR 50–200 per order',
    idealFor: 'Casual sellers & gaming friends',
  },
  {
    name: 'Gold Reseller',
    discount: '15% Off',
    minDeposit: 'LKR 15,000 Wallet Balance',
    sampleProfit: 'Profit ~LKR 100–450 per order',
    idealFor: 'Active WhatsApp & Facebook shops',
  },
  {
    name: 'Diamond Partner',
    discount: '20% Off',
    minDeposit: 'LKR 40,000 Monthly Volume',
    sampleProfit: 'Maximum wholesale margin',
    idealFor: 'Physical game centers & high volume hubs',
  },
];

const platformGuarantees = [
  {
    title: 'Direct UID Delivery in <30s',
    desc: 'Automated Garena Shell dispatch connects directly to the regional server. Diamonds credit to the target account within 30 seconds of payment.',
    badge: 'Fast Dispatch',
  },
  {
    title: 'Live Nickname Validation',
    desc: 'Verify the recipient in-game player name before payment. Eliminates lost funds from typographical errors in player IDs.',
    badge: 'Zero Mismatch',
  },
  {
    title: 'Dialog eZ Cash & Bank Transfers',
    desc: 'Pay instantly via Dialog eZ Cash automated SMS verification, local Sri Lankan bank transfers, or prepaid Shadow Wallet balance.',
    badge: 'Local Payments',
  },
  {
    title: 'Safe Garena Shells Only',
    desc: 'All recharges originate exclusively through official Garena Shell distributor channels. Zero third-party password access or ban risks.',
    badge: '100% Safe',
  },
];

const homepageFaqs = [
  {
    question: 'How fast will diamonds appear in my Free Fire account?',
    answer:
      'Orders paid via Shadow Wallet balance or Dialog eZ Cash are processed through our automated server gateway and typically credit your account in 10 to 30 seconds.',
  },
  {
    question: 'Do I need to share my Free Fire password or login details?',
    answer:
      'No. We only require your public numeric Player UID (found in your game profile). We never ask for your Google, Facebook, or Garena password.',
  },
  {
    question: 'How does Dialog eZ Cash payment work?',
    answer:
      'Transfer the exact order amount to our verified eZ Cash number (0765604635). Enter the TxID from your Dialog SMS receipt into our verification form for instant automated fulfillment.',
  },
  {
    question: 'How do Sri Lankan game resellers earn profit with ShadowTopUp?',
    answer:
      'Registered resellers get wholesale discounts of 8% to 20% below standard retail prices. You buy at wholesale and sell to your customers at standard retail, pocketing the margin instantly.',
  },
  {
    question: 'Can I generate branded receipts for my own customers?',
    answer:
      'Yes. When you top up as a reseller, you can enter your custom store name on the receipt. You can download or print official high-resolution transaction receipts to send to your buyers.',
  },
];

export const metadata: Metadata = {
  title: 'Free Fire Diamonds Sri Lanka | Fast Recharge & Reseller Platform | ShadowTopUp',
  description:
    'Instant Free Fire diamonds, Weekly Passes, and Monthly Passes in Sri Lanka. Automated Player UID verification, low LKR rates, Dialog eZ Cash, and wholesale reseller discounts.',
  alternates: {
    canonical: createCanonicalUrl('/'),
  },
};

async function getFeaturedGames(): Promise<FeaturedGame[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        return data.map((g: any) => ({
          title: g.title,
          slug: g.slug,
          category: g.category || 'Mobile',
          image:
            g.image_path ||
            'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000',
          badge:
            g.is_active || g.slug === 'free-fire'
              ? 'Instant Delivery'
              : 'Coming Soon',
          discount:
            g.is_active || g.slug === 'free-fire'
              ? 'Starting from LKR 280.00'
              : 'In Development',
          available: Boolean(g.is_active || g.slug === 'free-fire'),
        }));
      }
    }
  } catch (e) {
    // Fall back to defaults
  }
  return defaultFeaturedGames;
}

export default async function HomePage() {
  const games = await getFeaturedGames();
  const faqSchema = generateFAQSchema(homepageFaqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="space-y-16 pb-16">
        {/* Notice Banner */}
        <div className="bg-[#110e24] border-b border-slate-800/80 py-2 px-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            Independent top-up service in Sri Lanka. Not affiliated with or endorsed by Garena.
          </span>
        </div>

        {/* 1. Hero Section: Clean, Confident, Content-First */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#0f0c22] border border-slate-800/90 p-6 sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Clear Value Prop */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-950/40 border border-purple-800/50 text-purple-300 text-xs font-mono font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Free Fire Singapore & Malaysia Region
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                  Instant Free Fire Diamonds & Weekly Passes in Sri Lanka
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  Reload your Free Fire account in under 30 seconds with automatic Player UID nickname verification. Pay conveniently via Dialog eZ Cash, bank transfer, or prepaid wallet.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link
                    href="/games/free-fire"
                    className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs uppercase tracking-wider text-center transition-colors shadow-sm"
                  >
                    Top-Up Diamonds Now
                  </Link>

                  <Link
                    href="/reseller"
                    className="px-6 py-3 rounded-lg bg-[#181434] hover:bg-[#201b44] border border-slate-700/80 text-slate-200 font-semibold text-xs uppercase tracking-wider text-center transition-colors"
                  >
                    Wholesale Reseller Program
                  </Link>
                </div>

                {/* Trust Highlights */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-5 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Fast Delivery (&lt;30s)
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-purple-400" /> Real-Time Nickname Check
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Lock className="w-4 h-4 text-cyan-400" /> Dialog eZ Cash Verified
                  </span>
                </div>
              </div>

              {/* Right Column: Live Package Rates Preview Card */}
              <div className="lg:col-span-5">
                <div className="rounded-xl bg-[#15112e] border border-slate-800 p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Popular Recharges</span>
                      <h3 className="text-sm font-bold text-white">Live LKR Pricing</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      In Stock
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0e0b20] border border-slate-800/80 text-xs">
                      <div>
                        <span className="font-semibold text-white block">Weekly Membership Pass</span>
                        <span className="text-[10px] text-slate-400">450 Diamonds value</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">LKR 650.00</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0e0b20] border border-slate-800/80 text-xs">
                      <div>
                        <span className="font-semibold text-white block">100 Diamonds</span>
                        <span className="text-[10px] text-slate-400">Instant direct UID delivery</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">LKR 350.00</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0e0b20] border border-slate-800/80 text-xs">
                      <div>
                        <span className="font-semibold text-white block">Monthly VIP Pass</span>
                        <span className="text-[10px] text-slate-400">2,600 Diamonds value</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">LKR 3,200.00</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0e0b20] border border-slate-800/80 text-xs">
                      <div>
                        <span className="font-semibold text-white block">Weekly Lite Pass</span>
                        <span className="text-[10px] text-slate-400">120 Diamonds value</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">LKR 280.00</span>
                    </div>
                  </div>

                  <Link
                    href="/games/free-fire"
                    className="w-full py-2.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View All 20+ Packages</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Supported Games Catalog */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-semibold uppercase text-purple-400 tracking-wider">Catalog</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Supported Games</h2>
            </div>

            <Link
              href="/games"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              All Games &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {games.map((game, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#110e24] border border-slate-800 flex flex-col justify-between p-5 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="relative h-44 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        game.available
                          ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900/80 border border-slate-700 text-slate-400'
                      }`}
                    >
                      {game.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{game.category}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{game.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 font-mono">{game.discount}</p>
                  </div>
                </div>

                <div>
                  {game.available ? (
                    <Link
                      href={`/games/${game.slug}`}
                      className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                    >
                      Top-Up Now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-lg bg-[#0e0c1e] border border-slate-800 text-slate-500 font-semibold text-xs uppercase tracking-wider cursor-not-allowed"
                    >
                      In Development
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Why Choose ShadowTopUp: Structured, Factual Guarantees */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <span className="text-xs font-mono font-semibold uppercase text-purple-400 tracking-wider">Infrastructure</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Why Players & Resellers Choose Us</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {platformGuarantees.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#110e24] border border-slate-800 p-5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-950/50 text-purple-300 border border-purple-800/40">
                    {item.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-500">0{idx + 1}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Wholesale Reseller Program: Clean, Clear Comparison */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-semibold uppercase text-purple-400 tracking-wider">Business Partner Program</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Wholesale Reseller Tiers</h2>
              <p className="text-xs text-slate-400 mt-1">Automatic wholesale rates applied on checkout based on your tier.</p>
            </div>

            <Link
              href="/reseller"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              Full Reseller Guide &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {resellerTiers.map((tier, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#110e24] border border-slate-800 p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">{tier.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-md font-mono font-bold text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {tier.discount}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{tier.sampleProfit}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Requirement: {tier.minDeposit}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                  Best for: <strong className="text-slate-200">{tier.idealFor}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Customer Reviews Section Widget */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <CustomerReviewsSection />
        </section>

        {/* 6. Frequently Asked Questions */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <span className="text-xs font-mono font-semibold uppercase text-purple-400 tracking-wider">Help</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homepageFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#110e24] border border-slate-800/80 p-5 space-y-2"
              >
                <h3 className="text-sm font-semibold text-white">
                  {faq.question}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Bottom Action Banner: Solid & Confident */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#110e24] border border-slate-800 p-8 sm:p-10 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ready to Recharge Your Free Fire Account?
            </h2>
            <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed">
              Fast, reliable diamond and pass recharges with live player ID verification and Dialog eZ Cash support.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/games/free-fire"
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                Top-Up Free Fire Now
              </Link>
              <Link
                href="/how-it-works"
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#181434] hover:bg-[#201b44] border border-slate-700/80 text-slate-200 font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                How It Works
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
