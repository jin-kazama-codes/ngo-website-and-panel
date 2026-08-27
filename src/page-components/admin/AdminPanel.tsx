'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserRole, User, Campaign, Donation } from '../../types';
import { getDonations } from '../../services/donationService';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../../components/LanguageSelector';
import {
  LayoutDashboard,
  CreditCard,
  PlusCircle,
  Users,
  ShieldCheck,
  FileCheck,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  ChevronDown,
  Heart,
  UserCheck,
  Building2,
  AlertTriangle,
  TrendingUp,
  FileText,
  QrCode,
  Sparkles,
  Shield,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  HeartPulse,
  MessageSquareQuote,
  Sun,
  Moon,
  MessageSquare

} from 'lucide-react';

import { MemberDashboard } from '../dashboards/MemberDashboard';
import { CommunityAdminDashboard } from '../dashboards/CommunityAdminDashboard';
import { ExecutiveDashboard } from '../dashboards/ExecutiveDashboard';
import { SuperAdminDashboard } from '../dashboards/SuperAdminDashboard';
import { Communities } from './Communities';
import { MyDonationsTab } from './MyDonationsTab';
import { CampaignsTab } from './CampaignsTab';
import { CreateCampaignTab } from './CreateCampaignTab';

import { CommunityMembersTab } from './CommunityMembersTab';
import { HasanatCertificateTab } from './HasanatCertificateTab';
import { SystemSettingsFallbackTab } from './SystemSettingsFallbackTab';
import { ManageGallery } from './ManageGallery';
import { ManageTestimonials } from './ManageTestimonials';
import { ManageUsers } from './ManageUsers';
import { MyCommunityTab } from './MyCommunityTab';
import { UtrAuditTab } from './UtrAuditTab';
import { FinancialAnalyticsTab } from './FinancialAnalyticsTab';
import { ContactMessagesTab } from './ContactMessagesTab';
import { AccountDetailsTab } from './AccountDetailsTab';

import { getUsers } from '../../services/userService';




