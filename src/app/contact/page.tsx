'use client';

import { AppStateProvider } from '../../providers/AppStateProvider';
import { ContactPage } from '../../page-components/ContactPage';

export default function Contact() {
  return (
    <AppStateProvider isPublicLayout currentPage="contact">
      <ContactPage />
    </AppStateProvider>
  );
}
