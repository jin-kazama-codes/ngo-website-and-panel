import type { Metadata } from 'next';
import { AppStateProvider } from '../../providers/AppStateProvider';
import { TermsOfServicePage } from '../../page-components/TermsOfServicePage';

export const metadata: Metadata = {
  title: 'नियम और शर्तें (Terms of Service) — Mohammad Faeem Charitable Trust',
  description:
    'Mohammad Faeem Charitable Trust (MFCT) की सेवा शर्तें, सदस्यता नियम और दान दिशानिर्देश।',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'नियम और शर्तें (Terms of Service) | MFCT',
    description: 'Mohammad Faeem Charitable Trust के उपयोग की शर्तें।',
    url: '/terms',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MFCT Terms of Service' }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfService() {
  return (
    <AppStateProvider isPublicLayout currentPage="terms">
      <TermsOfServicePage />
    </AppStateProvider>
  );
}
