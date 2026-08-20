'use client';

import { AppStateProvider } from '../../providers/AppStateProvider';
import { RefundPolicyPage } from '../../page-components/RefundPolicyPage';

export default function RefundPolicy() {
  return (
    <AppStateProvider isPublicLayout currentPage="refund">
      <RefundPolicyPage />
    </AppStateProvider>
  );
}
