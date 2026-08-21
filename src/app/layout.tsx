import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '../context/LanguageContext';

export const metadata: Metadata = {
  title: 'MFCT - Community Crowdfunding Platform',
  description:
    'Direct support for healthcare, orphan education, dignified Nikah assistance, Janazah funeral services, and ration kits across local mohallas in Uttar Pradesh & NCR.',
  keywords: 'NGO, crowdfunding, charity, zakat, sadakah, community, mohalla, India',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
