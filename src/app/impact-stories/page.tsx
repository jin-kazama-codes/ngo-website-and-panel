import type { Metadata } from 'next';
import { AppStateProvider } from '../../providers/AppStateProvider';
import { TestimonialsPage } from '../../page-components/TestimonialsPage';

export const metadata: Metadata = {
  title: 'सफलता की कहानियाँ और प्रभाव — MFCT Impact Stories',
  description:
    'जानिए कैसे MFCT (मोहम्मद फ़ईम चैरिटेबल ट्रस्ट) की पारदर्शी सहायता ने परिवारों के जीवन को बदला — चिकित्सा राहत, निकाह और शिक्षा के वास्तविक प्रमाण।',
  alternates: { canonical: '/impact-stories' },
  openGraph: {
    title: 'सफलता की कहानियाँ और प्रभाव | Mohammad Faeem Charitable Trust',
    description:
      'वास्तविक परिवारों की प्रेरक कहानियाँ और ज़मीनी प्रभाव के प्रमाण। MFCT ट्रस्ट।',
    url: '/impact-stories',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MFCT Impact Stories' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MFCT Impact Stories — सफलता की कहानियाँ',
    description: 'वास्तविक परिवारों की प्रेरक कहानियाँ और ज़मीनी प्रभाव के प्रमाण।',
    images: ['/og-image.jpg'],
  },
};

export default function ImpactStories() {
  return (
    <AppStateProvider isPublicLayout currentPage="impact-stories">
      <TestimonialsPage />
    </AppStateProvider>
  );
}
