'use client';

import { useRouter } from 'next/navigation';
import { AppStateProvider, useAppState } from '../../providers/AppStateProvider';
import { AdminPanel } from '../../page-components/admin/AdminPanel';
import { LoginModal } from '../../components/LoginModal';

function AdminContent() {
  const router = useRouter();
  const {
    isInitialized,
    isAuthenticated,
    currentRole,
    activeUser,
    campaignsList,
    handleOpenDonate,
    handleOpenRegister,
    handleOpenMembershipCard,
    handleSelectDonationReceipt,
    handleRoleChange,
    handleLogin,
    handleLogout,
    handleCampaignCreated,
  } = useAppState();

  if (!isInitialized) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-950 flex font-sans overflow-hidden">
        {/* Sidebar Skeleton */}
        <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0 flex flex-col animate-pulse hidden lg:flex">
          {/* Brand */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
            <div className="space-y-2">
              <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          </div>
          {/* Active Role Badge */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <div className="w-full h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          </div>
          {/* Menus */}
          <div className="p-4 space-y-4 flex-1">
            <div className="w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
            {[1, 2, 3].map(i => (
              <div key={`c-${i}`} className="flex items-center gap-3">
                <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            ))}
            <div className="w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded mb-2 mt-6"></div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={`r-${i}`} className="flex items-center gap-3">
                <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="w-40 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        </aside>
        
        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header Skeleton */}
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 animate-pulse">
             <div className="w-64 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl hidden sm:block"></div>
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
               <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
               <div className="w-24 h-8 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
             </div>
          </header>
          {/* Body Skeleton */}
          <div className="p-6 space-y-6 flex-1 bg-slate-50 dark:bg-slate-950 animate-pulse overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={`s-${i}`} className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
              ))}
            </div>
            <div className="h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-slate-950 to-slate-900 pointer-events-none" />
        
        {/* Header Branding */}
        <div className="text-center mb-6 z-10 space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-xl shadow-emerald-950">
            M
          </div>
          <h1 className="text-2xl font-black text-white">MFCT Management Desk Portal</h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Restricted System Access. Please authenticate with your account credentials to continue.
          </p>
        </div>

        <LoginModal
          onClose={() => {
            // Only redirect to homepage if user cancels without logging in
            if (typeof window !== 'undefined' && localStorage.getItem('mfct_is_logged_in') !== 'true') {
              router.push('/');
            }
          }}
          currentRole={currentRole}
          onLoginRole={(role, email, customUser) => {
            handleLogin(role, email, customUser);
          }}
        />
      </div>
    );
  }

  return (
    <AdminPanel
      currentRole={currentRole}
      onRoleChange={handleRoleChange}
      activeUser={activeUser}
      campaignsList={campaignsList}
      onOpenDonate={(c) => handleOpenDonate(c)}
      onOpenRegister={handleOpenRegister}
      onOpenMembershipCard={handleOpenMembershipCard}
      onSelectDonationReceipt={handleSelectDonationReceipt}
      handleCampaignCreated={handleCampaignCreated}
      onLogout={handleLogout}
      onNavigateToWebsite={() => {
        router.push('/');
        window.scrollTo(0, 0);
      }}
    />
  );
}

export default function Admin() {
  // Admin panel uses its own chrome (no public Navbar/Footer)
  return (
    <AppStateProvider isPublicLayout={false}>
      <AdminContent />
    </AppStateProvider>
  );
}
