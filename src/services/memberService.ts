import { MemberNominee, MemberBankDetails, FemaleFamilyMember } from '../types';

// ─── MEMBER NOMINEE SERVICE (DIRECT API) ───────────────────────────────────────

export async function getMemberNominees(userId: string): Promise<MemberNominee[]> {
  const res = await fetch(`/api/member-nominee?userId=${encodeURIComponent(userId)}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Failed to fetch nominee details (${res.status})`);
  }
  return json.data || [];
}

export async function saveMemberNominee(
  data: Omit<MemberNominee, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<MemberNominee> {
  const res = await fetch('/api/member-nominee', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Failed to save nominee (${res.status})`);
  }
  return json.data;
}

export async function updateMemberNominee(
  id: string,
  updates: Partial<MemberNominee>
): Promise<MemberNominee> {
  const res = await fetch('/api/member-nominee', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Failed to update nominee (${res.status})`);
  }
  return json.data;
}

export async function deleteMemberNominee(id: string): Promise<void> {
  const res = await fetch(`/api/member-nominee?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Failed to delete nominee (${res.status})`);
  }
}

// ─── MEMBER BANK DETAILS SERVICE (DIRECT API) ──────────────────────────────────

export async function getMemberBankDetails(userId: string): Promise<MemberBankDetails[]> {
  const res = await fetch(`/api/member-bank-details?userId=${encodeURIComponent(userId)}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Failed to fetch member bank details (${res.status})`);
  }
  return json.data || [];
}

export async function saveMemberBankDetails(
  data: Omit<MemberBankDetails, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<MemberBankDetails> {
  const res = await fetch('/api/member-bank-details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Failed to save bank details (${res.status})`);
  }
  return json.data;
}

export async function updateMemberBankDetails(
  id: string,
  updates: Partial<MemberBankDetails>
): Promise<MemberBankDetails> {
  const res = await fetch('/api/member-bank-details', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Failed to update bank details (${res.status})`);
  }
  return json.data;
}

export async function deleteMemberBankDetails(id: string): Promise<void> {
  const res = await fetch(`/api/member-bank-details?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Failed to delete bank details (${res.status})`);
  }
}

// ─── FEMALE FAMILY MEMBER SERVICE (DIRECT API) ────────────────────────────────

export async function getFemaleFamilyMembers(userId?: string): Promise<FemaleFamilyMember[]> {
  const url = userId
    ? `/api/female-members?userId=${encodeURIComponent(userId)}`
    : '/api/female-members';
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Failed to fetch female members (${res.status})`);
  }
  return json.data || [];
}

export async function saveFemaleFamilyMember(
  data: Omit<FemaleFamilyMember, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<FemaleFamilyMember> {
  const res = await fetch('/api/female-members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Failed to save female member (${res.status})`);
  }
  return json.data;
}

export async function updateFemaleFamilyMember(
  id: string,
  updates: Partial<FemaleFamilyMember>
): Promise<FemaleFamilyMember> {
  const res = await fetch('/api/female-members', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Failed to update female member (${res.status})`);
  }
  return json.data;
}

export async function deleteFemaleFamilyMember(id: string): Promise<void> {
  const res = await fetch(`/api/female-members?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Failed to delete female member (${res.status})`);
  }
}
