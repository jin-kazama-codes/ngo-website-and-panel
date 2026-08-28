import type { Metadata } from 'next';
import { AppStateProvider } from '../../providers/AppStateProvider';
import { GalleryPage } from '../../page-components/GalleryPage';

export const metadata: Metadata = {
  title: 'MFCT फोटो गैलरी — Field Work & Impact Stories',
  description:
    'MFCT की ज़मीनी सेवाओं की तस्वीरें — चिकित्सा शिविर, निकाह सहायता, जनाज़ा सेवा, और सामुदायिक कार्यक्रमों की झलकियां। देखिए हमारा असली प्रभाव।',
  alternates: { canonical: '/gallery' },
  openGraph: {
    title: 'MFCT Gallery | Real Impact on the Ground',
    description:
      'MFCT के सामुदायिक कार्यों की असली तस्वीरें और वीडियो।',
    url: '/gallery',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MFCT Gallery & Impact' }],
  },
};

export default function Gallery() {
  return (
    <AppStateProvider isPublicLayout currentPage="gallery">
      <GalleryPage />
    </AppStateProvider>
  );
}
