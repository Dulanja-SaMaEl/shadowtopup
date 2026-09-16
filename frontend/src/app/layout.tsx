import type { Metadata, Viewport } from 'next';
import { Inter, Chakra_Petch, Rajdhani } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import AppLayout from '@/components/AppLayout';
import PagePreloader from '@/components/PagePreloader';
import {
  getSiteUrl,
  SITE_NAME,
  DEFAULT_SITE_TITLE,
  DEFAULT_SITE_DESCRIPTION,
  generateOrganizationSchema,
  generateWebSiteSchema,
} from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const chakraPetch = Chakra_Petch({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-chakra',
});

const rajdhani = Rajdhani({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rajdhani',
});

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  themeColor: '#0a0814',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: DEFAULT_SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: `${SITE_NAME} Team`, url: siteUrl }],
  generator: 'Next.js',
  keywords: [
    'Free Fire diamonds Sri Lanka',
    'Free Fire top up Sri Lanka',
    'Free Fire diamond top up',
    'Free Fire weekly pass Sri Lanka',
    'Free Fire monthly pass Sri Lanka',
    'gaming top up Sri Lanka',
    'game recharge Sri Lanka',
    'Free Fire reseller Sri Lanka',
    'Free Fire wholesale Sri Lanka',
    'Dialog eZ Cash Free Fire topup',
    'instant Free Fire top up',
    'Shadow Store',
    'Shadow Store LK',
  ],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/logo-icon.png', type: 'image/png' },
      { url: '/logo-square.png', type: 'image/png' },
    ],
    apple: '/logo-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_LK',
    url: siteUrl,
    siteName: SITE_NAME,
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Instant Gaming Top-Up & Wholesale Reseller Portal`,
      },
      {
        url: '/logo-square.png',
        width: 1024,
        height: 1024,
        alt: `${SITE_NAME} Official Logo`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
    images: ['/og-image.png'],
    creator: '@ShadowStoreLK',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: {
      'msvalidate.01': process.env.BING_SITE_VERIFICATION || '',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${inter.variable} ${chakraPetch.variable} ${rajdhani.variable} font-sans`}>
        <Suspense fallback={null}>
          <PagePreloader />
        </Suspense>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
