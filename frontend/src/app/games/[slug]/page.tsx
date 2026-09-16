import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Home, ShieldCheck, Zap, HelpCircle, CheckCircle2 } from 'lucide-react';
import GameRechargeClient from './GameRechargeClient';
import {
  SITE_NAME,
  createCanonicalUrl,
  generateBreadcrumbSchema,
  generateGameProductSchema,
  generateFAQSchema,
} from '@/lib/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SUPPORTED_GAMES_METADATA: Record<
  string,
  {
    title: string;
    h1: string;
    description: string;
    minPrice: number;
    maxPrice: number;
    faqs: { question: string; answer: string }[];
  }
> = {
  'free-fire': {
    title: 'Free Fire Diamonds Sri Lanka | Instant Top-Up & Passes | Shadow Store',
    h1: 'Garena Free Fire Diamonds Top Up (Sri Lanka)',
    description:
      'Recharge Free Fire diamonds and passes in Sri Lanka with instant Player UID nickname verification. Fast automated delivery in 30 seconds via Dialog eZ Cash, Bank Transfer, and Shadow Wallet.',
    minPrice: 100,
    maxPrice: 28804,
    faqs: [
      {
        question: 'How long does a Free Fire diamond top-up take to deliver?',
        answer:
          'Our top-up system is fully automated. Once your payment or wallet transaction is verified, Free Fire diamonds and passes are credited to your game account in under 30 seconds.',
      },
      {
        question: 'Do I need my Free Fire account password to recharge?',
        answer:
          'No! Never share your game password. Shadow Store only requires your numeric Player Game UID. Our system verifies your in-game nickname live before you pay to ensure safe delivery.',
      },
      {
        question: 'What payment methods are supported in Sri Lanka?',
        answer:
          'We support Dialog eZ Cash automated payment verification, direct Sri Lankan bank transfers (Commercial Bank, Sampath Bank, Bank of Ceylon, etc.), and instant Shadow Wallet top-up.',
      },
      {
        question: 'Can I purchase Free Fire memberships and Level Up passes?',
        answer:
          'Yes. We support Weekly Lite Pass, Weekly VIP Membership, Monthly Subscription, Level Up Passes (Lv.6 to Lv.30), and Evo Gun passes with official Garena Shell fulfillment.',
      },
      {
        question: 'How do reseller discounts work for Free Fire diamonds?',
        answer:
          'Registered resellers unlock tiered wholesale pricing from Standard Reseller (8% off) to Elite Reseller (15% off) automatically on all diamond packs and subscriptions.',
      },
    ],
  },
  'pubg-mobile': {
    title: 'PUBG Mobile UC Recharge Sri Lanka | Shadow Store',
    h1: 'PUBG Mobile Unknown Cash (UC) Top Up',
    description:
      'PUBG Mobile UC top-up service in Sri Lanka with Character ID verification. Coming soon on Shadow Store.',
    minPrice: 350,
    maxPrice: 15000,
    faqs: [
      {
        question: 'When will PUBG Mobile UC top-up be available?',
        answer:
          'PUBG Mobile Unknown Cash (UC) top-up is currently under development and will launch with Character ID automated validation.',
      },
    ],
  },
  'mobile-legends': {
    title: 'Mobile Legends Diamonds Sri Lanka | Shadow Store',
    h1: 'Mobile Legends: Bang Bang Diamonds Top Up',
    description:
      'Direct top-up for Mobile Legends Diamonds and Weekly Diamond Pass in Sri Lanka via User ID and Zone ID. Coming soon on Shadow Store.',
    minPrice: 280,
    maxPrice: 12000,
    faqs: [
      {
        question: 'How will Mobile Legends top-up work?',
        answer:
          'You will enter your MLBB User ID and Zone ID for instant diamond delivery once this service goes live.',
      },
    ],
  },
};

export async function generateStaticParams() {
  return [{ slug: 'free-fire' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const gameData = SUPPORTED_GAMES_METADATA[slug] || {
    title: `${slug.toUpperCase().replace(/-/g, ' ')} Top Up Sri Lanka | Shadow Store`,
    h1: `${slug.toUpperCase().replace(/-/g, ' ')} Recharge`,
    description: `Instant ${slug.toUpperCase().replace(/-/g, ' ')} recharge service in Sri Lanka with automated player UID verification on Shadow Store.`,
    minPrice: 100,
    maxPrice: 28804,
    faqs: [],
  };

  const canonicalUrl = createCanonicalUrl(`/games/${slug}`);

  return {
    title: gameData.title,
    description: gameData.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${gameData.title} | ${SITE_NAME}`,
      description: gameData.description,
      url: canonicalUrl,
      type: 'website',
      siteName: SITE_NAME,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${gameData.h1} - ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${gameData.title} | ${SITE_NAME}`,
      description: gameData.description,
      images: ['/og-image.png'],
    },
  };
}

export default async function GameDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const gameData = SUPPORTED_GAMES_METADATA[slug] || {
    title: `${slug.toUpperCase().replace(/-/g, ' ')} Top Up`,
    h1: `${slug.toUpperCase().replace(/-/g, ' ')} Recharge`,
    description: `Instant digital game top-up for Sri Lankan gamers.`,
    minPrice: 140,
    maxPrice: 11500,
    faqs: [],
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Games Catalog', path: '/games' },
    { name: gameData.h1, path: `/games/${slug}` },
  ]);

  const productSchema = generateGameProductSchema({
    gameTitle: gameData.h1,
    gameSlug: slug,
    description: gameData.description,
    minPrice: gameData.minPrice,
    maxPrice: gameData.maxPrice,
    inStock: slug === 'free-fire',
  });

  const faqSchema =
    gameData.faqs.length > 0 ? generateFAQSchema(gameData.faqs) : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Visual Breadcrumb Bar */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-mono text-slate-400 border-b border-purple-950/30 pb-4"
        >
          <Link href="/" className="hover:text-cyan-400 flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link href="/games" className="hover:text-cyan-400 transition-colors">
            Games Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-cyan-400 font-bold truncate">{gameData.h1}</span>
        </nav>

        {/* Client Interactive Recharge Engine (UID Verification, Package Selection, Reviews) */}
        <GameRechargeClient slug={slug} />

        {/* Semantic Information & Trust Section */}
        <section className="bg-[#141229] border border-purple-950/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
              --- HOW IT WORKS ---
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
              How to Top Up Free Fire Diamonds on Shadow Store
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-white">Enter Your Player UID</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Find your 8–11 digit numeric Player ID in your Free Fire profile. Click Check to verify your in-game nickname automatically.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 font-mono font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-white">Select Diamonds or Pass</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose from Weekly Lite, Weekly Pass, Monthly VIP, or Diamond packs ranging from 25 to 11,500 diamonds at wholesale LKR rates.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-white">Pay & Receive Instantly</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Checkout with Dialog eZ Cash SMS verification, Bank Slip upload, or Shadow Wallet. Diamonds are delivered to your Free Fire account in &lt;30s.
              </p>
            </div>
          </div>
        </section>

        {/* Game FAQs Section */}
        {gameData.faqs.length > 0 && (
          <section className="space-y-6 pt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" /> FREQUENTLY ASKED QUESTIONS
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wide">
                Free Fire Top-Up Questions & Answers
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameData.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#141229] border border-purple-950/40 space-y-2"
                >
                  <h3 className="text-sm font-bold text-white flex items-start gap-2">
                    <span className="text-cyan-400 shrink-0 font-mono">Q:</span>
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
