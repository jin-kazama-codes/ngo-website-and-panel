import type { Metadata } from 'next';
import { AppStateProvider } from '../../providers/AppStateProvider';
import { ContactPage } from '../../page-components/ContactPage';

export const metadata: Metadata = {
  title: 'संपर्क करें — MFCT Contact Us',
  description:
    'MFCT से संपर्क करें — सहायता अनुरोध, सदस्यता, दान संबंधी प्रश्न या किसी भी जानकारी के लिए हमसे जुड़ें। Mohammad Faeem Charitable Trust, Uttar Pradesh.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'MFCT से संपर्क करें | Contact Mohammad Faeem Charitable Trust',
    description:
      'सहायता, सदस्यता या दान के लिए MFCT से सम्पर्क करें।',
    url: '/contact',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Contact MFCT' }],
  },
};

export default function Contact() {
  return (
    <AppStateProvider isPublicLayout currentPage="contact">
      <ContactPage />
    </AppStateProvider>
  );
}
