import type { Metadata } from 'next';
import { AppStateProvider } from '../../providers/AppStateProvider';
import { PrivacyPolicyPage } from '../../page-components/PrivacyPolicyPage';

export const metadata: Metadata = {
  title: 'गोपनीयता नीति (Privacy Policy) — Mohammad Faeem Charitable Trust',
  description:
    'Mohammad Faeem Charitable Trust (MFCT) की गोपनीयता नीति — जानें कि हम आपके डेटा और दानों की सुरक्षा कैसे करते हैं।',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'गोपनीयता नीति (Privacy Policy) | MFCT',
    description: 'Mohammad Faeem Charitable Trust की आधिकारिक गोपनीयता नीति।',
    url: '/privacy',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MFCT Privacy Policy' }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicy() {
  return (
    <AppStateProvider isPublicLayout currentPage="privacy">
      <PrivacyPolicyPage />
    </AppStateProvider>
  );
}
