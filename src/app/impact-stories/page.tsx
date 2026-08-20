'use client';

import { AppStateProvider } from '../../providers/AppStateProvider';
import { TestimonialsPage } from '../../page-components/TestimonialsPage';

export default function ImpactStories() {
  return (
    <AppStateProvider isPublicLayout currentPage="impact-stories">
      <TestimonialsPage />
    </AppStateProvider>
  );
}
