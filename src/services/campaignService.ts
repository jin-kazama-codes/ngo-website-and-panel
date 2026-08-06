import { Campaign, DonationCategory } from '../types';

function mapRow(row: Record<string, unknown>): Campaign {
  return {
    id: (row.id as string) || `camp_${Date.now()}`,
    title: (row.title as string) || '',
    slug: (row.slug as string) || '',
    category: (row.category as DonationCategory) || 'Medical',
    communityId: (row.communityId || row.community_id) as string,
    communityName: (row.communityName || row.community_name) as string,
    city: (row.city as string) || '',
    beneficiaryName: (row.beneficiaryName || row.beneficiary_name) as string,
    beneficiaryRelation: (row.beneficiaryRelation || row.beneficiary_relation) as string,
    goalINR: Number(row.goalINR ?? row.goal_inr ?? 100000),
    raisedINR: Number(row.raisedINR ?? row.raised_inr ?? 0),
    donorsCount: Number(row.donorsCount ?? row.donors_count ?? 0),
    daysLeft: Number(row.daysLeft ?? row.days_left ?? 30),
    isVerified: Boolean(row.isVerified ?? row.is_verified ?? true),
    isZakatEligible: Boolean(row.isZakatEligible ?? row.is_zakat_eligible ?? true),
    isUrgent: Boolean(row.isUrgent ?? row.is_urgent ?? false),
    isPremiumFeatured: Boolean(row.isPremiumFeatured ?? row.is_premium_featured ?? false),
    mainImage: (row.mainImage || row.main_image) as string,
    story: (row.story as string) || '',
    documents: ((row.documents ?? row.documents) as Campaign['documents']) || [],
    verificationTimeline: ((row.verificationTimeline ?? row.verification_timeline) as Campaign['verificationTimeline']) || [],
    needBreakdown: ((row.needBreakdown ?? row.need_breakdown) as Campaign['needBreakdown']) || [],
    createdDate: (row.createdDate || row.created_date) as string,
    status: (row.status as Campaign['status']) || 'active',
  };
}

const FALLBACK_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_med_01',
    title: 'Urgent Kidney Transplant for 8-Year-Old Zoya in AIIMS Delhi',
    slug: 'kidney-transplant-zoya-aiims',
    category: 'Medical',
    communityId: 'comm_delhi_central',
    communityName: 'Hazrat Nizamuddin Welfare Community',
    city: 'Delhi',
    beneficiaryName: 'Zoya Siddiqui (8 yrs)',
    beneficiaryRelation: 'Father: Imran Siddiqui (Daily wage carpenter)',
    goalINR: 450000,
    raisedINR: 320000,
    donorsCount: 184,
    daysLeft: 8,
    isVerified: true,
    isZakatEligible: true,
    isUrgent: true,
    isPremiumFeatured: true,
    mainImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
    story: 'Little Zoya was diagnosed with end-stage renal disease 4 months ago.',
    documents: [],
    verificationTimeline: [],
    needBreakdown: [],
    createdDate: '15 Jul 2024',
    status: 'active',
  },
  {
    id: 'camp_edu_02',
    title: 'Higher Education Scholarship Fund for 15 Orphan Girls in Bareilly',
    slug: 'orphan-girls-higher-education-bareilly',
    category: 'Education',
    communityId: 'comm_bareilly_rohilkhand',
    communityName: 'Rohilkhand Educational & Nikah Trust',
    city: 'Bareilly',
    beneficiaryName: '15 Student Scholars',
    beneficiaryRelation: 'Care of Bareilly Orphan Care Trust',
    goalINR: 300000,
    raisedINR: 215000,
    donorsCount: 96,
    daysLeft: 14,
    isVerified: true,
    isZakatEligible: true,
    isUrgent: false,
    isPremiumFeatured: true,
    mainImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    story: '15 bright young girls who cleared Class 12 exams need college fee support.',
    documents: [],
    verificationTimeline: [],
    needBreakdown: [],
    createdDate: '10 Jun 2024',
    status: 'active',
  },
];

export async function getCampaigns(filters?: {
  category?: string;
  city?: string;
  zakatOnly?: boolean;
  status?: string;
}): Promise<Campaign[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.zakatOnly) params.append('zakatOnly', 'true');
    if (filters?.status) params.append('status', filters.status);

    const res = await fetch(`/api/campaigns?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    const mapped = (json.data || []).map(mapRow);
    return mapped.length > 0 ? mapped : FALLBACK_CAMPAIGNS;
  } catch (err) {
    console.error('getCampaigns error:', err);
    return FALLBACK_CAMPAIGNS;
  }
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const campaigns = await getCampaigns({ status: 'all' });
  return campaigns.find((c) => c.id === id) || null;
}

export async function createCampaign(campaign: Omit<Campaign, 'id'>): Promise<Campaign> {
  const res = await fetch('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaign),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const json = await res.json();
  if (!json.success && !json.data) throw new Error(json.error || 'Failed to create campaign');
  return mapRow(json.data);
}

export async function updateCampaignRaised(
  id: string,
  addedAmount: number
): Promise<void> {
  await fetch('/api/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      campaignId: id,
      amountINR: addedAmount,
      donorName: 'Anonymous Supporter',
      category: 'General',
      status: 'verified',
    }),
  });
}
