'use client';

import { AppStateProvider } from '../../providers/AppStateProvider';
import { TestimonialsPage } from '../../page-components/TestimonialsPage';

export default function Testimonials() {
  return (
    <AppStateProvider isPublicLayout currentPage="testimonials">
      <TestimonialsPage />
    </AppStateProvider>
  );
}
