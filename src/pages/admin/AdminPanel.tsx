import React, { useState } from 'react';
import { UserRole, User, Campaign, Donation } from '../../types';
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
  ArrowUpRight
} from 'lucide-react';

// Dashboard components
import { MemberDashboard } from '../dashboards/MemberDashboard';
import { PremiumDonorDashboard } from '../dashboards/PremiumDonorDashboard';
import { CommunityAdminDashboard } from '../dashboards/CommunityAdminDashboard';
import { ExecutiveDashboard } from '../dashboards/ExecutiveDashboard';
import { SuperAdminDashboard } from '../dashboards/SuperAdminDashboard';
import { MOCK_DONATIONS, MOCK_PENDING_QUEUE, CURRENT_USER_MEMBER, CURRENT_USER_PREMIUM } from '../../data/mockData';

const MOCK_MEMBERS: User[] = [
  CURRENT_USER_MEMBER,
  CURRENT_USER_PREMIUM,
  {
    id: 'usr_mem_103',
    name: 'Mohammad Tariq',
    email: 'tariq@example.com',
    phone: '+91 98220 11223',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    communityId: 'comm_hyd_oldcity',
    communityName: 'Charminar Heritage & Care Society',
    membershipId: 'SS-HYD-2024-1042',
    isVerified: true,
    isPremium: false,
    joinDate: '15 Feb 2024',
    city: 'Hyderabad',
    state: 'Telangana',
    totalDonatedINR: 8500,
    donationsCount: 8,
  },
  {
    id: 'usr_mem_104',
    name: 'Syeda Saira Begum',
    email: 'saira@example.com',
    phone: '+91 97110 55443',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    communityId: 'comm_mum_kurla',
    communityName: 'Kurla Progressive Community Care',
    membershipId: 'SS-MUM-2024-0092',
    isVerified: true,
    isPremium: false,
    joinDate: '01 Mar 2024',
    city: 'Mumbai',
    state: 'Maharashtra',
    totalDonatedINR: 14000,
    donationsCount: 11,
  }
];

