'use client';

import { AppStateProvider } from '../../providers/AppStateProvider';
import { TermsOfServicePage } from '../../page-components/TermsOfServicePage';

export default function TermsOfService() {
  return (
    <AppStateProvider isPublicLayout currentPage="terms">
      <TermsOfServicePage />
    </AppStateProvider>
  );
}
