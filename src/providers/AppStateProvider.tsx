'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, User, Campaign, Donation } from '../types';
import { USER_SUPER_ADMIN, USER_EXECUTIVE_ADMIN, USER_COMMUNITY_ADMIN, USER_MEMBER, CURRENT_USER_PREMIUM } from '../data/mockData';
import { getCampaigns, getEmergencyCampaigns } from '../services/campaignService';

// Components & Modals
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { DonationModal } from '../components/DonationModal';
import { RegistrationModal } from '../components/RegistrationModal';
import { MembershipCardModal, ReceiptModal } from '../components/MembershipCardModal';
import { ZakatCalculatorModal } from '../components/ZakatCalculatorModal';
import { LoginModal } from '../components/LoginModal';

// ─── Context Types ───────────────────────────────────────────────────────────

interface AppStateContextType {
  isInitialized: boolean;
  isAuthenticated: boolean;
  currentRole: UserRole;
  activeUser: User;
  campaignsList: Campaign[];
  handleOpenDonate: (campaign?: Campaign, amount?: number, category?: 'Zakat') => void;
  handleOpenRegister: () => void;
  handleOpenMembershipCard: () => void;
  handleOpenZakatCalc: () => void;
  handleOpenLogin: () => void;
  handleSelectDonationReceipt: (d: Donation) => void;
  handleRoleChange: (role: UserRole) => void;
  handleLogin: (role: UserRole, email?: string, customUser?: User) => void;
  handleLogout: () => void;
  handleCampaignCreated: (newCampaign: Campaign) => void;
  handleCampaignUpdated: (updatedCamp: Campaign) => void;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('member');
  const [activeUser, setActiveUser] = useState<User>(USER_MEMBER);
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);

  useEffect(() => {
    Promise.all([
      getCampaigns({ status: 'all' })
    ]).then(([cData]) => {
      setCampaignsList([...cData]);
    }).catch(console.error);
  }, []);

  // Restore active user mapping and auth from localStorage if saved
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('mfct_is_logged_in') === 'true';
      if (isLoggedIn) {
        setIsAuthenticated(true);
      }

      const savedId = localStorage.getItem('id');
      const savedRole = localStorage.getItem('mfct_user_role') as UserRole | null;
      const savedEmail = localStorage.getItem('email') || '';
      const savedName = localStorage.getItem('name') || '';
      const savedAvatar = localStorage.getItem('avatar') || '';

      const restoreMockUser = (role: UserRole) => {
        const mockUser = getUserForRole(role);
        setActiveUser({ 
          ...mockUser, 
          email: savedEmail || mockUser.email || '',
          name: savedName || mockUser.name || '',
          avatar: savedAvatar || mockUser.avatar || ''
        });
        setCurrentRole(role);
      };

      if (savedId) {
        import('../services/userService').then(({ getUserById }) => {
          getUserById(savedId).then((realUser) => {
            if (realUser) {
              setActiveUser(realUser);
              setCurrentRole(realUser.role);
            } else if (savedRole) {
              restoreMockUser(savedRole);
            }
            setIsInitialized(true);
          }).catch((err) => {
            console.error('Failed to fetch user on load:', err);
            if (savedRole) restoreMockUser(savedRole);
            setIsInitialized(true);
          });
        });
      } else {
        if (savedRole) {
          restoreMockUser(savedRole);
        }
        setIsInitialized(true);
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

  const getUserForRole = (role: UserRole): User => {
    if (role === 'super_admin') return USER_SUPER_ADMIN;
    if (role === 'executive_admin') return USER_EXECUTIVE_ADMIN;
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
        name: userWithEmail.name,
        avatar: userWithEmail.avatar,
        community_id: userWithEmail.communityId,
      };

      localStorage.setItem('mfct_is_logged_in', 'true');
      localStorage.setItem('mfct_user_role', userToSet.role);
      localStorage.setItem('role', userToSet.role);
      localStorage.setItem('id', userWithEmail.id);
      localStorage.setItem('email', userEmail);
      localStorage.setItem('name', userWithEmail.name);
      localStorage.setItem('avatar', userWithEmail.avatar);
      localStorage.setItem('community_id', userWithEmail.communityId);
      localStorage.setItem('login_info', JSON.stringify(loginInfo));
      localStorage.setItem('mfct_user_info', JSON.stringify(loginInfo));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveUser(USER_MEMBER);
    setCurrentRole('member');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mfct_is_logged_in');
      localStorage.removeItem('mfct_user_role');
      localStorage.removeItem('role');
      localStorage.removeItem('id');
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      localStorage.removeItem('avatar');
      localStorage.removeItem('community_id');
      localStorage.removeItem('login_info');
      localStorage.removeItem('mfct_user_info');
      router.push('/');
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
    setCurrentRole(newUser.role);
    if (typeof window !== 'undefined') {
      const loginInfo = {
        role: newUser.role,
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
        community_id: newUser.communityId,
      };
      localStorage.setItem('mfct_is_logged_in', 'true');
      localStorage.setItem('mfct_user_role', newUser.role);
      localStorage.setItem('role', newUser.role);
      localStorage.setItem('id', newUser.id);
      localStorage.setItem('email', newUser.email);
      localStorage.setItem('name', newUser.name);
      localStorage.setItem('avatar', newUser.avatar);
      localStorage.setItem('community_id', newUser.communityId);
      localStorage.setItem('login_info', JSON.stringify(loginInfo));
      localStorage.setItem('mfct_user_info', JSON.stringify(loginInfo));
    }
  };

  const handleCampaignCreated = (newCampaign: Campaign) => {
    setCampaignsList(prev => {
      const exists = prev.find(c => c.id === newCampaign.id);
      if (exists) {
        return prev.map(c => c.id === newCampaign.id ? newCampaign : c);
      }
      return [newCampaign, ...prev];
    });
  };

  const handleCampaignUpdated = (updatedCamp: Campaign) => {
    setCampaignsList((prev) => prev.map((c) => (c.id === updatedCamp.id ? updatedCamp : c)));
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mfct_user_role', role);
    }
    if (role === 'super_admin') {
      setActiveUser(USER_SUPER_ADMIN);
    } else if (role === 'executive_admin') {
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
  const handleSelectDonationReceipt = (d: Donation) => setSelectedReceiptDonation(d);

  // ─── Navigation ──────────────────────────────────────────────────────────

  const pageToPath: Record<string, string> = {
    home: '/',
    campaigns: '/campaigns',
    emergency: '/emergency',
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
          onLoginRole={(role, email, customUser) => {
            handleLogin(role, email, customUser);
          }}
          onOpenRegister={handleOpenRegister}
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
    </>
  );

  // ─── Context Value ───────────────────────────────────────────────────────

  const contextValue: AppStateContextType = {
    isInitialized,
    isAuthenticated,
    currentRole,
    activeUser,
    campaignsList,
    handleOpenDonate,
    handleOpenRegister,
    handleOpenMembershipCard,
    handleOpenZakatCalc,
    handleOpenLogin,
    handleSelectDonationReceipt,
    handleRoleChange,
    handleLogin,
    handleLogout,
    handleCampaignCreated,
    handleCampaignUpdated,
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
