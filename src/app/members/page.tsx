import type { Metadata } from 'next';
import { AppStateProvider } from '../../providers/AppStateProvider';
import { MembersPage } from '../../page-components/MembersPage';

export const metadata: Metadata = {
  title: 'MFCT वैधानिक सदस्य सूची — Official Member Directory',
  description:
    'Mohammad Faeem Charitable Trust (MFCT) के वैधानिक और पंजीकृत सदस्यों की पूरी सूची। जिला, समुदाय, भूमिका और सम्पर्क जानकारी के साथ पारदर्शी सदस्य डेटाबेस।',
  alternates: { canonical: '/members' },
  openGraph: {
    title: 'MFCT सदस्य सूची | Official Member Directory',
    description:
      'MFCT के पंजीकृत सदस्यों की पारदर्शी और सत्यापित सूची।',
    url: '/members',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MFCT Member Directory' }],
  },
};

export default function MembersRoute() {
  return (
    <AppStateProvider isPublicLayout currentPage="members">
      <MembersPage />
    </AppStateProvider>
  );
}
