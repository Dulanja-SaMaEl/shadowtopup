import type { Metadata } from 'next';
import Link from 'next/link';
import { Zap, ShieldCheck, Award, Cpu, Home, ChevronRight, CheckCircle2 } from 'lucide-react';
import {
  SITE_NAME,
  createCanonicalUrl,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
} from '@/lib/seo';

export const metadata: Metadata = {
  title: 'About ShadowTopUp | Gaming Top Up Platform Sri Lanka',
  description:
    'Learn about ShadowTopUp, Sri Lanka’s premier automated gaming recharge and wholesale reseller platform for Garena Free Fire diamonds and passes.',
  alternates: {
    canonical: createCanonicalUrl('/about'),
  },
  openGraph: {
    title: `About ${SITE_NAME} | Gaming Top Up Platform`,
    description:
      'Sri Lanka’s premier automated gaming recharge and wholesale reseller platform.',
    url: createCanonicalUrl('/about'),
    type: 'website',
    siteName: SITE_NAME,
    images: [
      {
        url: '/logo-wide.png',
        width: 1200,
        height: 630,
        alt: `About ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `About ${SITE_NAME}`,
    description:
      'Sri Lanka’s premier automated gaming recharge and wholesale reseller platform.',
    images: ['/logo-wide.png'],
  },
};

export default function AboutPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
  ]);

  const orgSchema = generateOrganizationSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-mono text-slate-400 border-b border-purple-950/30 pb-4"
        >
          <Link href="/" className="hover:text-cyan-400 flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-cyan-400 font-bold">About Us</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-cyan-400" /> About ShadowTopUp
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            The Next-Gen Game Top-Up & Reseller Platform
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed">
            Designed and built by <span className="text-cyan-400 font-semibold">Dulanja Abeysinghe</span>, ShadowTopUp provides high-speed automated Garena Free Fire shell redemptions, instant player UID verification, and structured bulk pricing tiers for commercial resellers in Sri Lanka.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Automated Dispatch Engine</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrated real-time APIs automate shell balance validation, player nickname checks, and instant order delivery in under 30 seconds.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Tiered Reseller System</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Commercial top-up vendors and gaming shops unlock exclusive discounts through structured Silver, Gold, and Diamond wholesale tiers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Zero Storage Overhead</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bank transfer receipts and media are hosted securely on cloud storage APIs, maintaining high-speed serverless performance on Vercel and Supabase.
            </p>
          </div>
        </div>

        {/* Commitment to Transparency */}
        <section className="p-8 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white">Our Mission & Security Standards</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            ShadowTopUp was created to eliminate top-up scams and delays in the Sri Lankan gaming ecosystem. By requiring only the numeric Player UID and performing real-time account name verification, gamers and parents never risk sharing private account passwords or login credentials.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> 100% Legitimate Redemptions
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <CheckCircle2 className="w-4 h-4" /> No Password Required
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <CheckCircle2 className="w-4 h-4" /> 24/7 Verified Support
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
