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
  SITE_URL,
  createCanonicalUrl,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateHowToSchema,
} from '@/lib/seo';

const guideFaqs = [
  {
    question: 'Where can I find my Free Fire Player UID?',
    answer:
      'Open Free Fire, tap on your avatar or profile banner in the top-left corner of the main lobby. Your numeric Player ID (8 to 11 digits) is displayed underneath your nickname. Tap the copy icon next to it.',
  },
  {
    question: 'Is it safe to share my Player UID with Shadow Store?',
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
  title: 'How It Works | Free Fire Top Up Guide | Shadow Store',
  description:
    'Learn how to recharge Free Fire diamonds and passes on Shadow Store in simple steps. Automated Player UID verification, secure payment, and instant delivery.',
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
        url: '/og-image.png',
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
    images: ['/og-image.png'],
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
      desc: 'Paste your UID into Shadow Store and press "Check". Our live API connects to game servers and verifies your in-game nickname so you never top up the wrong account.',
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

  const howToSchema = generateHowToSchema(
    steps.map((s) => ({
      name: s.title,
      text: s.desc,
      url: `${SITE_URL}/how-it-works#step-${s.num}`,
    }))
  );

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
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
        <div className="p-8 sm:p-12 rounded-xl bg-[#110e24] border border-white/[0.08] text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 text-purple-400" /> Step-by-Step Guide
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            How Free Fire Top-Up Works
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            Recharge your Free Fire account in 5 simple steps. We never ask for your game password, Facebook login, or Google account credentials.
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl bg-[#110e24] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center gap-5 transition-colors hover:border-white/20"
            >
              <div className="w-11 h-11 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                {step.num}
              </div>
              <div className="space-y-1 flex-1">
                <span className="text-xs font-mono font-medium text-purple-400 uppercase tracking-wider">
                  {step.badge}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white">{step.title}</h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Banner */}
        <div className="p-8 rounded-xl bg-[#110e24] border border-white/[0.08] text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Ready to recharge your diamonds?</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Test our real-time Player UID verification and enjoy instant delivery to your game account.
          </p>
          <div className="pt-2">
            <Link
              href="/games/free-fire"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              Top Up Free Fire Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
              <HelpCircle className="w-4 h-4" /> FAQ
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Top-Up Process Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guideFaqs.map((faq, idx) => (
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
