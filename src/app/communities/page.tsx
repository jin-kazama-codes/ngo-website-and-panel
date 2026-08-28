/**
 * Server Component — exports metadata, delegates to CommunitiesClient
 */
import type { Metadata } from 'next';
import CommunitiesClient from './CommunitiesClient';

export const metadata: Metadata = {
  title: 'स्थानीय समुदाय एवं शाखाएं — MFCT Community Network',
  description:
    'उत्तर प्रदेश भर में MFCT के स्थानीय समुदाय नेटवर्क से जुड़ें। अपने जिले की MFCT शाखा खोजें। प्रत्येक समुदाय एक विश्वसनीय स्थानीय प्रशासक द्वारा संचालित है।',
  alternates: { canonical: '/communities' },
  openGraph: {
    title: 'MFCT समुदाय नेटवर्क | Community Chapters Across UP',
    description:
      'अपने जिले की MFCT शाखा से जुड़ें और सामूहिक कल्याण में योगदान दें।',
    url: '/communities',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MFCT Community Network' }],
  },
};

export default function Communities() {
  return <CommunitiesClient />;
}
