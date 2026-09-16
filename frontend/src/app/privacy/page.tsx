import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, Home, ChevronRight } from 'lucide-react';
import {
  SITE_NAME,
  createCanonicalUrl,
  generateBreadcrumbSchema,
} from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Privacy Policy | Shadow Store',
  description:
    'Privacy Policy and user data protection details for Shadow Store. Learn how we handle Player UIDs, transaction records, and account data securely.',
  alternates: {
    canonical: createCanonicalUrl('/privacy'),
  },
  openGraph: {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: 'Privacy policy and user data protection details.',
    url: createCanonicalUrl('/privacy'),
    type: 'website',
    siteName: SITE_NAME,
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Privacy Policy | ${SITE_NAME}`,
    description: 'Privacy policy and user data protection details.',
    images: ['/og-image.png'],
  },
};

export default function PrivacyPolicyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Privacy Policy', path: '/privacy' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
          <span className="text-cyan-400 font-bold">Privacy Policy</span>
        </nav>

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
              When using Shadow Store, we collect information necessary to process your digital orders, including your email address, target Player Game UID (for delivery verification), order receipts, and transaction history.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. How Information Is Used</h2>
            <p>Your information is used exclusively for:</p>
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
              For any questions or data inquiries regarding your account, please reach out via our support channels or visit our{' '}
              <Link href="/contact" className="text-cyan-400 hover:underline">
                Contact Page
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
