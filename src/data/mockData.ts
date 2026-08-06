import { Campaign, Community, Donation, User, AuditLog, Testimonial, CommunityStory, PendingVerificationItem } from '../types';

// Role User Stubs (For active role sessions mapped to database records)
export const USER_SUPER_ADMIN: User = {
  id: 'usr_super_admin',
  name: 'Maulana Hafiz Ziauddin (Super Admin)',
  email: 'superadmin@sevasangam.org',
  phone: '+91 99000 00001',
  role: 'super_admin',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
  communityId: 'comm_bareilly_hq',
  communityName: 'Bareilly Central Care Society (Headquarters)',
  membershipId: 'SS-HQ-SUPER-0001',
  isVerified: true,
  isPremium: true,
  joinDate: '01 Jan 2023',
  city: 'Bareilly',
  state: 'Uttar Pradesh',
  totalDonatedINR: 500000,
  donationsCount: 120,
};

export const USER_EXECUTIVE_ADMIN: User = {
  id: 'usr_executive_admin',
  name: 'Farhan Ali Siddiqui (Executive Admin)',
  email: 'executive@sevasangam.org',
  phone: '+91 99000 00002',
  role: 'executive',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  communityId: 'comm_bareilly_hq',
  communityName: 'Bareilly Central Care Society (Headquarters)',
  membershipId: 'SS-HQ-EXEC-0002',
  isVerified: true,
  isPremium: false,
  joinDate: '15 Feb 2023',
  city: 'Bareilly',
  state: 'Uttar Pradesh',
  totalDonatedINR: 45000,
  donationsCount: 22,
};

export const USER_COMMUNITY_ADMIN: User = {
  id: 'usr_community_admin',
  name: 'Dr. Shakeel Ahmad Usmani (Community Admin)',
  email: 'communityadmin@sevasangam.org',
  phone: '+91 99000 00003',
  role: 'community_admin',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  communityId: 'comm_bareilly_rohilkhand',
  communityName: 'Rohilkhand Educational & Nikah Trust',
  membershipId: 'SS-BLY-COMM-0003',
  isVerified: true,
  isPremium: false,
  joinDate: '10 Mar 2023',
  city: 'Bareilly',
  state: 'Uttar Pradesh',
  totalDonatedINR: 35000,
  donationsCount: 18,
};

export const USER_MEMBER: User = {
  id: 'usr_member',
  name: 'Aarif Khan (Member)',
  email: 'member@sevasangam.org',
  phone: '+91 99000 00004',
  role: 'member',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  communityId: 'comm_delhi_central',
  communityName: 'Hazrat Nizamuddin Welfare Community',
  membershipId: 'SS-DEL-MEM-0004',
  isVerified: true,
  isPremium: false,
  joinDate: '12 Jan 2024',
  city: 'Delhi',
  state: 'Delhi NCR',
  totalDonatedINR: 12500,
  donationsCount: 14,
};

export const CURRENT_USER_MEMBER: User = USER_MEMBER;

export const CURRENT_USER_PREMIUM: User = {
  id: 'usr_prem_202',
  name: 'Ayesha Fatima',
  email: 'ayesha.fatima@example.com',
  phone: '+91 98112 33445',
  role: 'premium_donor',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  communityId: 'comm_hyd_oldcity',
  communityName: 'Charminar Heritage & Care Society',
  membershipId: 'SS-HYD-PREM-0012',
  isVerified: true,
  isPremium: true,
  joinDate: '04 Mar 2023',
  city: 'Hyderabad',
  state: 'Telangana',
  totalDonatedINR: 185000,
  donationsCount: 48,
  lifeImpactScore: 94,
  familiesHelped: 38,
  hasanatCounter: 14850,
  givingStreakMonths: 18,
  communityRank: 3,
};

// All dynamic lists default to empty arrays; components query Supabase DB tables directly
export const MOCK_COMMUNITIES: Community[] = [];
export const MOCK_CAMPAIGNS: Campaign[] = [];
export const MOCK_DONATIONS: Donation[] = [];
export const MOCK_PENDING_QUEUE: PendingVerificationItem[] = [];
export const MOCK_AUDIT_LOGS: AuditLog[] = [];
export const MOCK_TESTIMONIALS: Testimonial[] = [];
export const MOCK_STORIES: CommunityStory[] = [];
