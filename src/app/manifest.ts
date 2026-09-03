import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mohammad Faeem Charitable Trust',
    short_name: 'MFCT',
    description: 'याद उनकी, सेवा हमारी — MFCT पारदर्शी सामुदायिक सहायता',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9f5ec',
    theme_color: '#1a3c2c',
    lang: 'hi',
    categories: ['charity', 'social', 'nonprofit'],
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    screenshots: [
      {
        src: '/og-image.jpg',
        sizes: '1200x630',
        type: 'image/jpeg',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form_factor: 'wide' as any,
      },
    ],
  };
}
