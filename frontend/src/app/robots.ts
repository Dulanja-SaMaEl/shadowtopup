import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const isPreviewDeployment =
    process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production';

  // Prevent indexing on Vercel preview or staging deployments
  if (isPreviewDeployment) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
      sitemap: `${siteUrl}/sitemap.xml`,
      host: siteUrl,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/games',
          '/games/',
          '/reseller',
          '/how-it-works',
          '/faq',
          '/about',
          '/contact',
          '/refund-policy',
          '/terms',
          '/privacy',
        ],
        disallow: [
          '/admin/',
          '/admin',
          '/dashboard/',
          '/dashboard',
          '/cart/',
          '/cart',
          '/api/',
          '/auth/',
          '/login',
          '/register',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
