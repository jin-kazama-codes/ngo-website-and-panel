import type { Metadata } from 'next';
import { AppStateProvider } from '../../providers/AppStateProvider';
import { MembersPage } from '../../page-components/MembersPage';

export const metadata: Metadata = {
  title: 'सक्रिय सदस्य सूची (Active Members Directory) — MFCT',
  description:
    'Mohammad Faeem Charitable Trust (MFCT) के सभी पंजीकृत सदस्यों और स्वयंसेवकों की पारदर्शी निर्देशिका।',
  alternates: { canonical: '/members' },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MemberListRoute() {
  return (
    <AppStateProvider isPublicLayout currentPage="members">
      <MembersPage />
    </AppStateProvider>
  );
}