interface AdminPanelProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeUser: User;
  campaignsList: Campaign[];
  onOpenDonate: (campaign?: Campaign) => void;
  onOpenRegister: () => void;
  onOpenMembershipCard: () => void;
  onSelectDonationReceipt: (donation: Donation) => void;
  onNavigateToWebsite: () => void;
  onLogout?: () => void;
  handleCampaignCreated?: (camp: Campaign) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentRole,
  onRoleChange,
  activeUser,
  campaignsList,
  onOpenDonate,
  onOpenRegister,
  onOpenMembershipCard,
  onSelectDonationReceipt,
  onNavigateToWebsite,
  onLogout,
  handleCampaignCreated,
}) => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminActiveTab') || 'overview';
    }
    return 'overview';
  });
  const [editingCampaign, setEditingCampaign] = useState<Campaign | undefined>(undefined);
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState<boolean>(true);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allDonations, setAllDonations] = useState<Donation[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const [aidRequested, setAidRequested] = useState<boolean>(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('adminTheme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    }
    return 'light';
  });

  const selectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileNavOpen(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminTheme', theme);
      localStorage.setItem('adminActiveTab', activeTab);
    }
  }, [theme, activeTab]);

  // Load users + donations for global search
  useEffect(() => {
    getUsers().then(setAllUsers).catch(() => { });
    getDonations().then(setAllDonations).catch(() => { });
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-close mobile nav on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute search results
  const q = searchQuery.toLowerCase().trim();
  const matchedCampaigns = q.length >= 2
    ? campaignsList.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    ).slice(0, 5)
    : [];
  const matchedUsers = q.length >= 2
    ? allUsers.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.communityName?.toLowerCase().includes(q)
    ).slice(0, 4)
    : [];
  const matchedDonations = q.length >= 2
    ? allDonations.filter(d =>
      d.utrNumber?.toLowerCase().includes(q) ||
      d.donorName?.toLowerCase().includes(q) ||
      d.campaignTitle?.toLowerCase().includes(q)
    ).slice(0, 4)
    : [];
  const hasResults = matchedCampaigns.length > 0 || matchedUsers.length > 0 || matchedDonations.length > 0;
  const showDropdown = searchFocused && q.length >= 2;

  const { t, isHindi } = useLanguage();

  // Filter role view selector options based on user's logged in account role
  const getAllowedRoles = () => {
    const userRole = activeUser.role;
    if (userRole === 'super_admin') {
      return [{ id: 'super_admin', label: '⚡ Super Admin' }];
    }
    if (userRole === 'executive_admin') {
      return [{ id: 'executive_admin', label: '🛡️ Executive Admin' }];
    }
    if (userRole === 'community_admin') {
      return [
        { id: 'community_admin', label: `🏢 ${t('admin.commAdmin', 'Community Admin')}` }
      ];
    }
    if (userRole === 'premium_donor') {
      return [
        { id: 'premium_donor', label: `⭐ ${t('admin.premDonor', 'Premium Donor')}` },
        { id: 'member', label: `👤 ${t('admin.memberDonor', 'Member / Volunteer')}` }
      ];
    }
    return [{ id: 'member', label: `👤 ${t('admin.memberDonor', 'Member / Volunteer')}` }];
  };

  const allowedRoles = getAllowedRoles();

  // Role metadata for badge styling
  const roleBadges: Record<UserRole, { label: string; color: string; icon: React.ReactNode }> = {
    member: { label: t('admin.memberDonor', 'Member'), color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: <Heart className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} /> },
    premium_donor: { label: t('admin.premDonor', 'Premium Donor'), color: 'bg-amber-100 text-amber-800 border-amber-300', icon: <Award className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} /> },
    community_admin: { label: t('admin.commAdmin', 'Community Admin'), color: 'bg-blue-100 text-blue-800 border-blue-300', icon: <Users className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} /> },
    executive_admin: { label: t('admin.execAdmin', 'Executive Officer'), color: 'bg-purple-100 text-purple-800 border-purple-300', icon: <UserCheck className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} /> },
    super_admin: { label: t('admin.superAdmin', 'Super Admin'), color: 'bg-slate-800 text-white border-slate-700', icon: <Shield className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} /> },
  };

  const rawRole = (currentRole as string) || 'member';
  let normalizedRole = rawRole.toLowerCase().trim().replace(' ', '_') as UserRole;

  // Extra mapping just in case
  if (normalizedRole === 'executive_admin' || normalizedRole.includes('executive')) normalizedRole = 'executive_admin';
  else if (normalizedRole === 'community_admin' || normalizedRole.includes('community')) normalizedRole = 'community_admin';
  else if (normalizedRole === 'super_admin' || normalizedRole.includes('super')) normalizedRole = 'super_admin';
  else if (normalizedRole === 'premium_donor' || normalizedRole.includes('premium')) normalizedRole = 'premium_donor';
  else normalizedRole = 'member';

  // Build menu items dynamically based on current selected role
  const getSidebarMenus = () => {
    const commonMenus = [
      { id: 'overview', label: t('admin.tabOverview', 'Dashboard Overview'), icon: LayoutDashboard },
    ];

    let roleMenus: { id: string; label: string; icon: any; badge?: string }[] = [];

    if (normalizedRole === 'member') {
      roleMenus = [
        { id: 'my_donations', label: t('admin.tabDonations', 'My Donations Receipts'), icon: CreditCard },
        { id: 'community_hub', label: t('admin.tabCommunityHub', 'My Community'), icon: Building2 },
        { id: "community_members", label: t('admin.tabMembers', 'Community Members'), icon: Users },
      ];
    } else if (normalizedRole === 'community_admin') {
      roleMenus = [
        { id: 'financial_analytics', label: t('admin.tabFinancialAnalytics', 'Financial Analytics'), icon: TrendingUp },
        { id: 'kyc_queue', label: t('admin.tabKycQueue', 'KYC Approvals'), icon: UserCheck },
        { id: 'utr_audit', label: t('admin.tabUtrAudit', 'UTR Payment Desk'), icon: ShieldCheck },
        { id: 'campaigns', label: t('admin.tabCampaigns', 'Manage Campaigns'), icon: PlusCircle },
        { id: "community_members", label: t('admin.tabMembers', 'Community Members'), icon: Users },
        { id: 'testimonials_manage', label: t('admin.tabTestimonialsManage', 'Impact Stories'), icon: MessageSquareQuote },
        { id: 'gallery_manage', label: t('admin.tabGalleryManage', 'Manage Gallery'), icon: Sparkles },
        { id: 'contact_messages', label: t('admin.tabContactMessages', 'Contact Messages'), icon: MessageSquare },
      ];
    } else if (normalizedRole === 'executive_admin' || normalizedRole === 'super_admin') {
      roleMenus = [
        { id: 'financial_analytics', label: t('admin.tabFinancialAnalytics', 'Financial Analytics'), icon: TrendingUp },
        { id: 'campaigns', label: t('admin.tabCampaigns', 'Manage Campaigns'), icon: PlusCircle },
        { id: 'kyc_queue', label: t('admin.tabKycQueue', 'KYC Approvals'), icon: UserCheck },
        { id: 'utr_audit', label: t('admin.tabUtrAudit', 'UTR Payment Desk'), icon: ShieldCheck },
        { id: 'communities_manage', label: t('admin.tabCommunitiesManage', 'Manage Communities'), icon: Building2 },
        { id: 'users_manage', label: t('admin.tabUsersManage', 'Manage Users'), icon: Users },
        { id: 'testimonials_manage', label: t('admin.tabTestimonialsManage', 'Impact Stories'), icon: MessageSquareQuote },
        { id: 'gallery_manage', label: t('admin.tabGalleryManage', 'Manage Gallery'), icon: Sparkles },
        { id: 'contact_messages', label: t('admin.tabContactMessages', 'Contact Messages'), icon: MessageSquare },
        { id: 'account_details', label: t('admin.tabAccountDetails', 'Account Details'), icon: FileCheck },
      ];
    }

    return { commonMenus, roleMenus };
  };

  const { commonMenus, roleMenus } = getSidebarMenus();

  const roleBadge = roleBadges[normalizedRole] || roleBadges.member;

  return (
    <div className={`h-screen max-h-screen overflow-hidden ${theme === 'dark' ? 'dark' : ''} flex flex-col font-sans`}
      style={{ background: theme === 'dark' ? '#0f1e17' : 'var(--mfct-warm-bg)', color: theme === 'dark' ? '#e2f0e8' : 'var(--mfct-text-dark)', fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}
    >
      {/* Admin Panel Container */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Mobile Backdrop Overlay */}
        {mobileNavOpen && (
          <div
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`flex flex-col shrink-0 transition-all duration-300 fixed lg:sticky lg:top-0 h-full max-h-screen inset-y-0 left-0 z-50 
            ${mobileNavOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full'} 
            lg:translate-x-0 ${desktopSidebarExpanded ? 'lg:w-72' : 'lg:w-20'}
          `}
          style={{ background: 'var(--mfct-dark-green)', color: 'rgba(255,255,255,0.85)', borderRight: '1px solid rgba(200,168,75,0.2)' }}
        >
          {/* Brand & App Title */}
          <div className={`flex items-center transition-all ${
            desktopSidebarExpanded ? 'p-4 justify-between' : 'p-3 flex-col gap-2 justify-center'
          }`} style={{ borderBottom: '1px solid rgba(200,168,75,0.2)', background: 'rgba(0,0,0,0.2)' }}>
            <div className="flex items-center gap-3" title="MFCT Portal">
              <img
                src="/mfct-logo.jpeg"
                alt="MFCT"
                className="w-9 h-9 rounded-full object-cover shadow-md shrink-0 cursor-pointer border border-[var(--mfct-gold)]"
              />
              {desktopSidebarExpanded && (
                <div className="min-w-0">
                  <h1 className="font-extrabold text-sm text-white leading-none truncate">MFCT Portal</h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider block mt-0.5 truncate" style={{ color: 'rgba(200,168,75,0.7)' }}>
                    Together for a Better Tomorrow
                  </span>
                </div>
              )}
            </div>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setDesktopSidebarExpanded(!desktopSidebarExpanded)}
              className="hidden lg:flex p-1.5 rounded-xl transition-colors cursor-pointer"
              style={{ color: 'rgba(200,168,75,0.6)' }}
              title={desktopSidebarExpanded ? t('admin.collapseSidebar', 'Collapse Sidebar') : t('admin.expandSidebar', 'Expand Sidebar')}
            >
              <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${desktopSidebarExpanded ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileNavOpen(false)}
              className="lg:hidden p-1.5 rounded-xl transition-colors cursor-pointer"
              style={{ color: 'rgba(200,168,75,0.6)' }}
              title={t('common.close', 'Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Logged-in Role Display (Read-Only) */}
          {desktopSidebarExpanded ? (
            <div className="p-3 py-2.5" title={roleBadge.label} style={{ borderBottom: '1px solid rgba(200,168,75,0.15)', background: 'rgba(0,0,0,0.15)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'rgba(200,168,75,0.55)' }}>
                {t('admin.activeRole', 'Active Logged-in Role:')}
              </span>
              <div className="w-full rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-2 select-none" style={{ background: 'rgba(200,168,75,0.10)', border: '1px solid rgba(200,168,75,0.2)', color: '#fff' }}>
                {roleBadge.icon}
                <span className="font-extrabold text-white">{roleBadge.label}</span>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex p-2 justify-center" title={roleBadge.label} style={{ borderBottom: '1px solid rgba(200,168,75,0.15)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center cursor-default" style={{ background: 'rgba(200,168,75,0.1)', border: '1px solid rgba(200,168,75,0.2)' }}>
                {roleBadge.icon}
              </div>
            </div>
          )}

          {/* Sidebar Menu Items */}
          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-2.5 space-y-3">
            {/* Common Navigation */}
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 mb-1.5 block ${!desktopSidebarExpanded ? 'lg:hidden' : ''}`} style={{ color: 'rgba(200,168,75,0.5)' }}>
                {t('admin.mainPortal', 'Main Portal')}
              </span>
              <div className="space-y-1">
                {commonMenus.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => selectTab(item.id)}
                      title={item.label}
                      className={`w-full flex items-center ${
                        desktopSidebarExpanded ? 'gap-3 px-3 py-2' : 'justify-center p-2.5'
                      } rounded-xl text-xs font-bold transition-all cursor-pointer`}
                      style={isActive ? {
                        background: 'var(--mfct-gold)', color: 'var(--mfct-dark-green)', borderLeft: '3px solid var(--mfct-gold-dark)'
                      } : {
                        color: 'rgba(255,255,255,0.75)'
                      }}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {desktopSidebarExpanded && <span>{item.label}</span>}
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    onOpenMembershipCard();
                    setMobileNavOpen(false);
                  }}
                  title={t('nav.myCard', 'Digital ID Card')}
                  className={`w-full flex items-center ${
                    desktopSidebarExpanded ? 'gap-3 px-3 py-2' : 'justify-center p-2.5'
                  } rounded-xl text-xs font-bold cursor-pointer transition-all`}
                  style={{ color: 'rgba(255,255,255,0.70)' }}
                >
                  <QrCode className="w-4 h-4 shrink-0" style={{ color: 'var(--mfct-gold)' }} />
                  {desktopSidebarExpanded && <span>{t('nav.myCard', 'Digital ID Card')}</span>}
                </button>
              </div>
            </div>

            {/* Role Specific Navigation */}
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 mb-1.5 block ${!desktopSidebarExpanded ? 'lg:hidden' : ''}`} style={{ color: 'rgba(200,168,75,0.5)' }}>
                {t('admin.roleCapabilities', 'Role Capabilities')}
              </span>
              <div className="space-y-1">
                {roleMenus.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => selectTab(item.id)}
                      title={item.label}
                      className={`w-full flex items-center ${
                        desktopSidebarExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5'
                      } rounded-xl text-xs font-bold transition-all cursor-pointer`}
                      style={isActive ? {
                        background: 'var(--mfct-gold)', color: 'var(--mfct-dark-green)'
                      } : {
                        color: 'rgba(255,255,255,0.70)'
                      }}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        {desktopSidebarExpanded && <span className="truncate">{item.label}</span>}
                      </div>
                      {item.badge && desktopSidebarExpanded && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0"
                          style={isActive ? { background: 'rgba(26,60,44,0.2)', color: 'var(--mfct-dark-green)' } : { background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-gold)' }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Footer - Exit to Public Website & Logout */}
          <div className="p-2.5 space-y-1.5" style={{ borderTop: '1px solid rgba(200,168,75,0.2)' }}>
            <button
              onClick={() => {
                onNavigateToWebsite();
                setMobileNavOpen(false);
              }}
              title={t('admin.backToWeb', 'Exit to Public Website')}
              className={`w-full flex items-center ${
                desktopSidebarExpanded ? 'justify-center gap-2 py-2 px-3' : 'justify-center p-2.5'
              } rounded-xl font-bold text-xs transition-all cursor-pointer`}
              style={{ background: 'rgba(200,168,75,0.10)', color: 'var(--mfct-gold)', border: '1px solid rgba(200,168,75,0.2)' }}
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              {desktopSidebarExpanded && <span>{t('admin.backToWeb', 'Exit to Public Website')}</span>}
            </button>

            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  setMobileNavOpen(false);
                }}
                title={t('admin.logoutAccount', 'Logout Account')}
                className={`w-full flex items-center ${
                  desktopSidebarExpanded ? 'justify-center gap-2 py-2 px-3' : 'justify-center p-2.5'
                } rounded-xl font-bold text-xs transition-all cursor-pointer`}
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {desktopSidebarExpanded && <span>{t('admin.logoutAccount', 'Logout Account')}</span>}
              </button>
            )}

            {/* Current Active User Info */}
            <div
              title={`${activeUser.name} (${activeUser.communityName})`}
              className={`p-2 rounded-xl flex items-center cursor-default ${
                desktopSidebarExpanded ? 'gap-2.5' : 'justify-center'
              }`}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,168,75,0.15)' }}
            >
              <img src={activeUser.avatar} alt={activeUser.name} className="w-7 h-7 rounded-full object-cover shrink-0" style={{ border: '2px solid var(--mfct-gold)' }} />
              {desktopSidebarExpanded && (
                <div className="overflow-hidden min-w-0">
                  <p className="font-bold text-xs text-white truncate">{activeUser.name}</p>
                  <p className="text-[10px] truncate" style={{ color: 'rgba(200,168,75,0.6)' }}>{activeUser.communityName}</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN ADMIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 h-full min-h-0 overflow-y-auto" style={{ background: theme === 'dark' ? '#0f1e17' : 'var(--mfct-warm-bg)' }}>
          {/* Topbar Header */}
          <header className="py-3.5 px-4 sm:px-6 sticky top-0 z-30 flex items-center justify-between gap-4" style={{ background: 'var(--mfct-dark-green)', borderBottom: '1px solid rgba(200,168,75,0.2)' }}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-2 rounded-xl transition-colors cursor-pointer"
                style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-gold)' }}
              >
                <Menu className="w-5 h-5" />
              </button>

              <div ref={searchRef} className="relative hidden sm:block max-w-xs w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(200,168,75,0.6)' }} />
                <input
                  type="text"
                  placeholder={t('admin.searchPlaceholder', 'Search campaigns, UTR or members...')}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchFocused(true); }}
                  onFocus={() => setSearchFocused(true)}
                  className="w-full pl-9 pr-8 py-1.5 rounded-xl text-xs outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(200,168,75,0.25)', color: 'rgba(255,255,255,0.9)', }}
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setSearchFocused(false); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Search Results Dropdown */}
                {showDropdown && (
                  <div className="absolute top-full left-0 mt-1.5 w-[340px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden max-h-[420px] overflow-y-auto">
                    {!hasResults ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        <Search className="w-5 h-5 mx-auto mb-2 opacity-40" />
                        No results for &quot;{searchQuery}&quot;
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {/* Campaigns */}
                        {matchedCampaigns.length > 0 && (
                          <div>
                            <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Campaigns</p>
                            {matchedCampaigns.map(c => (
                              <button
                                key={c.id}
                                onClick={() => { setActiveTab('campaigns'); setSearchQuery(''); setSearchFocused(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                              >
                                <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{c.title}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{c.category} • {c.city} • {c.status}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Members */}
                        {matchedUsers.length > 0 && (
                          <div>
                            <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Members</p>
                            {matchedUsers.map(u => (
                              <button
                                key={u.id}
                                onClick={() => { setActiveTab('users_manage'); setSearchQuery(''); setSearchFocused(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                              >
                                <img
                                  src={u.avatar || 'https://via.placeholder.com/32'}
                                  alt={u.name}
                                  className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-emerald-400"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{u.name}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{u.email} • {u.communityName}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* UTR / Donations */}
                        {matchedDonations.length > 0 && (
                          <div>
                            <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">UTR / Payments</p>
                            {matchedDonations.map(d => (
                              <button
                                key={d.id}
                                onClick={() => { setActiveTab('utr_audit'); setSearchQuery(''); setSearchFocused(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                              >
                                <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{d.donorName} — ₹{d.amountINR?.toLocaleString('en-IN')}</p>
                                  <p className="text-[10px] text-slate-400 font-mono truncate">UTR: {d.utrNumber || 'N/A'} • {d.campaignTitle}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Topbar Right Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Switcher */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-1.5 rounded-full transition-colors cursor-pointer"
                style={{ background: 'rgba(200,168,75,0.15)', color: 'var(--mfct-gold)', border: '1px solid rgba(200,168,75,0.2)' }}
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {/* Language Switcher in Admin Panel */}
              <LanguageSelector compact mode="admin" />

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full transition-colors cursor-pointer"
                  style={{ background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.3)' }}
                >
                  <img
                    src={activeUser.avatar || 'https://via.placeholder.com/150'}
                    alt={activeUser.name}
                    className="w-7 h-7 rounded-full object-cover"
                    style={{ border: '2px solid var(--mfct-gold)' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                    }}
                  />
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--mfct-gold)' }} />
                </button>

                {profileMenuOpen && (
                  <>
                    {/* Invisible overlay to catch clicks outside */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-slate-800 bg-slate-950/50">
                        <p className="text-sm font-bold text-white truncate">{activeUser.name || "No name"}</p>
                        <p className="text-xs text-slate-400 truncate">{activeUser.email || 'No email provided'}</p>
                      </div>
                      <div className="p-2">
                        <div className="px-2 py-1.5 mb-2 rounded-lg bg-slate-800/50 flex items-center gap-2 border border-slate-800">
                          {roleBadge.icon}
                          <span className="text-xs font-bold text-slate-300">{roleBadge.label}</span>
                        </div>

                        {onLogout && (
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              onLogout();
                            }}
                            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors text-xs font-bold text-left"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Logout</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* MAIN PAGE BODY */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* 1. OVERVIEW TAB - Renders the selected Role Dashboard */}
            {activeTab === 'overview' && (
              <div>
                {normalizedRole === 'member' && (
                  <MemberDashboard
                    user={activeUser}
                    onOpenDonate={() => onOpenDonate()}
                    onOpenMembershipCard={onOpenMembershipCard}
                    onSelectDonationReceipt={onSelectDonationReceipt}
                  />
                )}

                {normalizedRole === 'community_admin' && (
                  <CommunityAdminDashboard
                    activeUser={activeUser}
                    onOpenCreateCampaign={() => {
                      setEditingCampaign(undefined);
                      setActiveTab('create_campaign');
                    }}
                    campaignsList={campaignsList.filter(c => c.communityId === activeUser.communityId)}
                  />
                )}
                {(normalizedRole === 'executive_admin' || normalizedRole === 'super_admin') &&
                  <SuperAdminDashboard
                    activeUser={activeUser}
                  />}
              </div>
            )}

            {/* 2. MY DONATIONS TAB */}
            {activeTab === 'my_donations' && (
              <MyDonationsTab
                activeUser={activeUser}
                onOpenDonate={() => onOpenDonate()}
                onSelectDonationReceipt={onSelectDonationReceipt}
              />
            )}

            {/* 3. CAMPAIGNS MANAGEMENT TAB */}
            {activeTab === 'campaigns' && (
              <CampaignsTab
                campaignsList={
                  (normalizedRole === 'super_admin' || normalizedRole === 'executive_admin')
                    ? campaignsList
                    : (normalizedRole === 'community_admin')
                      ? campaignsList.filter(c => c.communityId === activeUser.communityId)
                      : campaignsList.filter(c => c.createdBy === activeUser.id || c.communityId === activeUser.communityId)
                }
                onOpenCreateCampaign={(c) => {
                  setEditingCampaign(c);
                  setActiveTab('create_campaign');
                }}
              />
            )}

            {activeTab === 'create_campaign' && (
              <CreateCampaignTab
                onClose={() => {
                  setActiveTab('campaigns');
                  setEditingCampaign(undefined);
                }}
                onCreate={(newCamp) => {
                  if (handleCampaignCreated) handleCampaignCreated(newCamp);
                  setActiveTab('campaigns');
                  setEditingCampaign(undefined);
                }}
                initialCampaign={editingCampaign}
              />
            )}

            {/* 5. MEMBERS DIRECTORY TAB */}
            {activeTab === 'community_members' && (
              <CommunityMembersTab activeUser={activeUser} />
            )}

            {/* 6. HASANAT CERTIFICATE TAB */}
            {activeTab === 'hasanat_certificate' && (
              <HasanatCertificateTab activeUser={activeUser} />
            )}

            {/* 7. FINANCIAL ANALYTICS & SYSTEM SETTINGS FALLBACK */}
            {activeTab === 'communities_manage' && <Communities />}
            {activeTab === 'users_manage' && <ManageUsers />}
            {activeTab === 'gallery_manage' && <ManageGallery activeUser={activeUser} />}
            {activeTab === 'testimonials_manage' && <ManageTestimonials activeUser={activeUser} />}
            {(activeTab === 'campaign_approvals' || activeTab === 'kyc_queue') && (
              <ExecutiveDashboard activeUser={activeUser} currentRole={normalizedRole} />
            )}

            {activeTab === 'financial_analytics' && (
              <FinancialAnalyticsTab activeUser={activeUser} currentRole={normalizedRole} />
            )}

            {(activeTab === 'system_settings' || activeTab === 'chapter_settings' || activeTab === 'escrow_verification' || activeTab === 'beneficiary_verification') && (
              <SystemSettingsFallbackTab activeTab={activeTab} activeUser={activeUser} currentRole={normalizedRole} />
            )}
            {activeTab === 'utr_audit' && <UtrAuditTab activeUser={activeUser} currentRole={normalizedRole} />}
            {activeTab === 'community_hub' && (
              <MyCommunityTab activeUser={activeUser} />
            )}
            {activeTab === 'contact_messages' && (
              <ContactMessagesTab />
            )}
            {activeTab === 'account_details' && (
              <AccountDetailsTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
