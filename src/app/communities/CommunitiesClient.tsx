'use client';

import { AppStateProvider, useAppState } from '../../providers/AppStateProvider';
import { CommunitiesPage } from '../../page-components/CommunitiesPage';

function CommunitiesContent() {
  const { handleOpenRegister, isAuthenticated } = useAppState();
  return <CommunitiesPage onOpenRegister={isAuthenticated ? undefined : handleOpenRegister} />;
}

export default function CommunitiesClient() {
  return (
    <AppStateProvider isPublicLayout currentPage="communities">
      <CommunitiesContent />
    </AppStateProvider>
  );
}
