'use client';

import { AppStateProvider } from '../../providers/AppStateProvider';
import { RulesPage } from '../../page-components/RulesPage';

export default function Rules() {
  return (
    <AppStateProvider isPublicLayout currentPage="rules">
      <RulesPage />
    </AppStateProvider>
  );
}

