import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';
import { verifyPassword } from '../lib/auth';
import { updateCommunityStats } from './communityService';

function mapRow(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string,
    role: (row.role as string)?.replace(' ', '_') as UserRole,
    avatar: row.avatar as string,
    communityId: row.community_id as string,
    communityName: row.community_name as string,
    membershipId: row.membership_id as string,
    isVerified: row.is_verified as boolean,
    isPremium: row.is_premium as boolean,
    joinDate: row.join_date as string,
    city: row.city as string,
    state: row.state as string,
    passwordHash: (row.password || row.password_hash || row.passwordHash) as string | undefined,
    documentUrl: (row.document_url || row.kyc_document_url) as string | undefined,
    paymentMethod: row.payment_method as string,
    paymentUtr: row.payment_utr as string,
    paymentScreenshotUrl: row.payment_screenshot_url as string,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) return null;
  return mapRow(data);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase.from('users').select('*').eq('email', email.trim().toLowerCase()).single();
  if (error || !data) return null;
  return mapRow(data);
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const { data, error } = await supabase.from('users').select('*').eq('phone', phone.trim()).single();
  if (error || !data) return null;
  return mapRow(data);
}

export async function getUsers(communityId?: string): Promise<User[]> {
  try {
    const url = communityId ? `/api/users?communityId=${encodeURIComponent(communityId)}` : '/api/users';
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data.map(mapRow);
      }
    }
  } catch (err) {
    console.warn('API fetch users failed, using client fallback:', err);
  }

  let query = supabase.from('users').select('*').order('created_at', { ascending: false });
  if (communityId) query = query.eq('community_id', communityId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function createUser(user: User & { kycDocumentUrl?: string }): Promise<User> {
  const payload = {
    id: user.id,
    name: user.name,
    email: (user.email ?? '').trim().toLowerCase(),
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    communityId: user.communityId,
    communityName: user.communityName,
    membershipId: user.membershipId,
    isVerified: user.isVerified,
    isPremium: user.isPremium,
    joinDate: user.joinDate,
    city: user.city,
    state: user.state,
    kycDocumentUrl: user.kycDocumentUrl || user.documentUrl,
    passwordHash: user.passwordHash,
    paymentMethod: user.paymentMethod,
    paymentUtr: user.paymentUtr,
    paymentScreenshotUrl: user.paymentScreenshotUrl,
  };

  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to create user');
  }

  const json = await res.json();
  const createdUser = json.data ? mapRow(json.data) : user;

  if (createdUser.communityId) {
    try {
      const { data: comm } = await supabase
        .from('communities')
        .select('total_members')
        .eq('id', createdUser.communityId)
        .single();

      if (comm) {
        await updateCommunityStats(createdUser.communityId, {
          totalMembers: (comm.total_members || 0) + 1,
        });
      }
    } catch (cErr) {
      console.warn('Failed to increment community member count:', cErr);
    }
  }

  return createdUser;
}

export async function authenticateUser(identifier: string, plainPassword: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const user = identifier.includes('@') ? await getUserByEmail(identifier) : await getUserByPhone(identifier);
    if (!user) {
      return { success: false, error: 'User account not found. Please register first.' };
    }
    if (user.passwordHash) {
      const isValid = await verifyPassword(plainPassword, user.passwordHash);
      if (!isValid) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
    }
    return { success: true, user };
  } catch (err) {
    console.error('authenticateUser error:', err);
    return { success: false, error: 'Authentication failed.' };
  }
}

export async function updateUser(id: string, patch: Partial<User>): Promise<void> {
  const update: Record<string, unknown> = {};
  if (patch.isVerified !== undefined) update.is_verified = patch.isVerified;
  if (patch.avatar !== undefined) update.avatar = patch.avatar;
  if (patch.role !== undefined) update.role = patch.role;
  if (patch.communityId !== undefined) update.community_id = patch.communityId;
  if (patch.communityName !== undefined) update.community_name = patch.communityName;
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.email !== undefined) update.email = patch.email;
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.city !== undefined) update.city = patch.city;
  if (patch.state !== undefined) update.state = patch.state;
  if (patch.documentUrl !== undefined) update.document_url = patch.documentUrl;
  if (patch.paymentUtr !== undefined) update.payment_utr = patch.paymentUtr;
  if (patch.paymentScreenshotUrl !== undefined) update.payment_screenshot_url = patch.paymentScreenshotUrl;
  if (patch.passwordHash !== undefined) {
    update.password = patch.passwordHash;
    update.password_hash = patch.passwordHash;
  }

  const res = await fetch('/api/users', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...update }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update user');
  }
}

export async function getUnverifiedUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_verified', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/users?id=${id}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete user');
  }
}
