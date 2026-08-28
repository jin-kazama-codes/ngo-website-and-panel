import type { Metadata } from 'next';
import { AppStateProvider } from '../../providers/AppStateProvider';
import { AboutPage } from '../../page-components/AboutPage';

export const metadata: Metadata = {
  title: 'MFCT के बारे में — Mohammad Faeem Charitable Trust की कहानी',
  description:
    'जानिए MFCT (मोहम्मद फ़ईम चैरिटेबल ट्रस्ट) की स्थापना, उद्देश्य, मूल्य और पारदर्शी कार्यप्रणाली। हम समाज के हर वर्ग तक सहायता पहुँचाने के लिए प्रतिबद्ध हैं।',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'MFCT के बारे में | Mohammad Faeem Charitable Trust',
    description:
      'पारदर्शी सामुदायिक संस्था जो चिकित्सा, निकाह, जनाज़ा और शिक्षा में सहायता करती है।',
    url: '/about',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Mohammad Faeem Charitable Trust' }],
  },
};

export default function About() {
  return (
    <AppStateProvider isPublicLayout currentPage="about">
      <AboutPage />
    </AppStateProvider>
  );
}
