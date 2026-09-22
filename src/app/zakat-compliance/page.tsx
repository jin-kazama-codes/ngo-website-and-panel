import type { Metadata } from 'next';
import { AppStateProvider } from '../../providers/AppStateProvider';
import { ZakatCompliancePage } from '../../page-components/ZakatCompliancePage';

export const metadata: Metadata = {
  title: 'Zakat and Sadaqah Compliance — MFCT ज़कात व सदक़ा नीति',
  description:
    'मोहम्मद फ़ईम चैरिटेबल ट्रस्ट (MFCT) की ज़कात, सदक़ा-ए-फ़ित्र एवं सदक़ात/दान संग्रह एवं वितरण नीति — शरीअती अनुपालन, वकील/अमीन व्यवस्था एवं पारदर्शी लेखा प्रणाली।',
  alternates: { canonical: '/zakat-compliance' },
  openGraph: {
    title: 'Zakat and Sadaqah Compliance | MFCT Shariah Policy',
    description:
      'Zakat, Sadaqah-e-Fitr & Sadaqah Collection & Distribution Policy — Mohammad Faeem Charitable Trust (MFCT).',
    url: '/zakat-compliance',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'MFCT Zakat & Sadaqah Compliance' }],
  },
};

export default function ZakatComplianceRoute() {
  return (
    <AppStateProvider isPublicLayout currentPage="zakat-compliance">
      <ZakatCompliancePage />
    </AppStateProvider>
  );
}
