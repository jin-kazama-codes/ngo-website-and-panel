import type { Metadata } from 'next';
import { AppStateProvider } from '../../providers/AppStateProvider';
import { RefundPolicyPage } from '../../page-components/RefundPolicyPage';

export const metadata: Metadata = {
  title: 'धनवापसी और रद्दीकरण नीति (Refund Policy) — MFCT',
  description:
    'Mohammad Faeem Charitable Trust (MFCT) की दान वापसी, 80G रसीद नियम और रद्दीकरण नीति।',
  alternates: { canonical: '/refund' },
  openGraph: {
    title: 'धनवापसी और रद्दीकरण नीति (Refund Policy) | MFCT',
    description: 'Mohammad Faeem Charitable Trust की दान वापसी नीति।',
    url: '/refund',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MFCT Refund Policy' }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RefundPolicy() {
  return (
    <AppStateProvider isPublicLayout currentPage="refund">
      <RefundPolicyPage />
    </AppStateProvider>
  );
}
