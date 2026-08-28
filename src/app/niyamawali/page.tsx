import type { Metadata } from 'next';
import { AppStateProvider } from '../../providers/AppStateProvider';
import { NiyamawaliPage } from '../../page-components/NiyamawaliPage';

export const metadata: Metadata = {
  title: 'MFCT नियमावली — नियम, विनियम एवं संचालन नियम',
  description:
    'मोहम्मद फ़ईम चैरिटेबल ट्रस्ट (MFCT) की वैधानिक नियमावली — सदस्यता दायित्व, पारदर्शिता नियम, सहायता राशि नियम, समुदाय प्रशासन और संचालन दिशानिर्देश।',
  alternates: { canonical: '/niyamawali' },
  openGraph: {
    title: 'MFCT नियमावली | Rules, Regulations & Bylaws',
    description:
      'MFCT की आधिकारिक नियमावली — सदस्यता, सहायता राशि, और प्रशासनिक नियम।',
    url: '/niyamawali',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MFCT Rules & Bylaws' }],
  },
};

export default function NiyamawaliRoute() {
  return (
    <AppStateProvider isPublicLayout currentPage="niyamawali">
      <NiyamawaliPage />
    </AppStateProvider>
  );
}
