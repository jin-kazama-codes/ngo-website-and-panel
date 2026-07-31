import React, { useState, useEffect } from 'react';
import { UserRole, User, Campaign, Donation } from './types';
import { CURRENT_USER_MEMBER, CURRENT_USER_PREMIUM, MOCK_CAMPAIGNS, MOCK_DONATIONS } from './data/mockData';

// Components & Modals
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DonationModal } from './components/DonationModal';
import { RegistrationModal } from './components/RegistrationModal';
import { MembershipCardModal, ReceiptModal } from './components/MembershipCardModal';
import { CampaignDetailModal } from './components/CampaignDetailModal';
import { CreateCampaignModal } from './components/CreateCampaignModal';

// Pages
import { HomePage } from './pages/HomePage';
import { CampaignsPage } from './pages/CampaignsPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { AboutPage } from './pages/AboutPage';
import { GalleryPage } from './pages/GalleryPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { ContactPage } from './pages/ContactPage';

// Admin Panel (Separate /admin route)
import { AdminPanel } from './pages/admin/AdminPanel';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(
    window.location.pathname.startsWith('/admin') ? '/admin' : '/'
  );
  const [currentRole, setCurrentRole] = useState<UserRole>('member');
  const [currentPage, setCurrentPage] = useState<string>('home'); // 'home', 'campaigns', 'communities', 'about', 'gallery', 'testimonials', 'contact'
  const [activeUser, setActiveUser] = useState<User>(CURRENT_USER_MEMBER);
  const [campaignsList, setCampaignsList] = useState<Campaign[]>(MOCK_CAMPAIGNS);

  // Modals
  const [showDonateModal, setShowDonateModal] = useState<boolean>(false);
  const [selectedDonateCampaign, setSelectedDonateCampaign] = useState<Campaign | undefined>(undefined);

  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [showMembershipCardModal, setShowMembershipCardModal] = useState<boolean>(false);

  const [selectedReceiptDonation, setSelectedReceiptDonation] = useState<Donation | null>(null);
  const [inspectingCampaign, setInspectingCampaign] = useState<Campaign | null>(null);
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState<boolean>(false);

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/admin')) {
        setCurrentRoute('/admin');
      } else {
        setCurrentRoute('/');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation handlers
  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setCurrentRoute('/admin');
    window.scrollTo(0, 0);
  };

  const navigateToWebsite = (page: string = 'home') => {
    window.history.pushState({}, '', '/');
    setCurrentRoute('/');
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Handle role switch inside Admin Panel
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'premium_donor') {
      setActiveUser(CURRENT_USER_PREMIUM);
    } else {
      setActiveUser({
        ...CURRENT_USER_MEMBER,
        role: role,
      });
    }
  };

  // Open Donate Modal
  const handleOpenDonate = (campaign?: Campaign) => {
    setSelectedDonateCampaign(campaign);
    setShowDonateModal(true);
  };

  // On new donation created
  const handleDonationSuccess = (newDonation: Donation) => {
    // Update active campaign raised amount
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

  // On new member registered
  const handleUserRegistered = (newUser: User) => {
    setActiveUser(newUser);
  };

  // On new campaign created by Community Admin
  const handleCampaignCreated = (newCamp: Campaign) => {
    setCampaignsList([newCamp, ...campaignsList]);
    setShowCreateCampaignModal(false);
  };

  // IF ROUTE IS /admin -> RENDER DEDICATED ADMIN PANEL
  if (currentRoute === '/admin') {
    return (
      <>
        <AdminPanel
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          activeUser={activeUser}
          campaignsList={campaignsList}
          onOpenDonate={handleOpenDonate}
          onOpenRegister={() => setShowRegisterModal(true)}
          onOpenMembershipCard={() => setShowMembershipCardModal(true)}
          onSelectDonationReceipt={(d) => setSelectedReceiptDonation(d)}
          onOpenCreateCampaign={() => setShowCreateCampaignModal(true)}
          onNavigateToWebsite={() => navigateToWebsite('home')}
        />

        {/* SHARED MODALS */}
        {showDonateModal && (
          <DonationModal
            campaign={selectedDonateCampaign}
            onClose={() => {
              setShowDonateModal(false);
              setSelectedDonateCampaign(undefined);
            }}
            onDonationSuccess={handleDonationSuccess}
          />
        )}

        {showRegisterModal && (
          <RegistrationModal
            onClose={() => setShowRegisterModal(false)}
            onRegistered={handleUserRegistered}
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

        {showCreateCampaignModal && (
          <CreateCampaignModal
            onClose={() => setShowCreateCampaignModal(false)}
            onCreate={handleCampaignCreated}
          />
        )}
      </>
    );
  }

  // PUBLIC WEBSITE PORTAL (NO ADMIN LINKS / BARS ON WEBSITE)
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Main Public Navigation Header */}
      <Navbar
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        currentUser={activeUser}
        onOpenDonate={() => handleOpenDonate()}
        onOpenRegister={() => setShowRegisterModal(true)}
        onOpenMembershipCard={() => setShowMembershipCardModal(true)}
        onNavigateToAdmin={navigateToAdmin}
      />

      {/* 2. Main Public Body Content Area */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onDonate={(c) => handleOpenDonate(c)}
            onViewCampaignDetail={(c) => setInspectingCampaign(c)}
            onOpenRegister={() => setShowRegisterModal(true)}
            onNavigatePage={(p) => setCurrentPage(p)}
          />
        )}
        {currentPage === 'campaigns' && (
          <CampaignsPage
            onDonate={(c) => handleOpenDonate(c)}
            onViewCampaignDetail={(c) => setInspectingCampaign(c)}
          />
        )}
        {currentPage === 'communities' && (
          <CommunitiesPage onOpenRegister={() => setShowRegisterModal(true)} />
        )}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'gallery' && <GalleryPage />}
        {currentPage === 'testimonials' && <TestimonialsPage />}
        {currentPage === 'contact' && <ContactPage />}
      </main>

      {/* 3. Rich Multi-column Footer */}
      <Footer
        onPageChange={(p) => setCurrentPage(p)}
        onOpenDonate={() => handleOpenDonate()}
        onNavigateToAdmin={navigateToAdmin}
      />

      {/* SHARED MODALS */}
      {showDonateModal && (
        <DonationModal
          campaign={selectedDonateCampaign}
          onClose={() => {
            setShowDonateModal(false);
            setSelectedDonateCampaign(undefined);
          }}
          onDonationSuccess={handleDonationSuccess}
        />
      )}

      {showRegisterModal && (
        <RegistrationModal
          onClose={() => setShowRegisterModal(false)}
          onRegistered={handleUserRegistered}
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
    </div>
  );
}
