'use client';

import { AppStateProvider } from '../../providers/AppStateProvider';
import { AboutPage } from '../../page-components/AboutPage';

export default function About() {
  return (
    <AppStateProvider isPublicLayout currentPage="about">
      <AboutPage />
    </AppStateProvider>
  );
}
