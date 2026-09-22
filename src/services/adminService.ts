import { supabase } from '../lib/supabase';
import { PendingVerificationItem, AuditLog, UserRole } from '../types';

// ─── Pending Verifications ────────────────────────────────────────────────────
function mapVerification(row: Record<string, unknown>): PendingVerificationItem {
  return {
    id: (row.id as string) || `ver_${Date.now()}`,
    type: (row.type as PendingVerificationItem['type']) || 'campaign',
    title: (row.title as string) || '',
    submittedBy: (row.submittedBy || row.submitted_by) as string,
    date: (row.date as string) || '',
    status: ((row.status as PendingVerificationItem['status']) || 'pending'),
    details: (row.details as string) || '',
    documentUrl: (row.documentUrl || row.document_url) as string | undefined,
    amountINR: row.amountINR !== undefined ? Number(row.amountINR) : (row.amount_inr !== undefined ? Number(row.amount_inr) : undefined),
    utr: (row.utr as string) || undefined,
  };
}

export async function getPendingVerifications(): Promise<PendingVerificationItem[]> {
  try {
    const res = await fetch('/api/verifications');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return (json.data || []).map(mapVerification);
  } catch (err) {
    console.error('getPendingVerifications error:', err);
    return [];
  }
}

export async function createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
  try {
    await supabase.from('audit_logs').insert([{
      action: log.action,
      performed_by: log.performedBy,
      role: log.role,
      details: log.details,
      ip_address: log.ipAddress,
      timestamp: new Date().toISOString(),
    }]);
  } catch (err) {
    console.warn('Audit log insert failed:', err);
  }
}

export async function approveVerification(id: string, reviewerName: string): Promise<void> {
  await fetch('/api/verifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, action: 'approve', reviewerName }),
  });
  await createAuditLog({
    action: 'Verification Approved',
    performedBy: reviewerName,
    role: 'executive_admin',
    details: `Approved verification item #${id}`,
    ipAddress: 'system',
  });
}

export async function rejectVerification(id: string, reviewerName: string): Promise<void> {
  await fetch('/api/verifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, action: 'reject', reviewerName }),
  });
  await createAuditLog({
    action: 'Verification Rejected',
    performedBy: reviewerName,
    role: 'executive_admin',
    details: `Rejected verification item #${id}`,
    ipAddress: 'system',
  });
}

// ─── Announcements ────────────────────────────────────────────────────────────
export async function broadcastAnnouncement(ann: {
  communityId: string;
  communityName: string;
  sentBy: string;
  message: string;
  channel?: string;
}): Promise<void> {
  const { error } = await supabase.from('announcements').insert({
    community_id: ann.communityId,
    community_name: ann.communityName,
    sent_by: ann.sentBy,
    message: ann.message,
    channel: ann.channel ?? 'both',
  });
  if (error) throw error;
}

// ─── User Badges ──────────────────────────────────────────────────────────────
export interface UserBadge {
  id: string;
  userId: string;
  badgeName: string;
  badgeDescription: string;
  badgeType: 'gold' | 'emerald' | 'blue';
  awardedAt: string;
}

function mapBadge(row: Record<string, unknown>): UserBadge {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    badgeName: row.badge_name as string,
    badgeDescription: row.badge_description as string,
    badgeType: row.badge_type as UserBadge['badgeType'],
    awardedAt: row.awarded_at as string,
  };
}

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBadge);
}

// ─── Monthly Donation Stats ───────────────────────────────────────────────────
export interface MonthlyDonationStat {
  month: string;
  year: number;
  amount: number;
}

export async function getMonthlyDonationStats(userId: string): Promise<MonthlyDonationStat[]> {
  const { data, error } = await supabase
    .from('monthly_donation_stats')
    .select('month, year, amount_inr')
    .eq('user_id', userId)
    .order('year', { ascending: true })
    .order('month', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    month: row.month as string,
    year: row.year as number,
    amount: row.amount_inr as number,
  }));
}

// ─── Account Details ──────────────────────────────────────────────────────────
import { AccountDetails } from '../types';

export async function getAccountDetails(): Promise<AccountDetails[]> {
  try {
    const res = await fetch('/api/account-details');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('getAccountDetails error:', err);
    return [];
  }
}

export async function createAccountDetails(details: Omit<AccountDetails, 'id' | 'created_at' | 'updated_at'>): Promise<AccountDetails> {
  const res = await fetch('/api/account-details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to create account details');
  return json.data;
}

export async function updateAccountDetails(details: Partial<AccountDetails> & { id: string }): Promise<AccountDetails> {
  const res = await fetch('/api/account-details', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update account details');
  return json.data;
}

export async function deleteAccountDetails(id: string): Promise<void> {
  const res = await fetch(`/api/account-details?id=${id}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete account details');
}
