/**
 * Centralized SEO & Structured Data Engine for Shadow Store
 * Official Production Domain: https://www.shadowstorelk.com
 */

export const SITE_NAME = 'Shadow Store';
export const SITE_URL = 'https://www.shadowstorelk.com';
export const DEFAULT_SITE_TITLE = 'Shadow Store | Free Fire Diamonds Sri Lanka & Instant Gaming Top-Up';
export const DEFAULT_SITE_DESCRIPTION =
  'Buy Free Fire diamonds, weekly passes, and memberships in Sri Lanka with automated 30-second UID delivery. Pay securely via Dialog eZ Cash, bank transfer, or Shadow Wallet with wholesale reseller discounts.';

/**
 * Resolves official production canonical URL
 * Strictly honors HTTPS and enforces https://www.shadowstorelk.com
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0 && !envUrl.includes('shadowtopup.com')) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'https://www.shadowstorelk.com';
}

/**
 * Builds absolute canonical URL without trailing slashes
 */
export function createCanonicalUrl(path: string = ''): string {
  const baseUrl = getSiteUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/') return baseUrl;
  return `${baseUrl}${cleanPath.replace(/\/+$/, '')}`;
}

/**
 * Organization Schema (Schema.org / Google Knowledge Graph)
 */
export function generateOrganizationSchema() {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': `${siteUrl}/#organization`,
    name: SITE_NAME,
    alternateName: ['Shadow Store LK', 'ShadowStore', 'Shadow Store Sri Lanka'],
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo-square.png`,
      width: 1024,
      height: 1024,
      caption: 'Shadow Store Official Monogram Logo',
    },
    image: `${siteUrl}/og-image.png`,
    description: DEFAULT_SITE_DESCRIPTION,
    priceRange: 'LKR 100 - LKR 28804',
    currenciesAccepted: 'LKR',
    paymentAccepted: 'Dialog eZ Cash, Direct Bank Transfer, Shadow Wallet, Commercial Bank, BOC, Sampath Bank',
    areaServed: {
      '@type': 'Country',
      name: 'Sri Lanka',
      identifier: 'LK',
    },
    founder: {
      '@type': 'Person',
      name: 'Dulanja Abeysinghe',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+94765604635',
        contactType: 'customer service',
        availableLanguage: ['English', 'Sinhala'],
        contactOption: 'TollFree',
        areaServed: 'LK',
        hoursAvailable: 'Mo-Su 00:00-24:00',
      },
    ],
    sameAs: [
      'https://wa.me/94765604635',
    ],
  };
}

/**
 * WebSite Schema with SearchAction
 */
export function generateWebSiteSchema() {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: SITE_NAME,
    url: siteUrl,
    description: DEFAULT_SITE_DESCRIPTION,
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/games?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
  };
}

/**
 * BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: createCanonicalUrl(item.path),
    })),
  };
}

/**
 * Product & AggregateOffer Schema for Game Packages
 */
export function generateGameProductSchema({
  gameTitle,
  gameSlug,
  description,
  minPrice = 100,
  maxPrice = 28804,
  inStock = true,
}: {
  gameTitle: string;
  gameSlug: string;
  description: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}) {
  const pageUrl = createCanonicalUrl(`/games/${gameSlug}`);
  const siteUrl = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${pageUrl}#product`,
    name: `${gameTitle} Diamonds Top Up (Sri Lanka)`,
    description,
    url: pageUrl,
    image: `${siteUrl}/og-image.png`,
    sku: `SKU-FF-LK-001`,
    category: 'Digital Gaming Currency',
    brand: {
      '@type': 'Brand',
      name: 'Garena',
    },
    offers: {
      '@type': 'AggregateOffer',
      url: pageUrl,
      priceCurrency: 'LKR',
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount: 20,
      priceValidUntil: '2026-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: siteUrl,
      },
    },
  };
}

/**
 * FAQPage Schema
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * HowTo Schema for Free Fire Top-Up Process
 */
export function generateHowToSchema(customSteps?: { name: string; text: string; url?: string }[]) {
  const siteUrl = getSiteUrl();
  const stepsToUse = customSteps && customSteps.length > 0
    ? customSteps.map((s, idx) => ({
        '@type': 'HowToStep',
        position: idx + 1,
        name: s.name,
        text: s.text,
        url: s.url || `${siteUrl}/games/free-fire`,
      }))
    : [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Enter and Verify Player UID',
          text: 'Input your numeric Free Fire Player Game UID and verify your in-game nickname live to ensure safe delivery without sharing your password.',
          url: `${siteUrl}/games/free-fire`,
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Select Diamond Package or Pass',
          text: 'Choose your desired recharge amount, including Weekly Lite, Weekly VIP, Monthly Pass, or bulk diamonds (25 to 11,500 diamonds).',
          url: `${siteUrl}/games/free-fire`,
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Complete Payment via Dialog eZ Cash or Bank',
          text: 'Pay using Dialog eZ Cash SMS RN verification, direct bank transfer, or prepaid Shadow Wallet. Diamonds credit to your Free Fire account in under 30 seconds.',
          url: `${siteUrl}/games/free-fire`,
        },
      ];

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Top Up Free Fire Diamonds in Sri Lanka',
    description: 'A step-by-step guide to recharging Free Fire diamonds and weekly passes instantly using numeric Player UID verification.',
    totalTime: 'PT1M',
    step: stepsToUse,
  };
}

/**
 * WebPage Schema for Informational & Policy Pages
 */
export function generateWebPageSchema({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  const pageUrl = createCanonicalUrl(path);
  const siteUrl = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    description,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: SITE_NAME,
      url: siteUrl,
    },
    inLanguage: 'en-US',
  };
}
