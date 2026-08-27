'use client';

import { AppStateProvider } from '../../providers/AppStateProvider';
import { MembersPage } from '../../page-components/MembersPage';

export default function MembersRoute() {
  return (
    <AppStateProvider isPublicLayout currentPage="members">
      <MembersPage />
    </AppStateProvider>
  );
}
