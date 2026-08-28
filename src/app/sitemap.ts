import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.mfcttrust.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { url: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/about', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/campaigns', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/communities', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/members', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/gallery', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/testimonials', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/niyamawali', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/impact-stories', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/emergency', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/privacy', priority: 0.4, changeFrequency: 'yearly' as const },
    { url: '/terms', priority: 0.4, changeFrequency: 'yearly' as const },
    { url: '/refund', priority: 0.4, changeFrequency: 'yearly' as const },
  ];

  return staticPages.map(({ url, priority, changeFrequency }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
