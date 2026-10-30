'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { GA_MEASUREMENT_ID } from '../lib/gtag';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function AnalyticsRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !GA_MEASUREMENT_ID) return;

    const queryString = searchParams?.toString();
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname;

    // Ensure dataLayer & gtag are initialized
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function (...args: unknown[]) {
        window.dataLayer.push(args);
      };

    // Track every page load and SPA client-side route change
    window.gtag('event', 'page_view', {
      page_path: fullPath,
      page_location: window.location.href,
      page_title: document.title,
      send_to: GA_MEASUREMENT_ID,
    });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Tracks route changes in Next.js App Router for Google Analytics 4.
 * Wrapped in Suspense to satisfy Next.js useSearchParams requirements.
 */
export default function GoogleAnalyticsPageView() {
  return (
    <Suspense fallback={null}>
      <AnalyticsRouteTracker />
    </Suspense>
  );
}
