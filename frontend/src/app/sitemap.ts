import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const currentDate = new Date();

  // Core static public pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/games`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/games/free-fire`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${siteUrl}/reseller`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/how-it-works`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic game pages from Supabase (if configured)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: games } = await supabase
        .from('games')
        .select('slug, updated_at, is_active')
        .eq('is_active', true);

      if (games && Array.isArray(games)) {
        for (const game of games) {
          if (game.slug && game.slug !== 'free-fire') {
            staticRoutes.push({
              url: `${siteUrl}/games/${game.slug}`,
              lastModified: game.updated_at ? new Date(game.updated_at) : currentDate,
              changeFrequency: 'weekly',
              priority: 0.85,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('Sitemap dynamic games fetch error, using default routes:', err);
  }

  return staticRoutes;
}
