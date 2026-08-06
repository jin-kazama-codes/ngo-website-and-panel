'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, User, Campaign, Donation } from '../types';
import { USER_SUPER_ADMIN, USER_EXECUTIVE_ADMIN, USER_COMMUNITY_ADMIN, USER_MEMBER, CURRENT_USER_PREMIUM } from '../data/mockData';
import { getCampaigns } from '../services/campaignService';

// Components & Modals
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { DonationModal } from '../components/DonationModal';
import { RegistrationModal } from '../components/RegistrationModal';
import { MembershipCardModal, ReceiptModal } from '../components/MembershipCardModal';
import { CampaignDetailModal } from '../components/CampaignDetailModal';
import { CreateCampaignModal } from '../components/CreateCampaignModal';
import { ZakatCalculatorModal } from '../components/ZakatCalculatorModal';
import { LoginModal } from '../components/LoginModal';

// ─── Context Types ───────────────────────────────────────────────────────────

interface AppStateContextType {
  isAuthenticated: boolean;
  currentRole: UserRole;
  activeUser: User;
  campaignsList: Campaign[];
  handleOpenDonate: (campaign?: Campaign, amount?: number, category?: 'Zakat') => void;
  handleOpenRegister: () => void;
  handleOpenMembershipCard: () => void;
  handleOpenZakatCalc: () => void;
  handleOpenCreateCampaign: () => void;
  handleOpenLogin: () => void;
  handleSelectDonationReceipt: (d: Donation) => void;
  handleViewCampaignDetail: (c: Campaign) => void;
  handleRoleChange: (role: UserRole) => void;
  handleLogin: (role: UserRole, email?: string) => void;
  handleLogout: () => void;
  handleCampaignCreated: (camp: Campaign) => void;
  handleDonationSuccess: (donation: Donation) => void;
  handleUserRegistered: (user: User) => void;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface AppStateProviderProps {
  children: ReactNode;
  /** If true, renders Navbar + Footer around children (public website layout).
   *  If false, only renders children (admin panel has its own chrome). */
  isPublicLayout?: boolean;
  /** The current page name for the Navbar active link highlight */
  currentPage?: string;
}

export function AppStateProvider({
  children,
  isPublicLayout = false,
  currentPage = 'home',
}: AppStateProviderProps) {
  const router = useRouter();

  // ─── Global State ─────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mfct_is_logged_in') === 'true';
    }
    return false;
  });
  const [currentRole, setCurrentRole] = useState<UserRole>('member');
  const [activeUser, setActiveUser] = useState<User>(USER_MEMBER);
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);

  useEffect(() => {
    getCampaigns({ status: 'all' }).then(setCampaignsList).catch(console.error);
  }, []);

  // Restore active user mapping from localStorage if saved
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('mfct_user_role') as UserRole | null;
      if (savedRole) {
        handleRoleChange(savedRole);
      }
    }
  }, []);

  // ─── Modal State ──────────────────────────────────────────────────────────
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [selectedDonateCampaign, setSelectedDonateCampaign] = useState<Campaign | undefined>(undefined);
  const [presetDonateAmount, setPresetDonateAmount] = useState<number | undefined>(undefined);
  const [presetDonateCategory, setPresetDonateCategory] = useState<'Zakat' | undefined>(undefined);
  const [pendingDonationAfterRegister, setPendingDonationAfterRegister] = useState(false);

  const [showZakatModal, setShowZakatModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMembershipCardModal, setShowMembershipCardModal] = useState(false);
  const [selectedReceiptDonation, setSelectedReceiptDonation] = useState<Donation | null>(null);
  const [inspectingCampaign, setInspectingCampaign] = useState<Campaign | null>(null);
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);

  const getUserForRole = (role: UserRole): User => {
    if (role === 'super_admin') return USER_SUPER_ADMIN;
    if (role === 'executive') return USER_EXECUTIVE_ADMIN;
    if (role === 'community_admin') return USER_COMMUNITY_ADMIN;
    if (role === 'premium_donor') return CURRENT_USER_PREMIUM;
    return USER_MEMBER;
  };

  const handleLogin = (role: UserRole, email?: string, customUser?: User) => {
    const userToSet = customUser || getUserForRole(role);
    const userEmail = email || userToSet.email;
    const userWithEmail = { ...userToSet, email: userEmail };

    setIsAuthenticated(true);
    setCurrentRole(userToSet.role);
    setActiveUser(userWithEmail);

    if (typeof window !== 'undefined') {
      const loginInfo = {
        role: userToSet.role,
        id: userWithEmail.id,
        email: userEmail,
        community_id: userWithEmail.communityId,
      };

      localStorage.setItem('mfct_is_logged_in', 'true');
      localStorage.setItem('mfct_user_role', userToSet.role);
      localStorage.setItem('role', userToSet.role);
      localStorage.setItem('id', userWithEmail.id);
      localStorage.setItem('email', userEmail);
      localStorage.setItem('community_id', userWithEmail.communityId);
      localStorage.setItem('login_info', JSON.stringify(loginInfo));
      localStorage.setItem('mfct_user_info', JSON.stringify(loginInfo));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentRole('member');
    setActiveUser(USER_MEMBER);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('mfct_is_logged_in');
      localStorage.removeItem('mfct_user_role');
      localStorage.removeItem('role');
      localStorage.removeItem('id');
      localStorage.removeItem('email');
      localStorage.removeItem('community_id');
      localStorage.removeItem('login_info');
      localStorage.removeItem('mfct_user_info');
    }
  };

  const handleOpenDonate = (campaign?: Campaign, amount?: number, category?: 'Zakat') => {
    setSelectedDonateCampaign(campaign);
    setPresetDonateAmount(amount);
    setPresetDonateCategory(category);
    if (!isAuthenticated) {
      setPendingDonationAfterRegister(true);
      setShowRegisterModal(true);
    } else {
      setShowDonateModal(true);
    }
  };

  const handleDonationSuccess = (newDonation: Donation) => {
    setCampaignsList((prev) =>
      prev.map((c) => {
        if (c.id === newDonation.campaignId) {
          return {
            ...c,
            raisedINR: c.raisedINR + newDonation.amountINR,
            donorsCount: c.donorsCount + 1,
          };
        }
        return c;
      })
    );
  };

  const handleUserRegistered = (newUser: User) => {
    setActiveUser(newUser);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mfct_is_logged_in', 'true');
    }
  };

  const handleCampaignCreated = (newCamp: Campaign) => {
    setCampaignsList((prev) => [newCamp, ...prev]);
    setShowCreateCampaignModal(false);
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mfct_user_role', role);
    }
    if (role === 'super_admin') {
      setActiveUser(USER_SUPER_ADMIN);
    } else if (role === 'executive') {
      setActiveUser(USER_EXECUTIVE_ADMIN);
    } else if (role === 'community_admin') {
      setActiveUser(USER_COMMUNITY_ADMIN);
    } else if (role === 'premium_donor') {
      setActiveUser(CURRENT_USER_PREMIUM);
    } else {
      setActiveUser(USER_MEMBER);
    }
  };

  const handleOpenRegister = () => {
    setPendingDonationAfterRegister(false);
    setShowRegisterModal(true);
  };

  const handleCloseRegisterModal = () => {
    setShowRegisterModal(false);
    if (isAuthenticated && pendingDonationAfterRegister) {
      setPendingDonationAfterRegister(false);
      setShowDonateModal(true);
    } else {
      setPendingDonationAfterRegister(false);
      setSelectedDonateCampaign(undefined);
      setPresetDonateAmount(undefined);
      setPresetDonateCategory(undefined);
    }
  };

  const handleOpenLogin = () => setShowLoginModal(true);
  const handleOpenMembershipCard = () => setShowMembershipCardModal(true);
  const handleOpenZakatCalc = () => setShowZakatModal(true);
  const handleOpenCreateCampaign = () => setShowCreateCampaignModal(true);
  const handleSelectDonationReceipt = (d: Donation) => setSelectedReceiptDonation(d);
  const handleViewCampaignDetail = (c: Campaign) => setInspectingCampaign(c);

  // ─── Navigation ──────────────────────────────────────────────────────────

  const pageToPath: Record<string, string> = {
    home: '/',
    campaigns: '/campaigns',
    communities: '/communities',
    about: '/about',
    gallery: '/gallery',
    testimonials: '/testimonials',
    contact: '/contact',
  };

  const handlePageChange = (page: string) => {
    const path = pageToPath[page] ?? '/';
    router.push(path);
    window.scrollTo(0, 0);
  };

  const handleNavigateToAdmin = () => {
    router.push('/admin');
    window.scrollTo(0, 0);
  };

  const handleNavigateToWebsite = (page: string = 'home') => {
    handlePageChange(page);
  };

  // ─── Shared Modals ────────────────────────────────────────────────────────

  const sharedModals = (
    <>
      {showDonateModal && (
        <DonationModal
          campaign={selectedDonateCampaign}
          initialAmount={presetDonateAmount}
          initialCategory={presetDonateCategory}
          currentUser={activeUser}
          onClose={() => {
            setShowDonateModal(false);
            setSelectedDonateCampaign(undefined);
            setPresetDonateAmount(undefined);
            setPresetDonateCategory(undefined);
          }}
          onDonationSuccess={handleDonationSuccess}
        />
      )}

      {showZakatModal && (
        <ZakatCalculatorModal
          isOpen={showZakatModal}
          onClose={() => setShowZakatModal(false)}
          onDonateCalculated={(amount) => {
            handleOpenDonate(undefined, amount, 'Zakat');
          }}
        />
      )}

      {showRegisterModal && (
        <RegistrationModal
          onClose={handleCloseRegisterModal}
          onRegistered={handleUserRegistered}
          hasPendingDonation={pendingDonationAfterRegister}
        />
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          currentRole={currentRole}
          onLoginRole={(role, email) => {
            handleLogin(role, email);
          }}
        />
      )}

      {showMembershipCardModal && (
        <MembershipCardModal
          user={activeUser}
          onClose={() => setShowMembershipCardModal(false)}
        />
      )}

      {selectedReceiptDonation && (
        <ReceiptModal
          donation={selectedReceiptDonation}
          onClose={() => setSelectedReceiptDonation(null)}
        />
      )}

      {inspectingCampaign && (
        <CampaignDetailModal
          campaign={inspectingCampaign}
          onClose={() => setInspectingCampaign(null)}
          onDonate={(c) => {
            setInspectingCampaign(null);
            handleOpenDonate(c);
          }}
        />
      )}

      {showCreateCampaignModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateCampaignModal(false)}
          onCreate={handleCampaignCreated}
        />
      )}
    </>
  );

  // ─── Context Value ───────────────────────────────────────────────────────

  const contextValue: AppStateContextType = {
    isAuthenticated,
    currentRole,
    activeUser,
    campaignsList,
    handleOpenDonate,
    handleOpenRegister,
    handleOpenMembershipCard,
    handleOpenZakatCalc,
    handleOpenCreateCampaign,
    handleOpenLogin,
    handleSelectDonationReceipt,
    handleViewCampaignDetail,
    handleRoleChange,
    handleLogin,
    handleLogout,
    handleCampaignCreated,
    handleDonationSuccess,
    handleUserRegistered,
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  if (isPublicLayout) {
    return (
      <AppStateContext.Provider value={contextValue}>
        <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
          <Navbar
            currentPage={currentPage}
            onPageChange={handlePageChange}
            currentUser={activeUser}
            onOpenDonate={() => handleOpenDonate()}
            onOpenRegister={handleOpenRegister}
            onOpenLogin={handleOpenLogin}
            onLogout={isAuthenticated ? handleLogout : undefined}
            onOpenMembershipCard={handleOpenMembershipCard}
            onNavigateToAdmin={handleNavigateToAdmin}
            onOpenZakatCalc={handleOpenZakatCalc}
          />
          <main className="flex-1">{children}</main>
          <Footer
            onPageChange={handlePageChange}
            onOpenDonate={() => handleOpenDonate()}
            onNavigateToAdmin={handleNavigateToAdmin}
          />
          {sharedModals}
        </div>
      </AppStateContext.Provider>
    );
  }

  // Admin layout (no public Navbar/Footer)
  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
      {sharedModals}
    </AppStateContext.Provider>
  );
}
