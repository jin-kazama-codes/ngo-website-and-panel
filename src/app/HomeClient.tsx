'use client';

import { AppStateProvider, useAppState } from '../providers/AppStateProvider';
import { HomePage } from '../page-components/HomePage';
import { useRouter } from 'next/navigation';

function HomeContent() {
  const router = useRouter();
  const {
    handleOpenDonate,
    handleOpenRegister,
    handleOpenZakatCalc,
    isAuthenticated,
  } = useAppState();

  return (
    <HomePage
      onDonate={(c) => handleOpenDonate(c)}
      onOpenRegister={handleOpenRegister}
      showRegistrationCta={!isAuthenticated}
      onNavigatePage={(page: string) => {
        const routes: Record<string, string> = {
          home: '/',
          campaigns: '/campaigns',
          communities: '/communities',
          about: '/about',
          gallery: '/gallery',
          testimonials: '/testimonials',
          contact: '/contact',
        };
        router.push(routes[page] ?? '/');
        window.scrollTo(0, 0);
      }}
      onOpenZakatCalc={handleOpenZakatCalc}
    />
  );
}

export default function HomeClient() {
  return (
    <AppStateProvider isPublicLayout currentPage="home">
      <HomeContent />
    </AppStateProvider>
  );
}
