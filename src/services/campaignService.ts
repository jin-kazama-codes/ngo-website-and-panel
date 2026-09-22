import { Campaign, DonationCategory } from '../types';

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Medical: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
  Food: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
  Education: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
  Marriage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  Janazah: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  Emergency: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
  'Emergency Relief': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
};

export function getCategoryFallbackImage(category?: string): string {
  if (!category) return CATEGORY_FALLBACK_IMAGES.Medical;
  return CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.Medical;
}

const NUMBER_WORDS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

export function formatImagesToJsonb(urls: unknown): Record<string, string> {
  let list: string[] = [];
  if (Array.isArray(urls)) {
    list = urls.map(String).map(s => s.trim()).filter(Boolean);
  } else if (urls && typeof urls === 'object') {
    list = Object.values(urls as Record<string, unknown>).map(String).map(s => s.trim()).filter(Boolean);
  } else if (typeof urls === 'string' && urls.trim()) {
    list = urls.split(',').map(s => s.trim()).filter(Boolean);
  }
  const obj: Record<string, string> = {};
  list.forEach((url, index) => {
    const key = index < NUMBER_WORDS.length ? `${NUMBER_WORDS[index]}_image` : `image_${index + 1}`;
    obj[key] = url;
  });
  return obj;
}

export function extractImages(row: Record<string, unknown>): { mainImage: string; galleryImages: string[] } {
  const raw = row.mainImage || row.main_image;
  let list: string[] = [];

  const parseItem = (val: unknown): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) {
      return val.flatMap(parseItem);
    }
    if (typeof val === 'object') {
      return Object.values(val as Record<string, unknown>).flatMap(parseItem);
    }
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed || trimmed === '[object Object]') return [];
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          return parseItem(parsed);
        } catch {
          return trimmed.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  list = parseItem(raw);

  const rawGallery = row.galleryImages || row.gallery_images;
  if (rawGallery) {
    list = [...list, ...parseItem(rawGallery)];
  }

  // Filter out unreachable local mobile schemes and invalid paths
  const cleaned = list.filter(url => typeof url === 'string' && url.length > 5 && !url.startsWith('file://') && !url.startsWith('content://') && !url.startsWith('ph://'));

  const unique = Array.from(new Set(cleaned));
  const category = (row.category as string) || 'Medical';
  const defaultImage = getCategoryFallbackImage(category);
  const mainImage = unique[0] || defaultImage;
  const galleryImages = unique.slice(1);
  return { mainImage, galleryImages };
}

export function calculateDaysLeft(row: Record<string, unknown>): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Dynamic calculation from end_date or endDate
  const endDateVal = (row.end_date || row.endDate) as string | undefined;
  if (endDateVal) {
    const end = new Date(endDateVal);
    if (!isNaN(end.getTime())) {
      end.setHours(0, 0, 0, 0);
      const diffMs = end.getTime() - today.getTime();
      return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }
  }

  // 2. Dynamic calculation from created_date / created_at + static days
  const createdDateVal = (row.created_at || row.created_date || row.createdDate) as string | undefined;
  const staticDays = Number(row.days_left ?? row.daysLeft);
  if (createdDateVal && !isNaN(staticDays) && staticDays > 0) {
    const created = new Date(createdDateVal);
    if (!isNaN(created.getTime())) {
      const end = new Date(created);
      end.setDate(end.getDate() + staticDays);
      end.setHours(0, 0, 0, 0);
      const diffMs = end.getTime() - today.getTime();
      return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }
  }

  // 3. Fallback to static number if present and valid
  if (!isNaN(staticDays) && staticDays >= 0) {
    return staticDays;
  }

  return 30;
}

function mapRow(row: Record<string, unknown>): Campaign {
  const { mainImage, galleryImages } = extractImages(row);

  const rawDocs = ((row.documents ?? row.documents) as any[]) || [];
  const metaDoc = Array.isArray(rawDocs) ? rawDocs.find((d: any) => d && d.title === '__meta__') : null;
  const cleanDocs = Array.isArray(rawDocs) ? rawDocs.filter((d: any) => d && d.title !== '__meta__') : [];

  const createdBy = (row.created_by || row.createdBy || metaDoc?.created_by || 'admin') as string;
  const createdDate = (
    row.createdDate ||
    row.created_date ||
    metaDoc?.created_date ||
    (row.created_at
      ? new Date(row.created_at as string).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }))
  ) as string;

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
    daysLeft: calculateDaysLeft(row),
    endDate: (row.end_date || row.endDate) as string | undefined,
    end_date: (row.end_date || row.endDate) as string | undefined,
    isVerified: Boolean(row.isVerified ?? row.is_verified ?? true),
    isZakatEligible: Boolean(row.isZakatEligible ?? row.is_zakat_eligible ?? false),
    isSadqaEligible: Boolean(row.isSadqaEligible || row.is_sadqa_eligible || row.is_sadaqah_eligible),
    isFitrahEligible: Boolean(row.isFitrahEligible || row.is_fitrah_eligible || row.is_fitra_eligible),
    isUrgent: Boolean(row.isUrgent ?? row.is_urgent ?? false),
    mainImage,
    galleryImages,
    story: (row.story as string) || '',
    documents: cleanDocs,
    createdDate,
    createdBy,
    status: row.status === 'approved' ? 'active' : row.status === 'pending' ? 'pending_approval' : (row.status as Campaign['status']) || 'active',
  };
}

export function getCampaignTimestamp(c: Campaign | Record<string, unknown>): number {
  const dateStr = (c.createdDate || (c as any).created_at || (c as any).created_date) as string | undefined;
  if (dateStr) {
    const t = new Date(dateStr).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  const idStr = String(c.id || '');
  const match13 = idStr.match(/camp_(\d{13})/);
  if (match13) return parseInt(match13[1], 10);
  const match10 = idStr.match(/camp_(\d{10})/);
  if (match10) return parseInt(match10[1], 10) * 1000;
  return 0;
}

export function sortCampaignsByLatest(campaigns: Campaign[]): Campaign[] {
  return [...campaigns].sort((a, b) => {
    const timeA = getCampaignTimestamp(a);
    const timeB = getCampaignTimestamp(b);
    return timeB - timeA;
  });
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
    return sortCampaignsByLatest(mapped);
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
  const { mainImage, galleryImages } = extractImages(row);

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
    mainImage,
    galleryImages,
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
