import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, ChevronRight, Headphones } from 'lucide-react';
import ContactClient from './ContactClient';
import {
  SITE_NAME,
  createCanonicalUrl,
  generateBreadcrumbSchema,
} from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Contact ShadowTopUp | Customer Support Desk',
  description:
    'Contact the ShadowTopUp gaming support desk. Inquiries regarding Free Fire diamond top-ups, Dialog eZ Cash verification, order status, or reseller upgrades.',
  alternates: {
    canonical: createCanonicalUrl('/contact'),
  },
  openGraph: {
    title: `Contact ${SITE_NAME} | Customer Support Desk`,
    description:
      'Contact ShadowTopUp support desk for top-up assistance, eZ Cash verification, and reseller accounts.',
    url: createCanonicalUrl('/contact'),
    type: 'website',
    siteName: SITE_NAME,
    images: [
      {
        url: '/logo-wide.png',
        width: 1200,
        height: 630,
        alt: `Contact ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Contact ${SITE_NAME} | Customer Support Desk`,
    description: 'Contact ShadowTopUp support desk for top-up assistance.',
    images: ['/logo-wide.png'],
  },
};

export default function ContactPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Contact Support', path: '/contact' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-mono text-slate-400 border-b border-purple-950/30 pb-4"
        >
          <Link href="/" className="hover:text-cyan-400 flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-cyan-400 font-bold">Contact Support</span>
        </nav>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase">
            <Headphones className="w-3.5 h-3.5" /> 24/7 ASSISTANCE
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Contact & Customer Support
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Have a question regarding your Garena Free Fire top-up, Dialog eZ Cash deposit, or reseller membership? Send us a message!
          </p>
        </div>

        {/* Interactive Contact Form & Cards */}
        <ContactClient />
      </div>
    </>
  );
}
