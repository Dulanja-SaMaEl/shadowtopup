import type { Metadata } from 'next';
import {
  SITE_NAME,
  createCanonicalUrl,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from '@/lib/seo';
import ResellerClient from './ResellerClient';

const resellerFaqs = [
  {
    question: 'How do I become a Free Fire top-up reseller in Sri Lanka?',
    answer:
      'Create an account on Shadow Store, top up your Shadow Wallet balance via Dialog eZ Cash or Bank Transfer, and click "Apply for Reseller" or submit your request from your dashboard.',
  },
  {
    question: 'What discounts do resellers get on Free Fire diamonds?',
    answer:
      'Standard Resellers get up to 5% discount (Free tier with permanent validity after admin verification), and Elite Resellers receive up to 10% special discount (Paid tier starting at 2,000 LKR, valid for 1 year).',
  },
  {
    question: 'How are reseller orders fulfilled?',
    answer:
      'Reseller orders use our automated dispatch engine. Deductions are made from your prepaid Shadow Wallet balance, and diamonds or memberships are delivered to your customer’s Player UID in under 30 seconds.',
  },
  {
    question: 'Can resellers generate branded receipts for their customers?',
    answer:
      'Yes! Elite Resellers can set their custom store name and generate branded customer receipts with player nickname and transaction ID.',
  },
];

export const metadata: Metadata = {
  title: 'Gaming Top Up Reseller Program | Shadow Store Sri Lanka',
  description:
    'Join the Shadow Store reseller program in Sri Lanka. Unlock wholesale discounts on Free Fire diamonds, memberships, instant UID delivery, and prepaid wallet orders.',
  alternates: {
    canonical: createCanonicalUrl('/reseller'),
  },
  openGraph: {
    title: `Gaming Top Up Reseller Program | ${SITE_NAME}`,
    description:
      'Reseller program for gaming top-ups in Sri Lanka. Earn wholesale profit margins on Free Fire diamonds with automated delivery.',
    url: createCanonicalUrl('/reseller'),
    type: 'website',
    siteName: SITE_NAME,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Reseller Program`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Gaming Top Up Reseller Program | ${SITE_NAME}`,
    description:
      'Reseller discounts on Free Fire diamonds and memberships for Sri Lankan top-up shops.',
    images: ['/og-image.png'],
  },
};

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

      <ResellerClient faqs={resellerFaqs} />
    </>
  );
}
