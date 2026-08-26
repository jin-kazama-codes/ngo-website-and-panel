import { Campaign, Community, Donation, User, AuditLog, Testimonial, CommunityStory, PendingVerificationItem } from '../types';
import { UserRole } from '../types';

// Role User Stubs (For active role sessions mapped to database records)
const createEmptyUser = (role: UserRole, idPrefix: string): User => ({
  id: '',
  name: 'No User',
  email: '',
  phone: '',
  role,
  avatar: 'https://via.placeholder.com/150',
  communityId: '',
  communityName: '',
  membershipId: '',
  isVerified: false,
  joinDate: '',
  city: '',
  state: '',
});

export const USER_SUPER_ADMIN: User = createEmptyUser('super_admin', 'super');
export const USER_EXECUTIVE_ADMIN: User = createEmptyUser('executive_admin', 'exec');
export const USER_COMMUNITY_ADMIN: User = createEmptyUser('community_admin', 'comm');
export const USER_MEMBER: User = createEmptyUser('member', 'mem');
export const CURRENT_USER_MEMBER: User = USER_MEMBER;
export const CURRENT_USER_PREMIUM: User = createEmptyUser('premium_donor', 'prem');

// All dynamic lists default to empty arrays; components query Supabase DB tables directly
export const MOCK_COMMUNITIES: Community[] = [];
export const MOCK_CAMPAIGNS: Campaign[] = [];
export const MOCK_DONATIONS: Donation[] = [];
export const MOCK_PENDING_QUEUE: PendingVerificationItem[] = [];
export const MOCK_AUDIT_LOGS: AuditLog[] = [];
export const MOCK_TESTIMONIALS: Testimonial[] = [];
export const MOCK_STORIES: CommunityStory[] = [];
