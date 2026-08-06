'use client';

import { AppStateProvider, useAppState } from '../../providers/AppStateProvider';
import { CommunitiesPage } from '../../page-components/CommunitiesPage';

function CommunitiesContent() {
  const { handleOpenRegister } = useAppState();
  return <CommunitiesPage onOpenRegister={handleOpenRegister} />;
}

export default function Communities() {
  return (
    <AppStateProvider isPublicLayout currentPage="communities">
      <CommunitiesContent />
    </AppStateProvider>
  );
}
