'use client';

import { AppStateProvider } from '../../../providers/AppStateProvider';
import { CampaignDetailsPage } from '../../../page-components/CampaignDetailsPage';

export default function CampaignDetails() {
  return (
    <AppStateProvider isPublicLayout currentPage="campaigns">
      <CampaignDetailsPage />
    </AppStateProvider>
  );
}
