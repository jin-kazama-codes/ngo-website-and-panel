/**
 * Server Component — exports metadata, delegates to CampaignsClient
 */
import type { Metadata } from 'next';
import CampaignsClient from './CampaignsClient';

export const metadata: Metadata = {
  title: 'सत्यापित सहायता अभियान — MFCT Active Campaigns',
  description:
    'MFCT के सत्यापित राहत अभियान देखें। प्रत्येक अभियान स्थानीय प्रशासकों द्वारा सत्यापित और 100% पारदर्शी UTR रसीद सहित। चिकित्सा, आपदा, शिक्षा और निकाह सहायता अभियान।',
  alternates: { canonical: '/campaigns' },
  openGraph: {
    title: 'MFCT सत्यापित अभियान | Verified NGO Campaigns',
    description:
      'प्रत्येक दान सीधे जरूरतमंद परिवार तक, बिना बिचौलिए के। MFCT के सभी अभियान देखें।',
    url: '/campaigns',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MFCT Relief Campaigns' }],
  },
};

export default function Campaigns() {
  return <CampaignsClient />;
}
