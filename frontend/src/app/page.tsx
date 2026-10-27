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
  RefreshCw,
} from 'lucide-react';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';
import { createClient } from '@supabase/supabase-js';
import { getRestockAlert } from '@/lib/restockAlertService';
import { formatCurrency } from '@/lib/pricing';
import { OFFICIAL_GARENA_PACKAGES } from '@/lib/garenaPackages';
import { VisaLogo, MastercardLogo } from '@/components/PaymentLogos';
import {
  SITE_NAME,
  createCanonicalUrl,
  generateFAQSchema,
} from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    discount: 'Starting from LKR 100.00',
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
    name: 'Standard Reseller',
    discount: 'Up to 5% Off',
    pricing: 'Free for Sellers',
    validity: 'Permanent Validity',
    verification: 'Requires Admin Approval',
    sampleProfit: 'Save up to 5% on retail top-up packages',
    idealFor: 'Independent top-up sellers & casual shops',
  },
  {
    name: 'Elite Reseller',
    discount: 'Up to 10% Off',
    pricing: 'Starting 2,000 LKR / year',
    validity: '1 Year Validity',
    verification: 'Contact Admin for Details & Activation',
    sampleProfit: 'Special discounted wholesale pricing across all packages',
    idealFor: 'High-volume merchants, gaming shops & top-up hubs',
  },
];

const platformGuarantees = [
  {
    title: 'Direct UID Delivery',
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
      'Transfer the exact order amount to our verified eZ Cash number (0765604635). Enter the RN number from your Dialog SMS receipt into our verification form for instant automated fulfillment.',
  },
  {
    question: 'How do Sri Lankan game resellers earn profit with Shadow Store?',
    answer:
      'Registered resellers get wholesale discounts of 8% to 15% below standard retail prices. You buy at wholesale and sell to your customers at standard retail, pocketing the margin instantly.',
  },
  {
    question: 'Can I generate branded receipts for my own customers?',
    answer:
      'Yes. When you top up as a reseller, you can enter your custom store name on the receipt. You can download or print official high-resolution transaction receipts to send to your buyers.',
  },
];

