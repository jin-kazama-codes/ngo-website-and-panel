'use client';

import { AppStateProvider } from '../../providers/AppStateProvider';
import { GalleryPage } from '../../page-components/GalleryPage';

export default function Gallery() {
  return (
    <AppStateProvider isPublicLayout currentPage="gallery">
      <GalleryPage />
    </AppStateProvider>
  );
}
