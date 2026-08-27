'use client';

import { AppStateProvider } from '../../providers/AppStateProvider';
import { NiyamawaliPage } from '../../page-components/NiyamawaliPage';

export default function RulesRoute() {
  return (
    <AppStateProvider isPublicLayout currentPage="niyamawali">
      <NiyamawaliPage />
    </AppStateProvider>
  );
}