interface AdminPanelProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeUser: User;
  campaignsList: Campaign[];
  onOpenDonate: (campaign?: Campaign) => void;
  onOpenRegister: () => void;
  onOpenMembershipCard: () => void;
  onSelectDonationReceipt: (donation: Donation) => void;
  onOpenCreateCampaign: () => void;
  onNavigateToWebsite: () => void;
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
  onOpenCreateCampaign,
  onNavigateToWebsite,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aidRequested, setAidRequested] = useState<boolean>(false);
  const { t, isHindi } = useLanguage();

  // Role metadata for badge styling
  const roleBadges: Record<UserRole, { label: string; color: string; icon: React.ReactNode }> = {
    member: { label: t('admin.memberDonor', 'Member'), color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: <Heart className="w-3.5 h-3.5 text-emerald-600" /> },
    premium_donor: { label: t('admin.premDonor', 'Premium Donor'), color: 'bg-amber-100 text-amber-800 border-amber-300', icon: <Award className="w-3.5 h-3.5 text-amber-600" /> },
    community_admin: { label: t('admin.commAdmin', 'Community Admin'), color: 'bg-blue-100 text-blue-800 border-blue-300', icon: <Users className="w-3.5 h-3.5 text-blue-600" /> },
    executive: { label: t('admin.execAdmin', 'Executive Officer'), color: 'bg-purple-100 text-purple-800 border-purple-300', icon: <UserCheck className="w-3.5 h-3.5 text-purple-600" /> },
    super_admin: { label: 'Super Admin', color: 'bg-slate-800 text-white border-slate-700', icon: <Shield className="w-3.5 h-3.5 text-emerald-400" /> },
  };

  // Build menu items dynamically based on current selected role
  const getSidebarMenus = () => {
    const commonMenus = [
      { id: 'overview', label: t('admin.tabOverview', 'Dashboard Overview'), icon: LayoutDashboard },
    ];

    let roleMenus: { id: string; label: string; icon: any; badge?: string }[] = [];

    if (currentRole === 'member' || currentRole === 'premium_donor') {
      roleMenus = [
        { id: 'my_donations', label: t('admin.myReceipts', 'My Donations & Receipts'), icon: CreditCard, badge: '5' },
        { id: 'emergency_aid', label: isHindi ? 'आपातकालीन सहायता हेतु आवेदन' : 'Request Emergency Aid', icon: AlertTriangle },
        { id: 'community_hub', label: t('sec.communityTitle', 'Community Network'), icon: Building2 },
      ];
      if (currentRole === 'premium_donor') {
        roleMenus.push({ id: 'hasanat_certificate', label: isHindi ? 'हसनात सम्मान प्रमाणपत्र' : 'Hasanat Certificate', icon: Award, badge: 'VIP' });
      }
    } else if (currentRole === 'community_admin') {
      roleMenus = [
        { id: 'campaigns', label: t('admin.tabCampaigns', 'Manage Campaigns'), icon: PlusCircle, badge: campaignsList.length.toString() },
        { id: 'community_members', label: t('admin.tabMembers', 'Members Directory'), icon: Users, badge: '1,240' },
        { id: 'beneficiary_verification', label: isHindi ? 'स्थानीय सत्यापन रिपोर्ट' : 'On-site Verifications', icon: FileCheck },
        { id: 'chapter_settings', label: isHindi ? 'इकाई सेटिंग्स' : 'Chapter Settings', icon: Settings },
      ];
    } else if (currentRole === 'executive') {
      roleMenus = [
        { id: 'kyc_queue', label: isHindi ? 'केवाईसी सत्यापन कतार' : 'Aadhaar KYC Queue', icon: UserCheck, badge: '3 Pending' },
        { id: 'utr_audit', label: isHindi ? 'यूटीआर भुगतान डेस्क' : 'UTR Payment Desk', icon: ShieldCheck },
        { id: 'escrow_verification', label: isHindi ? 'हॉस्पिटल एस्क्रो लॉग्स' : 'Hospital Escrow Logs', icon: FileText },
      ];
    } else if (currentRole === 'super_admin') {
      roleMenus = [
        { id: 'financial_analytics', label: isHindi ? 'वित्तीय विश्लेषण' : 'Financial Analytics', icon: TrendingUp },
        { id: 'kyc_queue', label: isHindi ? 'अनुपालन कतार' : 'KYC & Compliance Queue', icon: UserCheck, badge: '3' },
        { id: 'community_members', label: isHindi ? 'राष्ट्रीय सदस्य आधार' : 'National Member Base', icon: Users, badge: '6,680' },
        { id: 'system_settings', label: isHindi ? 'सिस्टम सेटिंग्स' : 'System & Role Config', icon: Settings },
      ];
    }

    return { commonMenus, roleMenus };
  };

  const { commonMenus, roleMenus } = getSidebarMenus();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Admin Panel Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR */}
        <aside
          className={`bg-slate-950 text-slate-300 w-72 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300 fixed lg:static inset-y-0 left-0 z-50 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
          }`}
        >
          {/* Brand & App Title */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                M
              </div>
              <div className={!sidebarOpen ? 'lg:hidden' : 'block'}>
                <h1 className="font-extrabold text-base text-white leading-none">MFCT Portal</h1>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mt-0.5">
                  {t('admin.title', 'Management Desk')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              <ChevronRight className={`w-5 h-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Role Switcher Widget inside Sidebar */}
          <div className={`p-4 border-b border-slate-800/80 bg-slate-900/60 ${!sidebarOpen ? 'lg:hidden' : 'block'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              {t('admin.switchRole', 'Select Active Role View:')}
            </span>
            <select
              value={currentRole}
              onChange={(e) => {
                onRoleChange(e.target.value as UserRole);
                setActiveTab('overview');
              }}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500"
            >
              <option value="member">👤 {t('admin.memberDonor', 'Member (Regular Donor)')}</option>
              <option value="premium_donor">⭐ {t('admin.premDonor', 'Premium Donor (Hasanat)')}</option>
              <option value="community_admin">🏢 {t('admin.commAdmin', 'Community Admin')}</option>
              <option value="executive">🛡️ {t('admin.execAdmin', 'Executive Verification Officer')}</option>
              <option value="super_admin">⚡ Super Admin</option>
            </select>
          </div>

          {/* Sidebar Menu Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            {/* Common Navigation */}
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2 block ${!sidebarOpen ? 'lg:hidden' : ''}`}>
                Main Portal
              </span>
              <div className="space-y-1">
                {commonMenus.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className={!sidebarOpen ? 'lg:hidden' : 'block'}>{item.label}</span>
                    </button>
                  );
                })}

                <button
                  onClick={onOpenMembershipCard}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
                >
                  <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className={!sidebarOpen ? 'lg:hidden' : 'block'}>{t('nav.myCard', 'Digital ID Card')}</span>
                </button>
              </div>
            </div>

            {/* Role Specific Navigation */}
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2 block ${!sidebarOpen ? 'lg:hidden' : ''}`}>
                {isHindi ? 'भूमिका क्षमताएं' : 'Role Capabilities'}
              </span>
              <div className="space-y-1">
                {roleMenus.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className={`truncate ${!sidebarOpen ? 'lg:hidden' : 'block'}`}>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                          isActive ? 'bg-white text-emerald-900' : 'bg-slate-800 text-emerald-400 border border-slate-700'
                        } ${!sidebarOpen ? 'lg:hidden' : 'block'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Footer - Exit to Public Website */}
          <div className="p-3 border-t border-slate-800 space-y-2">
            <button
              onClick={onNavigateToWebsite}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-xs border border-slate-800 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span className={!sidebarOpen ? 'lg:hidden' : 'block'}>{t('admin.backToWeb', 'Exit to Public Website')}</span>
            </button>

            {/* Current Active User Info */}
            <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5 ${!sidebarOpen ? 'lg:hidden' : 'flex'}`}>
              <img src={activeUser.avatar} alt={activeUser.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500" />
              <div className="overflow-hidden">
                <p className="font-bold text-xs text-white truncate">{activeUser.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{activeUser.communityName}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN ADMIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
          {/* Topbar Header */}
          <header className="bg-slate-900 border-b border-slate-800 py-3.5 px-4 sm:px-6 sticky top-0 z-30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative hidden sm:block max-w-xs w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isHindi ? "अभियान या सदस्य खोजें..." : "Search campaigns, UTR or members..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Topbar Right Actions */}
            <div className="flex items-center gap-3">
              {/* Language Switcher in Admin Panel */}
              <LanguageSelector compact />

              {/* Active Role Badge Indicator */}
              <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${roleBadges[currentRole].color}`}>
                {roleBadges[currentRole].icon}
                <span>{roleBadges[currentRole].label}</span>
              </div>

              {(currentRole === 'community_admin' || currentRole === 'super_admin') && (
                <button
                  onClick={onOpenCreateCampaign}
                  className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t('admin.createNew', 'Create Campaign')}</span>
                </button>
              )}

              <button
                onClick={() => onOpenDonate()}
                className="py-1.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{t('nav.donate', 'Quick Donate')}</span>
              </button>


              <button
                onClick={onOpenMembershipCard}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center"
                title="View Digital ID Card"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
              </button>

              <button className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center relative">
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2"></span>
              </button>
            </div>
          </header>

          {/* MAIN PAGE BODY */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* 1. OVERVIEW TAB - Renders the selected Role Dashboard */}
            {activeTab === 'overview' && (
              <div>
                {currentRole === 'member' && (
                  <MemberDashboard
                    user={activeUser}
                    onOpenDonate={() => onOpenDonate()}
                    onOpenMembershipCard={onOpenMembershipCard}
                    onSelectDonationReceipt={onSelectDonationReceipt}
                  />
                )}
                {currentRole === 'premium_donor' && (
                  <PremiumDonorDashboard
                    user={activeUser}
                    onOpenDonate={() => onOpenDonate()}
                    onSelectDonationReceipt={onSelectDonationReceipt}
                  />
                )}
                {currentRole === 'community_admin' && (
                  <CommunityAdminDashboard
                    onOpenCreateCampaign={onOpenCreateCampaign}
                    campaignsList={campaignsList}
                  />
                )}
                {currentRole === 'executive' && <ExecutiveDashboard />}
                {currentRole === 'super_admin' && <SuperAdminDashboard />}
              </div>
            )}

            {/* 2. MY DONATIONS TAB */}
            {activeTab === 'my_donations' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-white">My Donation History & UTR Receipts</h2>
                    <p className="text-xs text-slate-400">View tax-deductible 80G compliant receipts for all your donations.</p>
                  </div>
                  <button
                    onClick={() => onOpenDonate()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
                  >
                    + Donate Now
                  </button>
                </div>

                <div className="space-y-3">
                  {MOCK_DONATIONS.map((don) => (
                    <div
                      key={don.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800 text-[10px]">
                            ✓ UTR Verified
                          </span>
                          <span className="text-slate-400">• {don.date}</span>
                        </div>
                        <h4 className="font-bold text-white text-sm">{don.campaignTitle}</h4>
                        <p className="text-slate-400">Community: {don.communityName} • UTR No: {don.utrNumber}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-emerald-400">₹{don.amountINR.toLocaleString('en-IN')}</span>
                        <button
                          onClick={() => onSelectDonationReceipt(don)}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 border border-slate-700"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. CAMPAIGNS MANAGEMENT TAB */}
            {activeTab === 'campaigns' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-white">Community Campaign Manager</h2>
                    <p className="text-xs text-slate-400">Review and publish verified community fundraising causes.</p>
                  </div>
                  <button
                    onClick={onOpenCreateCampaign}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" /> Create New Campaign
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaignsList.map((c) => (
                    <div key={c.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          {c.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{c.daysLeft} days left</span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{c.title}</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Raised: ₹{c.raisedINR.toLocaleString('en-IN')}</span>
                          <span>Goal: ₹{c.goalINR.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, (c.raisedINR / c.goalINR) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. EMERGENCY AID REQUEST TAB */}
            {activeTab === 'emergency_aid' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-2xl mx-auto">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Verified Member Privilege</span>
                  <h2 className="text-xl font-black text-white">Apply for Community Emergency Aid</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Your active ₹50 membership qualifies your family for urgent medical, education, or funeral assistance.
                  </p>
                </div>

                {aidRequested ? (
                  <div className="p-6 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h3 className="font-bold text-base text-white">Aid Request Submitted!</h3>
                    <p className="text-xs text-slate-300">
                      Your Community Admin ({activeUser.communityName}) and Executive Verification Officer have been notified. An on-site visit will be conducted within 12 hours.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setAidRequested(true);
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Aid Category</label>
                      <select className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl outline-none focus:border-emerald-500">
                        <option>Medical Surgery / ICU Emergency</option>
                        <option>Janazah Funeral Expenses & Ambulance</option>
                        <option>Bridal Dignity & Nikah Aid</option>
                        <option>School / Orphan Education Fees</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Estimated Amount Required (₹)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 50000"
                        className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Detailed Explanation & Hospital Details</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Describe the medical condition or emergency..."
                        className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl outline-none focus:border-emerald-500"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
                    >
                      Submit Emergency Aid Application
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* 5. MEMBERS DIRECTORY TAB */}
            {activeTab === 'community_members' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-white">Community Members Directory</h2>
                    <p className="text-xs text-slate-400">Verified ₹50 registered community members with active Digital ID cards.</p>
                  </div>
                  <span className="text-xs bg-slate-800 text-emerald-400 px-3 py-1 rounded-xl font-bold border border-slate-700">
                    Total: {MOCK_MEMBERS.length} Active
                  </span>
                </div>

                <div className="space-y-2">
                  {MOCK_MEMBERS.map((m) => (
                    <div key={m.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-white">{m.name}</p>
                          <p className="text-[10px] text-slate-400">ID: {m.membershipId} • {m.city}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                        ✓ KYC Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. HASANAT CERTIFICATE TAB */}
            {activeTab === 'hasanat_certificate' && (
              <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-8 text-center space-y-6 max-w-xl mx-auto shadow-xl">
                <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto ring-4 ring-amber-500/10">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Official Award Certificate</span>
                  <h2 className="text-2xl font-black text-white mt-1">Hasanat High-Impact Patron</h2>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Awarded to <strong className="text-amber-300">{activeUser.name}</strong> for extraordinary philanthropic contributions exceeding ₹5,00,000 towards orphan care, emergency medical dialysers & community welfare in India.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-xl border border-amber-500/20 text-xs text-left space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Hasanat Points Accumulated:</span>
                    <strong className="text-amber-400">4,850 pts</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Verified Lives Impacted:</span>
                    <strong className="text-emerald-400">142 Beneficiaries</strong>
                  </div>
                </div>

                <button className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg">
                  Download Official Signed PDF Certificate
                </button>
              </div>
            )}

            {/* 7. FINANCIAL ANALYTICS & SYSTEM SETTINGS FALLBACK */}
            {(activeTab === 'financial_analytics' || activeTab === 'system_settings' || activeTab === 'chapter_settings' || activeTab === 'community_hub' || activeTab === 'utr_audit' || activeTab === 'escrow_verification' || activeTab === 'beneficiary_verification') && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-black text-white capitalize">{activeTab.replace('_', ' ')} Management</h2>
                <p className="text-xs text-slate-400">System metrics and live escrow audit feeds are updated in real time.</p>
                <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-white">System Synchronized</p>
                  <p className="mt-1">All audit logs, UTR receipts, and escrow disbursals are 100% verified by third-party auditors.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
