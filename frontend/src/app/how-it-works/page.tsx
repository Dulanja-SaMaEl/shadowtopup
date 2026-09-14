import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Home,
  ChevronRight,
  Gamepad2,
  Wallet,
} from 'lucide-react';
import {
  SITE_NAME,
  createCanonicalUrl,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from '@/lib/seo';

const guideFaqs = [
  {
    question: 'Where can I find my Free Fire Player UID?',
    answer:
      'Open Free Fire, tap on your avatar or profile banner in the top-left corner of the main lobby. Your numeric Player ID (8 to 11 digits) is displayed underneath your nickname. Tap the copy icon next to it.',
  },
  {
    question: 'Is it safe to share my Player UID with ShadowTopUp?',
    answer:
      'Yes, 100% safe. Your Player UID is public in-game information used solely to send diamonds. We never ask for your account password, email, or social media login.',
  },
  {
    question: 'What happens if I type the wrong Player UID?',
    answer:
      'Our live verification engine fetches and displays the actual in-game nickname associated with the UID before you proceed. If the nickname does not match your account, do not proceed and re-check your number.',
  },
  {
    question: 'How does Dialog eZ Cash top-up work?',
    answer:
      'Transfer the exact LKR amount to our registered eZ Cash merchant number, copy the transaction ID from your Dialog SMS receipt, and paste it into our deposit verification box. The system verifies it instantly via automated Firebase SMS verification.',
  },
];

export const metadata: Metadata = {
  title: 'How It Works | Free Fire Top Up Guide | ShadowTopUp',
  description:
    'Learn how to recharge Free Fire diamonds and passes on ShadowTopUp in 3 simple steps. Automated Player UID verification, secure payment, and instant delivery.',
  alternates: {
    canonical: createCanonicalUrl('/how-it-works'),
  },
  openGraph: {
    title: `How It Works | Free Fire Top Up Guide | ${SITE_NAME}`,
    description:
      'Step-by-step guide to recharging Free Fire diamonds safely in Sri Lanka with automated nickname validation.',
    url: createCanonicalUrl('/how-it-works'),
    type: 'website',
    siteName: SITE_NAME,
    images: [
      {
        url: '/logo-wide.png',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} How It Works Guide`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `How It Works | Free Fire Top Up Guide | ${SITE_NAME}`,
    description:
      'Step-by-step guide to recharging Free Fire diamonds safely in Sri Lanka.',
    images: ['/logo-wide.png'],
  },
};

export default function HowItWorksPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
  ]);

  const faqSchema = generateFAQSchema(guideFaqs);

  const steps = [
    {
      num: '01',
      title: 'Find & Copy Your Free Fire Player UID',
      desc: 'Open Garena Free Fire on your mobile device. Click your player profile card at the top-left of the screen. Look for the numeric Player ID (8–11 digits) and copy it.',
      badge: 'Step 1',
    },
    {
      num: '02',
      title: 'Automatic Live Nickname Verification',
      desc: 'Paste your UID into ShadowTopUp and press "Check". Our live API connects to game servers and verifies your in-game nickname so you never top up the wrong account.',
      badge: 'Step 2',
    },
    {
      num: '03',
      title: 'Choose Diamond Pack or Pass',
      desc: 'Select from Weekly Lite, Weekly Pass, Monthly VIP, or Diamond bundles ranging from 25 to 11,500 diamonds at competitive wholesale LKR prices.',
      badge: 'Step 3',
    },
    {
      num: '04',
      title: 'Pay Securely (eZ Cash, Bank Transfer, or Wallet)',
      desc: 'Complete payment using Dialog eZ Cash automated verification, direct Sri Lankan bank transfer (upload receipt), or instant prepaid Shadow Wallet.',
      badge: 'Step 4',
    },
    {
      num: '05',
      title: 'Instant Delivery in Under 30 Seconds',
      desc: 'Our automated fulfillment engine credits diamonds directly to your game account in seconds. Check your in-game mailbox or diamond balance immediately!',
      badge: 'Step 5',
    },
  ];

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
          <span className="text-cyan-400 font-bold">How It Works</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-cyan-400" /> TOP-UP WALKTHROUGH
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            HOW SHADOWTOPUP WORKS
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-xs sm:text-sm leading-relaxed">
            Recharge your favorite games in 5 easy steps without ever giving out your account password or login credentials.
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl bg-[#141229] border border-purple-950/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg shadow-cyan-500/20">
                {step.num}
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                  {step.badge}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white">{step.title}</h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-[#141229] to-purple-950/60 border border-purple-900/40 text-center space-y-4 shadow-xl">
          <h2 className="text-2xl font-black text-white uppercase">READY TO RECHARGE?</h2>
          <p className="text-xs text-slate-300 max-w-lg mx-auto">
            Experience the fastest Free Fire diamond top-up engine in Sri Lanka.
          </p>
          <div className="pt-2">
            <Link
              href="/games/free-fire"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
            >
              TOP UP FREE FIRE NOW <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" /> HELPFUL FAQS
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">
              Top-Up Process Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guideFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#141229] border border-purple-950/40 space-y-2"
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
      </div>
    </>
  );
}
