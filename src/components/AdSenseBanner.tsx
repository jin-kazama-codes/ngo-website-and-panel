'use client';

import { useEffect } from 'react';

interface AdSenseBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable Google AdSense Banner Component
 * Usage:
 *   <AdSenseBanner slot="1234567890" />
 */
export default function AdSenseBanner({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  style = { display: 'block' },
}: AdSenseBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-9950098479644890';

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense banner error:', err);
    }
  }, []);

  return (
    <div className={`adsense-container overflow-hidden my-4 text-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={clientId}
        {...(slot ? { 'data-ad-slot': slot } : {})}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
