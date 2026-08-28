import { NextResponse } from 'next/server';

const BASE_URL = 'https://www.mfcttrust.com';

const staticPages = [
  { url: '/', priority: '1.0', changeFrequency: 'weekly' },
  { url: '/about', priority: '0.9', changeFrequency: 'monthly' },
  { url: '/campaigns', priority: '0.9', changeFrequency: 'daily' },
  { url: '/communities', priority: '0.8', changeFrequency: 'weekly' },
  { url: '/members', priority: '0.8', changeFrequency: 'weekly' },
  { url: '/gallery', priority: '0.7', changeFrequency: 'weekly' },
  { url: '/testimonials', priority: '0.7', changeFrequency: 'monthly' },
  { url: '/niyamawali', priority: '0.7', changeFrequency: 'monthly' },
  { url: '/contact', priority: '0.8', changeFrequency: 'monthly' },
  { url: '/impact-stories', priority: '0.7', changeFrequency: 'weekly' },
  { url: '/emergency', priority: '0.9', changeFrequency: 'daily' },
  { url: '/privacy', priority: '0.4', changeFrequency: 'yearly' },
  { url: '/terms', priority: '0.4', changeFrequency: 'yearly' },
  { url: '/refund', priority: '0.4', changeFrequency: 'yearly' },
];

export async function GET() {
  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (p) => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changeFrequency}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
