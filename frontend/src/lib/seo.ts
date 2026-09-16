/**
 * Centralized SEO & Structured Data Utility for ShadowTopUp
 */

export const SITE_NAME = 'Shadow Store';
export const DEFAULT_SITE_TITLE = 'Shadow Store | Instant Gaming Top-Up & Wholesale Reseller Portal';
export const DEFAULT_SITE_DESCRIPTION =
  'Fast, automated Garena Free Fire diamond top-ups, Free Fire MAX passes, instant player UID verification, and wholesale reseller rates for Sri Lankan gamers.';

/**
 * Resolves official production canonical URL
 * Honors NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL, falling back to https://www.shadowstorelk.com
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
 * Organization Schema (Schema.org / Google Search)
 */
export function generateOrganizationSchema() {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: SITE_NAME,
    url: siteUrl,
    logo: `${siteUrl}/logo-square.png`,
    image: `${siteUrl}/og-image.png`,
    description: DEFAULT_SITE_DESCRIPTION,
    priceRange: 'LKR',
    currenciesAccepted: 'LKR',
    paymentAccepted: 'Dialog eZ Cash, Bank Transfer, Shadow Wallet, PayPal',
    areaServed: {
      '@type': 'Country',
      name: 'Sri Lanka',
    },
    founder: {
      '@type': 'Person',
      name: 'Dulanja Abeysinghe',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+94765604635',
      contactType: 'customer service',
      availableLanguage: ['English', 'Sinhala'],
      contactOption: 'TollFree',
    },
    sameAs: [],
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
    name: SITE_NAME,
    url: siteUrl,
    description: DEFAULT_SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/games?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
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
 * Product & Offer Schema for Game Packages
 */
export function generateGameProductSchema({
  gameTitle,
  gameSlug,
  description,
  minPrice = 140,
  maxPrice = 11500,
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

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${gameTitle} Top Up (Sri Lanka)`,
    description,
    url: pageUrl,
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
      price: minPrice,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
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
