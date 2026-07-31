export type UserRole = 
  | 'super_admin'
  | 'community_admin'
  | 'executive'
  | 'member'
  | 'premium_donor';

export type DonationCategory = 
  | 'General'
  | 'Sadakah'
  | 'Zakat'
  | 'Fitrah'
  | 'Medical'
  | 'Education'
  | 'Marriage'
  | 'Janazah'
  | 'Masjid'
  | 'Madarsa'
  | 'Emergency Relief'
  | 'Food'
  | 'Shelter'
  | 'Disability Support'
  | 'Widow Support'
  | 'Orphan Support'
  | 'Community';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  communityId: string;
  communityName: string;
  membershipId: string;
  isVerified: boolean;
  isPremium: boolean;
  joinDate: string;
  city: string;
  state: string;
  totalDonatedINR: number;
  donationsCount: number;
  lifeImpactScore?: number;
  familiesHelped?: number;
  hasanatCounter?: number;
  givingStreakMonths?: number;
  communityRank?: number;
}

export interface Community {
  id: string;
  name: string;
  city: string;
  state: string;
  adminName: string;
  adminRoleTitle: string; // e.g. "Community Administrator"
  avatar: string;
  totalMembers: number;
  activeCampaigns: number;
  totalRaisedINR: number;
  healthScore: number; // 0 - 100
  verifiedStatus: 'Verified' | 'Pending' | 'Flagged';
  description: string;
  establishedYear: number;
  coverImage: string;
}

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  category: DonationCategory;
  communityId: string;
  communityName: string;
  city: string;
  beneficiaryName: string;
  beneficiaryRelation: string;
  goalINR: number;
  raisedINR: number;
  donorsCount: number;
  daysLeft: number;
  isVerified: boolean;
  isZakatEligible: boolean;
  isUrgent: boolean;
  isPremiumFeatured: boolean;
  mainImage: string;
  story: string;
  documents: { title: string; url: string; verifiedBy: string }[];
  verificationTimeline: { step: string; date: string; status: 'completed' | 'in_progress' | 'pending' }[];
  needBreakdown: { item: string; amountINR: number }[];
  createdDate: string;
  status: 'active' | 'pending_approval' | 'completed' | 'rejected';
}

export interface Donation {
  id: string;
  transactionId: string;
  utrNumber: string;
  donorName: string;
  donorId: string;
  donorRole: UserRole;
  campaignId: string;
  campaignTitle: string;
  communityName: string;
  amountINR: number;
  category: DonationCategory;
  isOutsideCommunity: boolean;
  paymentMethod: 'UPI' | 'Bank Transfer' | 'QR Code' | 'Card';
  paymentScreenshotUrl?: string;
  status: 'verified' | 'pending_verification' | 'rejected';
  date: string;
  receiptNumber: string;
}

export interface PendingVerificationItem {
  id: string;
  type: 'kyc' | 'campaign' | 'payment_utr' | 'dispute';
  title: string;
  submittedBy: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  details: string;
  documentUrl?: string;
  amountINR?: number;
  utr?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  role: UserRole;
  details: string;
  ipAddress: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  quote: string;
  avatar: string;
  campaignTitle?: string;
  amountReceivedINR?: number;
  videoThumbnail?: string;
}

export interface CommunityStory {
  id: string;
  title: string;
  category: DonationCategory;
  location: string;
  date: string;
  image: string;
  summary: string;
  impactMetric: string;
}
