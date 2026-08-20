'use client';

import { AppStateProvider } from '../../providers/AppStateProvider';
import { PrivacyPolicyPage } from '../../page-components/PrivacyPolicyPage';

export default function PrivacyPolicy() {
  return (
    <AppStateProvider isPublicLayout currentPage="privacy">
      <PrivacyPolicyPage />
    </AppStateProvider>
  );
}
