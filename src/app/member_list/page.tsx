'use client';

import { AppStateProvider } from '../../providers/AppStateProvider';
import { MembersPage } from '../../page-components/MembersPage';

export default function MemberListRoute() {
  return (
    <AppStateProvider isPublicLayout currentPage="members">
      <MembersPage />
    </AppStateProvider>
  );
}