export const metadata: Metadata = {
  title: 'Free Fire Diamonds Sri Lanka | Instant Top-Up & Wholesale Reseller | Shadow Store',
  description:
    'Instant Free Fire diamonds, Weekly Passes, and Monthly VIP in Sri Lanka. Automated Player UID verification, low LKR rates, Dialog eZ Cash, and wholesale reseller discounts.',
  alternates: {
    canonical: createCanonicalUrl('/'),
  },
  openGraph: {
    title: 'Free Fire Diamonds Sri Lanka | Instant Top-Up & Wholesale Reseller | Shadow Store',
    description:
      'Instant Free Fire diamonds, Weekly Passes, and Monthly VIP in Sri Lanka. Automated Player UID verification, low LKR rates, Dialog eZ Cash, and wholesale reseller discounts.',
    url: createCanonicalUrl('/'),
    type: 'website',
    siteName: SITE_NAME,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Shadow Store - Free Fire Diamonds Sri Lanka Top-Up',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Fire Diamonds Sri Lanka | Instant Top-Up & Wholesale Reseller | Shadow Store',
    description:
      'Instant Free Fire diamonds, Weekly Passes, and Monthly VIP in Sri Lanka. Automated Player UID verification, low LKR rates, Dialog eZ Cash, and wholesale reseller discounts.',
    images: ['/og-image.png'],
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
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        const sortedGames = [...data].sort((a: any, b: any) => {
          if (a.slug === 'free-fire') return -1;
          if (b.slug === 'free-fire') return 1;
          if (a.is_active && !b.is_active) return -1;
          if (!a.is_active && b.is_active) return 1;
          return 0;
        });

        return sortedGames.map((g: any) => ({
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
              ? 'Starting from LKR 100.00'
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

async function getHeroPackages() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes('your-supabase-project')) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true);
      if (!error && data && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    // Fall back to offline defaults
  }
  return OFFICIAL_GARENA_PACKAGES;
}

export default async function HomePage() {
  const [games, restockAlert, heroPackages] = await Promise.all([
    getFeaturedGames(),
    getRestockAlert(),
    getHeroPackages(),
  ]);
  const faqSchema = generateFAQSchema(homepageFaqs);

  // Match live package pricing
  const weeklyPkg =
    heroPackages.find(
      (p) =>
        p.id === '11111111-1111-1111-1111-111111111010' ||
        p.package_name?.toLowerCase().includes('weekly sub') ||
        p.package_name?.toLowerCase().includes('weekly mem')
    ) || heroPackages.find((p) => p.shell_cost === 86);

  const d100Pkg =
    heroPackages.find(
      (p) =>
        p.id === '11111111-1111-1111-1111-111111111002' ||
        (p.diamond_amount === 100 && (p.package_type === 'diamond' || p.package_name?.toLowerCase().includes('100')))
    );

  const monthlyPkg =
    heroPackages.find(
      (p) =>
        (p.id === '11111111-1111-1111-1111-111111111011' || p.package_name?.toLowerCase().includes('monthly')) &&
        p.is_active !== false
    );

  const litePkg =
    heroPackages.find(
      (p) =>
        p.id === '11111111-1111-1111-1111-111111111009' ||
        p.package_name?.toLowerCase().includes('lite')
    );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="space-y-12 pb-16">
        {/* Visa & Mastercard Live Announcement Banner */}
        <div className="bg-gradient-to-r from-purple-950 via-[#0e172a] to-cyan-950 border-b border-cyan-500/30 py-2.5 px-4 text-center text-xs text-slate-200 flex flex-wrap items-center justify-center gap-3 shadow-lg">
          <div className="flex items-center gap-1.5 shrink-0">
            <VisaLogo className="w-7 h-4.5" />
            <MastercardLogo className="w-7 h-4.5" />
          </div>
          <span className="font-semibold text-white">
            <strong className="text-cyan-300">NOW ACCEPTING:</strong> Visa &amp; Mastercard Online Card Payments Live!
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="text-slate-300 text-[11px] font-mono flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" /> Instant Automated Delivery
          </span>
          <Link
            href="/games/free-fire"
            className="text-[11px] font-bold text-cyan-300 hover:text-cyan-200 underline decoration-cyan-400/50 underline-offset-2 ml-1"
          >
            Pay with Card &rarr;
          </Link>
        </div>

        {/* Notice Banner */}
        <div className="bg-[#110e24] border-b border-slate-800/80 py-2 px-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            Independent top-up service in Sri Lanka. Not affiliated with or endorsed by Garena.
          </span>
        </div>

        {/* 1. Hero Section: Esports Cyber-Dark Gaming Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl bg-[#0f0c22] border border-purple-900/40 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl">
            {/* Ambient Cyber Grid Backdrop */}
            <div className="absolute inset-0 cyber-grid opacity-60 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
            
            {/* Top Laser Accent Rim */}
            <div className="laser-line w-full absolute top-0 left-0" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Clear Value Prop with Tactical HUD */}
              <div className="lg:col-span-7 space-y-5">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Instant Free Fire Diamonds &amp; Memberships in{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-purple-300">
                    Sri Lanka
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  Reload your Free Fire account in under 30 seconds with automatic Player UID nickname verification. Pay securely via <strong className="text-white">Visa &amp; Mastercard</strong>, Dialog eZ Cash, Sri Lankan bank transfer, or prepaid wallet.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 font-gaming">
                  <Link
                    href="/games/free-fire"
                    className="px-6 py-3.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider text-center transition-all neon-glow-btn flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-cyan-300 fill-cyan-300" />
                    <span>Top-Up Diamonds Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/reseller"
                    className="px-6 py-3.5 rounded-lg bg-[#181434] hover:bg-[#201b44] border border-purple-800/60 hover:border-purple-500/50 text-slate-200 font-semibold text-xs uppercase tracking-wider text-center transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                  >
                    Apply for Reseller
                  </Link>
                </div>

                {/* Trust Highlights with Tactical Badges */}
                <div className="pt-4 border-t border-purple-950/60 flex flex-wrap items-center gap-5 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-300 font-mono">
                    <span className="flex items-center gap-1">
                      <VisaLogo className="w-6 h-4" />
                      <MastercardLogo className="w-6 h-4" />
                    </span>
                    Visa / Mastercard Live
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Fast Automated Delivery
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300 font-mono">
                    <ShieldCheck className="w-4 h-4 text-purple-400" /> Live Nickname Check
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300 font-mono">
                    <Lock className="w-4 h-4 text-cyan-400" /> Dialog eZ Cash
                  </span>
                </div>
              </div>

              {/* Right Column: Live Package Rates Preview Card with Neon Rim */}
              <div className="lg:col-span-5">
                <div className="rounded-xl bg-[#15112e] neon-border-purple p-5 space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-purple-950/60">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-purple-400 font-semibold block">POPULAR PACKAGES</span>
                      <h3 className="text-sm font-bold text-white">Live LKR Rates</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-semibold">
                      IN STOCK
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0e0b20] border border-purple-950/50 hover:border-purple-500/40 text-xs transition-colors">
                      <div>
                        <span className="font-semibold text-white block">Weekly Membership</span>
                        <span className="text-[10px] text-purple-300/80 font-mono">
                          {weeklyPkg?.diamond_amount ? `${weeklyPkg.diamond_amount} Diamonds value` : '445 Diamonds value'}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]">
                        {formatCurrency(weeklyPkg?.normal_price || 562)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0e0b20] border border-purple-950/50 hover:border-purple-500/40 text-xs transition-colors">
                      <div>
                        <span className="font-semibold text-white block">100 Diamonds</span>
                        <span className="text-[10px] text-purple-300/80 font-mono">Instant UID delivery</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]">
                        {formatCurrency(d100Pkg?.normal_price || 325)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0e0b20] border border-purple-950/50 hover:border-purple-500/40 text-xs transition-colors">
                      <div>
                        <span className="font-semibold text-white block">Monthly Membership</span>
                        <span className="text-[10px] text-purple-300/80 font-mono">
                          {monthlyPkg?.diamond_amount ? `${Number(monthlyPkg.diamond_amount).toLocaleString('en-US')} Diamonds value` : '2,500 Diamonds value'}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]">
                        {formatCurrency(monthlyPkg?.normal_price || 2862)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0e0b20] border border-purple-950/50 hover:border-purple-500/40 text-xs transition-colors">
                      <div>
                        <span className="font-semibold text-white block">Weekly Lite</span>
                        <span className="text-[10px] text-purple-300/80 font-mono">
                          {litePkg?.diamond_amount ? `${litePkg.diamond_amount} Diamonds value` : '90 Diamonds value'}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]">
                        {formatCurrency(litePkg?.normal_price || 137)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/games/free-fire"
                    className="w-full py-2.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  >
                    <span>View All 20+ Packages</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
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
                className="group rounded-xl bg-[#110e24] border border-purple-950/60 flex flex-col justify-between p-5 space-y-4 hover:border-purple-500/60 hover:shadow-[0_0_22px_rgba(168,85,247,0.25)] transition-all"
              >
                <div className="space-y-3">
                  <div className="relative h-44 rounded-lg overflow-hidden bg-slate-950 border border-purple-950/40">
                    <img
                      src={game.image}
                      alt={`${game.title} - Sri Lanka Gaming Recharge`}
                      width={400}
                      height={176}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <span
                      className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        game.available
                          ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.35)]'
                          : 'bg-slate-900/90 border border-slate-700 text-slate-400'
                      }`}
                    >
                      {game.badge}
                    </span>

                    {restockAlert?.enabled && game.slug === 'free-fire' && (
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/25 border border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)] flex items-center gap-1.5 animate-pulse">
                        <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                        <span>Restocking</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-semibold">{game.category}</span>
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{game.title}</span>
                      {restockAlert?.enabled && game.slug === 'free-fire' && (
                        <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Restocking Now
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-mono">{game.discount}</p>
                  </div>
                </div>

                <div className="font-gaming">
                  {game.available ? (
                    <Link
                      href={`/games/${game.slug}`}
                      className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all neon-glow-btn"
                    >
                      <span>Top-Up Now</span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-300" />
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

        {/* 3. Why Choose Shadow Store: Structured, Factual Guarantees */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="pb-4 border-b border-purple-950/60">
            <div>
              <span className="text-xs font-mono font-semibold uppercase text-purple-400 tracking-wider">Infrastructure</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Why Players & Resellers Choose Us</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {platformGuarantees.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#110e24] border border-purple-950/60 p-5 space-y-3 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/50 shadow-[0_0_8px_rgba(168,85,247,0.2)]">
                    {item.badge}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">0{idx + 1}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Wholesale Reseller Program: Clean, Clear Comparison */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 pb-4 border-b border-purple-950/60">
            <div>
              <span className="text-xs font-mono font-semibold uppercase text-purple-400 tracking-wider">Business Partner Program</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">Wholesale Reseller Tiers</h2>
              <p className="text-xs text-slate-400 mt-1">Automatic wholesale rates applied on checkout based on your tier.</p>
            </div>

            <Link
              href="/reseller"
              className="text-xs font-semibold text-purple-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              Apply for Reseller &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resellerTiers.map((tier, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#110e24] border border-purple-950/60 p-6 flex flex-col justify-between space-y-4 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">{tier.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-md font-mono font-bold text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                      {tier.discount}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{tier.sampleProfit}</p>
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                    <span className="px-2.5 py-1 rounded bg-purple-950/70 border border-purple-800/50 text-purple-300 font-semibold">
                      {tier.pricing}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-cyan-950/70 border border-cyan-800/50 text-cyan-300 font-semibold">
                      {tier.validity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Verification: <span className="text-slate-300">{tier.verification}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-purple-950/60 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Best for: <strong className="text-white font-medium">{tier.idealFor}</strong></span>
                  <Link href="/reseller" className="text-purple-400 hover:text-cyan-300 font-bold transition-colors">
                    Apply Now &rarr;
                  </Link>
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
              Fast, reliable diamond and membership recharges with live player ID verification and Dialog eZ Cash support.
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
