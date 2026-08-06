'use client';

import { useRouter } from 'next/navigation';
import { AppStateProvider, useAppState } from '../../providers/AppStateProvider';
import { AdminPanel } from '../../page-components/admin/AdminPanel';
import { LoginModal } from '../../components/LoginModal';

function AdminContent() {
  const router = useRouter();
  const {
    isAuthenticated,
    currentRole,
    activeUser,
    campaignsList,
    handleOpenDonate,
    handleOpenRegister,
    handleOpenMembershipCard,
    handleSelectDonationReceipt,
    handleOpenCreateCampaign,
    handleRoleChange,
    handleLogin,
    handleLogout,
  } = useAppState();

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
          onLoginRole={(role, email) => {
            handleLogin(role, email);
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
      onOpenCreateCampaign={handleOpenCreateCampaign}
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
