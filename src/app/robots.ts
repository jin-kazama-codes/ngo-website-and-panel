import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/admin/*', '/api/*'],
      },
      {
        // Block known AI scrapers that don't respect training opt-outs
        userAgent: ['GPTBot', 'CCBot', 'anthropic-ai', 'Claude-Web'],
        disallow: '/',
      },
    ],
    sitemap: 'https://www.mfcttrust.com/sitemap.xml',
    host: 'https://www.mfcttrust.com',
  };
}
