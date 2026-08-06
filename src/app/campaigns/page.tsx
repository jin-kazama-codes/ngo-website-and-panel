'use client';

import { AppStateProvider, useAppState } from '../../providers/AppStateProvider';
import { CampaignsPage } from '../../page-components/CampaignsPage';

function CampaignsContent() {
  const { handleOpenDonate, handleViewCampaignDetail } = useAppState();

  return (
    <CampaignsPage
      onDonate={(c) => handleOpenDonate(c)}
      onViewCampaignDetail={handleViewCampaignDetail}
    />
  );
}

export default function Campaigns() {
  return (
    <AppStateProvider isPublicLayout currentPage="campaigns">
      <CampaignsContent />
    </AppStateProvider>
  );
}
