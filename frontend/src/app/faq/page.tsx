import type { Metadata } from 'next';
import Link from 'next/link';
import {
  HelpCircle,
  ShieldCheck,
  Zap,
  CreditCard,
  Wallet,
  Award,
  ChevronRight,
  Home,
  ArrowRight,
} from 'lucide-react';
import {
  SITE_NAME,
  createCanonicalUrl,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from '@/lib/seo';

const comprehensiveFaqs = [
  {
    category: 'Top-Up & Delivery',
    items: [
      {
        question: 'How fast is diamond delivery on ShadowTopUp?',
        answer:
          'Orders are fulfilled automatically via direct game API integration. Delivery takes under 30 seconds once payment is verified.',
      },
      {
        question: 'Do I need to give my account password or login credentials?',
        answer:
          'Never! ShadowTopUp only requires your numeric Player UID. We will never ask for your Google, Facebook, Apple, or game account password.',
      },
      {
        question: 'What Free Fire servers and regions are supported?',
        answer:
          'We currently support Free Fire Singapore (SG) and Malaysia (MY) servers, which include Sri Lankan players.',
      },
      {
        question: 'Can I top up Free Fire MAX with ShadowTopUp?',
        answer:
          'Yes! Free Fire and Free Fire MAX share the exact same game servers, player accounts, and Player UIDs. Diamonds purchased here appear in both versions.',
      },
    ],
  },
  {
    category: 'Payments & Pricing',
    items: [
      {
        question: 'What payment methods can I use in Sri Lanka?',
        answer:
          'We accept Dialog eZ Cash automated SMS verification, direct Sri Lankan bank transfers (Commercial Bank, Sampath Bank, BOC, etc.), and Shadow Wallet balance.',
      },
      {
        question: 'How does Dialog eZ Cash verification work?',
        answer:
          'Send eZ Cash to our official merchant number (0765604635), enter the transaction reference from your SMS receipt into our verification form, and the system verifies and claims it automatically.',
      },
      {
        question: 'What happens if a bank transfer receipt takes time to approve?',
        answer:
          'Bank slips uploaded during normal working hours are reviewed by our verification team in 5 to 15 minutes.',
      },
    ],
  },
  {
    category: 'Reseller Partner Program',
    items: [
      {
        question: 'How much can I earn as a top-up reseller?',
        answer:
          'Our reseller program offers tiered wholesale discounts up to 20% off retail pricing, allowing gaming shops and top-up vendors in Sri Lanka to maximize profit margins.',
      },
      {
        question: 'How do I upgrade to Silver or Gold reseller status?',
        answer:
          'Sign in to your ShadowTopUp dashboard, deposit funds into your Shadow Wallet, and request your desired tier. Upgrades are evaluated and approved quickly.',
      },
      {
        question: 'Can I generate customized receipts for my customers?',
        answer:
          'Yes! Our built-in receipt generator lets resellers set their custom store name and download branded PDF/image receipts.',
      },
    ],
  },
  {
    category: 'Safety, Refunds & Support',
    items: [
      {
        question: 'Will my Free Fire account get banned or flagged?',
        answer:
          'No. All diamond deliveries are processed strictly through official Garena Shell redemption pathways. Your account will never receive negative diamonds or bans.',
      },
      {
        question: 'What happens if my top-up fails?',
        answer:
          'If a transaction fails due to third-party maintenance or incorrect UID, the funds are immediately refunded to your Shadow Wallet balance, and you can retry or contact support.',
      },
      {
        question: 'How do I contact customer support?',
        answer:
          'You can reach our team via WhatsApp, Telegram, email at support@shadowstore.com, or through our Contact page.',
      },
    ],
  },
];

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | ShadowTopUp',
  description:
    'Find answers to common questions about Free Fire diamond top-ups in Sri Lanka, Player UID verification, Dialog eZ Cash payments, reseller discounts, and order safety on ShadowTopUp.',
  alternates: {
    canonical: createCanonicalUrl('/faq'),
  },
  openGraph: {
    title: `Frequently Asked Questions (FAQ) | ${SITE_NAME}`,
    description:
      'Answers to common questions regarding Free Fire top-ups, payment methods, delivery times, and reseller pricing in Sri Lanka.',
    url: createCanonicalUrl('/faq'),
    type: 'website',
    siteName: SITE_NAME,
    images: [
      {
        url: '/logo-wide.png',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Frequently Asked Questions`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Frequently Asked Questions (FAQ) | ${SITE_NAME}`,
    description:
      'Answers to common questions regarding Free Fire top-ups, payments, and reseller pricing.',
    images: ['/logo-wide.png'],
  },
};

export default function FAQPage() {
  const flatFaqs = comprehensiveFaqs.flatMap((group) => group.items);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'FAQ', path: '/faq' },
  ]);
  const faqSchema = generateFAQSchema(flatFaqs);

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
          <span className="text-cyan-400 font-bold">Frequently Asked Questions</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" /> KNOWLEDGE BASE
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-xs sm:text-sm leading-relaxed">
            Everything you need to know about Free Fire diamond recharge, delivery speed, Sri Lankan payment methods, and our wholesale reseller program.
          </p>
        </div>

        {/* Grouped FAQ Sections */}
        <div className="space-y-10">
          {comprehensiveFaqs.map((group, gIdx) => (
            <section key={gIdx} className="space-y-4">
              <h2 className="text-xl font-black text-white uppercase tracking-wide border-b border-purple-950/40 pb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                {group.category}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.items.map((faq, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-2 shadow-lg"
                  >
                    <h3 className="text-sm font-bold text-white flex items-start gap-2">
                      <span className="text-cyan-400 font-mono shrink-0">Q:</span>
                      <span>{faq.question}</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed pl-5">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact Callout */}
        <div className="p-8 rounded-3xl bg-[#141229] border border-purple-950/50 text-center space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-white">Still Have Questions?</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Our customer support desk is active 24/7 to assist with order tracking, player verification, or reseller inquiries.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              CONTACT SUPPORT DESK <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
