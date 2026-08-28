/**
 * app/page.tsx — Root page (Server Component wrapper)
 *
 * We keep metadata export here (server side) and delegate the
 * interactive client component to HomeClient.
 */
import type { Metadata } from 'next';
import HomeClient from './HomeClient';

const BASE_URL = 'https://www.mfcttrust.com';

export const metadata: Metadata = {
  title: 'MFCT — याद उनकी, सेवा हमारी | Mohammad Faeem Charitable Trust',
  description:
    'MFCT (मोहम्मद फ़ईम चैरिटेबल ट्रस्ट) — चिकित्सा सहायता, निकाह शगुन, जनाज़ा सेवाएं और शिक्षा समर्थन। 100% पारदर्शी, ज़मीनी स्तर पर सहायता। उत्तर प्रदेश, भारत।',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'MFCT — याद उनकी, सेवा हमारी | Mohammad Faeem Charitable Trust',
    description:
      'पारदर्शी सामुदायिक कल्याण नेटवर्क — चिकित्सा, निकाह, जनाज़ा, और शिक्षा सहायता। 0% बिचौलिया, 100% सीधी सहायता।',
    url: '/',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Mohammad Faeem Charitable Trust — Yaad Unki, Seva Hamari',
      },
    ],
  },
};

// JSON-LD: Website + BreadcrumbList schema
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Mohammad Faeem Charitable Trust',
  alternateName: 'MFCT',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/campaigns?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Campaigns', item: `${BASE_URL}/campaigns` },
    { '@type': 'ListItem', position: 3, name: 'Communities', item: `${BASE_URL}/communities` },
    { '@type': 'ListItem', position: 4, name: 'Members', item: `${BASE_URL}/members` },
    { '@type': 'ListItem', position: 5, name: 'About', item: `${BASE_URL}/about` },
    { '@type': 'ListItem', position: 6, name: 'Contact', item: `${BASE_URL}/contact` },
  ],
};

export default function Home() {
  return (
    <>
      {/* Homepage-specific JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <HomeClient />
    </>
  );
}
