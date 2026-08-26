import { Donation, DonationCategory, UserRole } from '../types';

function mapRow(row: Record<string, unknown>): Donation {
  return {
    id: (row.id as string) || `don_${Date.now()}`,
    transactionId: (row.transactionId || row.transaction_id) as string,
    utrNumber: (row.utrNumber || row.utr_number) as string,
    donorName: (row.donorName || row.donor_name) as string,
    donorId: (row.donorId || row.donor_id) as string,
    donorRole: (row.donorRole || row.donor_role) as UserRole,
    campaignId: (row.campaignId || row.campaign_id) as string,
    campaignTitle: (row.campaignTitle || row.campaign_title) as string,
    communityName: (row.communityName || row.community_name) as string,
    amountINR: Number(row.amountINR ?? row.amount_inr ?? 0),
    category: (row.category as DonationCategory) || 'General',
    isOutsideCommunity: Boolean(row.isOutsideCommunity ?? row.is_outside_community ?? false),
    paymentMethod: ((row.paymentMethod || row.payment_method) as Donation['paymentMethod']) || 'UPI',
    paymentScreenshotUrl: (row.paymentScreenshotUrl || row.payment_screenshot_url) as string | undefined,
    status: ((row.status as Donation['status']) || 'verified'),
    date: (row.date as string) || '',
    receiptNumber: (row.receiptNumber || row.receipt_number) as string,
  };
}

export function getDonationTimestamp(d: Donation | Record<string, unknown>): number {
  const dateStr = (d.date || (d as any).created_at) as string | undefined;
  if (dateStr) {
    const t = new Date(dateStr).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  const idStr = String(d.id || '');
  const match13 = idStr.match(/don_(\d{13})/);
  if (match13) return parseInt(match13[1], 10);
  const match10 = idStr.match(/don_(\d{10})/);
  if (match10) return parseInt(match10[1], 10) * 1000;
  return 0;
}

export function sortDonationsByLatest(donations: Donation[]): Donation[] {
  return [...donations].sort((a, b) => {
    const timeA = getDonationTimestamp(a);
    const timeB = getDonationTimestamp(b);
    return timeB - timeA;
  });
}

export async function getDonations(donorId?: string): Promise<Donation[]> {
  try {
    const params = new URLSearchParams();
    if (donorId) params.append('donorId', donorId);
    const res = await fetch(`/api/donations?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return sortDonationsByLatest((json.data || []).map(mapRow));
  } catch (err) {
    console.warn('getDonations warning:', err);
    return [];
  }
}

export async function getRecentDonations(limit = 10): Promise<Donation[]> {
  try {
    const res = await fetch(`/api/donations?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return sortDonationsByLatest((json.data || []).map(mapRow));
  } catch (err) {
    console.warn('getRecentDonations warning:', err);
    return [];
  }
}

export async function createDonation(donation: Omit<Donation, 'id'>): Promise<Donation> {
  const res = await fetch('/api/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donation),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const json = await res.json();
  if (!json.success && !json.data) throw new Error(json.error || 'Failed to create donation');
  return mapRow(json.data);
}

export async function updateDonationStatus(
  id: string,
  status: Donation['status']
): Promise<void> {
  const res = await fetch('/api/donations', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
}
