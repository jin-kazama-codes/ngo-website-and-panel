import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '../context/LanguageContext';

const BASE_URL = 'https://www.mfcttrust.com';

// ─── Global Site Metadata ───────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'Mohammad Faeem Charitable Trust (MFCT) — याद उनकी, सेवा हमारी',
    template: '%s | MFCT — Mohammad Faeem Charitable Trust',
  },

  description:
    'MFCT (Mohammad Faeem Charitable Trust) एक पारदर्शी, ज़मीनी स्तर का कल्याणकारी नेटवर्क है। चिकित्सा सहायता, निकाह शगुन, जनाज़ा सेवाएं और शिक्षा सहायता — सीधे परिवारों तक, बिना किसी बिचौलिए के।',

  keywords: [
    'MFCT', 'Mohammad Faeem Charitable Trust', 'Muslim NGO India',
    'Islamic charity UP', 'zakat', 'sadaqah', 'NGO Bareilly', 'NGO Uttar Pradesh',
    'جنازہ', 'janazah service', 'nikah support', 'medical aid NGO',
    'community welfare', 'grassroots charity India', 'transparent NGO',
    'मोहम्मद फ़ईम चैरिटेबल ट्रस्ट', 'एनजीओ उत्तर प्रदेश', 'ज़कात', 'निकाह सहायता',
  ],

  authors: [{ name: 'MFCT Team', url: BASE_URL }],
  creator: 'Mohammad Faeem Charitable Trust',
  publisher: 'Mohammad Faeem Charitable Trust',

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Canonical
  alternates: {
    canonical: '/',
    languages: {
      'hi-IN': '/hi',
      'ur-PK': '/ur',
      'en-IN': '/',
    },
  },

  // Open Graph — Facebook / WhatsApp / LinkedIn
  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    alternateLocale: ['en_IN', 'ur_PK'],
    url: '/',
    siteName: 'Mohammad Faeem Charitable Trust',
    title: 'MFCT — याद उनकी, सेवा हमारी | Mohammad Faeem Charitable Trust',
    description:
      'चिकित्सा सहायता, निकाह शगुन, जनाज़ा सेवाएं और शिक्षा — 100% पारदर्शी सामुदायिक एस्क्रो द्वारा संचालित। MFCT के साथ जुड़ें।',
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Mohammad Faeem Charitable Trust — Yaad Unki, Seva Hamari',
        type: 'image/jpeg',
      },
    ],
  },

  // Twitter / X Cards
  twitter: {
    card: 'summary_large_image',
    site: '@mfcttrust',
    creator: '@mfcttrust',
    title: 'MFCT — याद उनकी, सेवा हमारी | Mohammad Faeem Charitable Trust',
    description:
      'पारदर्शी सामुदायिक सहायता — चिकित्सा, निकाह, जनाज़ा और शिक्षा सेवाएं। 100% डायरेक्ट, 0% बिचौलिया।',
    images: [`${BASE_URL}/og-image.jpg`],
  },

  // App Icons & Manifest
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/mfct-logo.jpeg', type: 'image/jpeg' },
    ],
    shortcut: '/favicon.ico',
    apple: '/mfct-logo.jpeg',
  },

  // Verification — add actual codes from Google Search Console, Bing, etc.
  // verification: {
  //   google: 'YOUR_GOOGLE_SITE_VERIFICATION_TOKEN',
  //   yandex: 'YOUR_YANDEX_TOKEN',
  //   bing: 'YOUR_BING_TOKEN',
  // },

  category: 'charity',
};

// ─── Viewport / Theme Color ──────────────────────────────────────────────────
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9f5ec' },
    { media: '(prefers-color-scheme: dark)', color: '#1a3c2c' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// ─── JSON-LD Organisation Schema ─────────────────────────────────────────────
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'NGO',
  name: 'Mohammad Faeem Charitable Trust',
  alternateName: ['MFCT', 'मोहम्मद फ़ईम चैरिटेबल ट्रस्ट'],
  url: BASE_URL,
  logo: `${BASE_URL}/mfct-logo.jpeg`,
  image: `${BASE_URL}/og-image.jpg`,
  description:
    'A transparent, grassroots welfare network providing medical aid, Nikah support, education, and Janazah services to poor families across Uttar Pradesh, India.',
  foundingDate: '2021',
  areaServed: {
    '@type': 'State',
    name: 'Uttar Pradesh',
    containedInPlace: { '@type': 'Country', name: 'India' },
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['Hindi', 'Urdu', 'English'],
  },
  sameAs: [
    'https://www.facebook.com/mfctindia',
    'https://www.instagram.com/mfct_india',
    'https://twitter.com/MFCT_India',
  ],
  nonprofitStatus: 'Section8Company',
};

// ─── RootLayout ──────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" dir="ltr">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Preconnect to Google Fonts CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
