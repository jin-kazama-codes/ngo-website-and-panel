'use client';

import { AppStateProvider } from '../../providers/AppStateProvider';
import { NiyamawaliPage } from '../../page-components/NiyamawaliPage';

export default function NiyamawaliRoute() {
  return (
    <AppStateProvider isPublicLayout currentPage="niyamawali">
      <NiyamawaliPage />
    </AppStateProvider>
  );
}
