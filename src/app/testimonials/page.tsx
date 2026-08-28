import type { Metadata } from 'next';
import { AppStateProvider } from '../../providers/AppStateProvider';
import { TestimonialsPage } from '../../page-components/TestimonialsPage';

export const metadata: Metadata = {
  title: 'सफलता की कहानियां — MFCT Member & Donor Testimonials',
  description:
    'MFCT के लाभार्थियों और दानदाताओं की वास्तविक कहानियां। जानिए कैसे MFCT ने चिकित्सा संकट, निकाह, जनाज़ा और शिक्षा में मदद की।',
  alternates: { canonical: '/testimonials' },
  openGraph: {
    title: 'MFCT सफलता की कहानियां | Real Stories of Impact',
    description:
      'MFCT के लाभार्थियों की असली कहानियां — पारदर्शी सहायता जो जीवन बदलती है।',
    url: '/testimonials',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MFCT Impact Stories' }],
  },
};

export default function Testimonials() {
  return (
    <AppStateProvider isPublicLayout currentPage="testimonials">
      <TestimonialsPage />
    </AppStateProvider>
  );
}
