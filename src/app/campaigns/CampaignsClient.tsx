'use client';

import { AppStateProvider, useAppState } from '../../providers/AppStateProvider';
import { CampaignsPage } from '../../page-components/CampaignsPage';

function CampaignsContent() {
  const { handleOpenDonate } = useAppState();
  return <CampaignsPage onDonate={(c) => handleOpenDonate(c)} />;
}

export default function CampaignsClient() {
  return (
    <AppStateProvider isPublicLayout currentPage="campaigns">
      <CampaignsContent />
    </AppStateProvider>
  );
}
