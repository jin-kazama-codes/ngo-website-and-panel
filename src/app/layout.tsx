import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '../context/LanguageContext';

export const metadata: Metadata = {
  title: 'Mohammad Faeem Charitable Trust',
  description: 'याद उनकी, सेवा हमारी।',
  keywords: 'NGO, crowdfunding, charity, zakat, sadakah, community, India',
  icons: {
    icon: '/mfct-logo.jpeg',
    shortcut: '/mfct-logo.jpeg',
    apple: '/mfct-logo.jpeg',
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
