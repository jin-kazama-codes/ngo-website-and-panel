import { Campaign, DonationCategory } from '../types';

function mapRow(row: Record<string, unknown>): Campaign {
  const rawMainImage = (row.mainImage || row.main_image || '') as string;
  const splitImages = rawMainImage ? rawMainImage.split(',') : [];

  return {
    id: (row.id as string) || `camp_${Date.now()}`,
    title: (row.title as string) || '',
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
    mainImage: splitImages[0] || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    galleryImages: splitImages.slice(1) || [],
    story: (row.story as string) || '',
    documents: ((row.documents ?? row.documents) as Campaign['documents']) || [],
    createdDate: (row.createdDate || row.created_date) as string,
    createdBy: (row.createdBy || row.created_by) as string,
    status: row.status === 'approved' ? 'active' : row.status === 'pending' ? 'pending_approval' : (row.status as Campaign['status']) || 'active',
  };
}

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
    return mapped;
  } catch (err) {
    console.error('getCampaigns error:', err);
    return [];
  }
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const [campaigns, emergencyCampaigns] = await Promise.all([
    getCampaigns({ status: 'all' }),
    getEmergencyCampaigns({ status: 'all' })
  ]);
  const allCampaigns = [...campaigns, ...emergencyCampaigns];
  return allCampaigns.find((c) => c.id === id) || null;
}

export async function getEmergencyCampaigns(filters?: { status?: string }): Promise<Campaign[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);

    const url = `/api/emergency-campaigns${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    const data = json.data || [];

    return data.map(mapEmergencyRow);
  } catch (err) {
    console.error('getEmergencyCampaigns error:', err);
    return [];
  }
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
  if (json.warning) throw new Error(json.warning);
  return mapRow(json.data);
}
export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
  const payload = { id, ...updates };
  const res = await fetch('/api/campaigns', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const json = await res.json();
  if (!json.success && !json.data) throw new Error(json.error || 'Failed to update campaign');
  if (json.warning) throw new Error(json.warning);
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

export async function updateCampaignStatus(
  id: string,
  status: string,
  isVerified: boolean
): Promise<Campaign> {
  let url = '/api/campaigns';
  let cleanId = id;
  let isEmergency = false;

  if (id.startsWith('emergency_')) {
    url = '/api/emergency-campaigns';
    cleanId = id.replace('emergency_', '');
    isEmergency = true;

    // Map active back to approved for emergency requests
    if (status === 'active') status = 'approved';
    if (status === 'rejected') status = 'rejected';
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: cleanId, status, is_verified: isVerified }),
  });

  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const json = await res.json();
  if (!json.success && !json.data) throw new Error(json.error || 'Failed to update campaign');
  if (json.warning) throw new Error(json.warning);

  return isEmergency ? mapEmergencyRow(json.data) : mapRow(json.data);
}

function mapEmergencyRow(row: any): Campaign {
  const rawMainImage = (row.mainImage || row.main_image || '') as string;
  const splitImages = rawMainImage ? rawMainImage.split(',') : [];

  return {
    id: `emergency_${row.id}`,
    title: row.description?.slice(0, 50) || `Emergency: ${row.aid_category}`,
    category: 'Emergency Relief',
    communityId: row.community_id,
    communityName: row.community_name,
    city: '',
    beneficiaryName: row.member_name,
    beneficiaryRelation: 'Self',
    goalINR: row.estimated_amount_inr || 0,
    raisedINR: 0,
    donorsCount: 0,
    daysLeft: 7,
    isVerified: row.status === 'approved',
    isZakatEligible: true,
    isUrgent: true,
    mainImage: splitImages[0],
    galleryImages: splitImages.slice(1) || [],
    story: row.description || '',
    documents: [],
    createdBy: row.member_id,
    createdDate: row.created_at || new Date().toISOString(),
    status: row.status === 'approved' ? 'active' : row.status === 'pending' ? 'pending_approval' : row.status
  };
}

export async function deleteCampaign(id: string): Promise<void> {
  const isEmergency = id.startsWith('emergency_');

  if (isEmergency) {
    // Currently no DELETE for emergency campaigns API, so let's mock it or just return
    return Promise.resolve();
  }

  const res = await fetch(`/api/campaigns?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete campaign');
}
