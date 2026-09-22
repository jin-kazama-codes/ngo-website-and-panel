import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';
import { verifyPassword } from '../lib/auth';
import { updateCommunityStats } from './communityService';

function cleanDisplayName(name: string | undefined | null): string {
  if (!name) return '';
  return name.replace(/\s*\([^)]*\)/g, '').trim();
}

function mapRow(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: cleanDisplayName(row.name as string),
    email: row.email as string,
    phone: row.phone as string,
    role: (row.role as string)?.replace(' ', '_') as UserRole,
    avatar: row.avatar as string,
    communityId: row.community_id as string,
    communityName: row.community_name as string,
    membershipId: row.membership_id as string,
    isVerified: row.is_verified as boolean,
    joinDate: row.join_date as string,
    city: row.city as string,
    district: (row.district as string) || undefined,
    districtRole: (row.district_role || row.districtRole) as string | undefined,
    district_role: (row.district_role || row.districtRole) as string | undefined,
    state: row.state as string,
    address: (row.address || row.adderess || row.full_address) as string | undefined,
    passwordHash: (row.password || row.password_hash || row.passwordHash) as string | undefined,
    aadhaarFrontUrl: (row.aadhaar_front_url || row.aadhaarFrontUrl) as string | undefined,
    aadhaarBackUrl: (row.aadhaar_back_url || row.aadhaarBackUrl) as string | undefined,
    paymentMethod: row.payment_method as string,
    paymentUtr: row.payment_utr as string,
    paymentScreenshotUrl: row.payment_screenshot_url as string,
    religion: (row.religion || row.dharam) as string | undefined,
    isMalikENisab: (row.is_malik_e_nisab ?? row.isMalikENisab) as boolean | undefined,
    helpType: (row.help_type || row.helpType) as string | undefined,
    helpDetails: (row.help_details || row.helpDetails) as string | undefined,
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

export async function getUsers(communityIdOrDistrict?: string, district?: string): Promise<User[]> {
  let query = supabase.from('users').select('*').order('created_at', { ascending: false });
  if (communityIdOrDistrict && communityIdOrDistrict !== 'all') {
    if (communityIdOrDistrict.startsWith('comm_')) {
      query = query.eq('community_id', communityIdOrDistrict);
    } else {
      query = query.eq('city', communityIdOrDistrict);
    }
  }
  if (district && district !== 'all') {
    query = query.eq('district', district);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function createUser(user: User & { aadhaarFrontUrl?: string; aadhaarBackUrl?: string }): Promise<User> {
  const payload = {
    id: user.id,
    name: user.name,
    email: (user.email ?? '').trim().toLowerCase(),
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    community_id: user.communityId,
    community_name: user.communityName,
    membership_id: user.membershipId,
    is_verified: user.isVerified,
    join_date: user.joinDate,
    city: user.city,
    district: user.district,
    district_role: user.districtRole || user.district_role,
    state: user.state,
    address: user.address,
    aadhaar_front_url: user.aadhaarFrontUrl,
    aadhaar_back_url: user.aadhaarBackUrl,
    password: user.passwordHash,
    payment_method: user.paymentMethod,
    payment_utr: user.paymentUtr,
    payment_screenshot_url: user.paymentScreenshotUrl,
    religion: user.religion,
    is_malik_e_nisab: user.isMalikENisab,
    help_type: user.helpType,
    help_details: user.helpDetails,
  };

  // Use maybeSingle() so that if Supabase RLS prevents anon users from SELECTing newly created rows,
  // it won't throw PGRST116 (which falsely triggers UI errors even though the row was saved in the database).
  const { data, error } = await supabase
    .from('users')
    .insert(payload)
    .select('*')
    .maybeSingle();

  // Database error (ignore PGRST116 if thrown)
  if (error && (error as { code?: string }).code !== 'PGRST116') {
    console.error('Failed to create user:', error.message || error);
    throw error;
  }

  const createdUser = data ? mapRow(data) : user;

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

export async function updateUser(id: string, patch: Partial<User>): Promise<User> {
  const update: Record<string, unknown> = {};
  if (patch.isVerified !== undefined) update.is_verified = patch.isVerified;
  if (patch.avatar !== undefined) update.avatar = patch.avatar;
  if (patch.role !== undefined) update.role = patch.role;
  if (patch.district !== undefined) update.district = patch.district || null;
  if (patch.districtRole !== undefined) update.district_role = patch.districtRole || null;
  if (patch.district_role !== undefined) update.district_role = patch.district_role || null;
  if (patch.communityId !== undefined) update.community_id = patch.communityId;
  if (patch.communityName !== undefined) update.community_name = patch.communityName;
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.email !== undefined) update.email = patch.email;
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.city !== undefined) update.city = patch.city;
  if (patch.state !== undefined) update.state = patch.state;
  if (patch.aadhaarFrontUrl !== undefined) update.aadhaar_front_url = patch.aadhaarFrontUrl;
  if (patch.aadhaarBackUrl !== undefined) update.aadhaar_back_url = patch.aadhaarBackUrl;
  if (patch.paymentMethod !== undefined) update.payment_method = patch.paymentMethod;
  if (patch.paymentUtr !== undefined) update.payment_utr = patch.paymentUtr;
  if (patch.paymentScreenshotUrl !== undefined) update.payment_screenshot_url = patch.paymentScreenshotUrl;
  if (patch.religion !== undefined) update.religion = patch.religion;
  if (patch.isMalikENisab !== undefined) update.is_malik_e_nisab = patch.isMalikENisab;
  if (patch.helpType !== undefined) update.help_type = patch.helpType;
  if (patch.helpDetails !== undefined) update.help_details = patch.helpDetails;
  if (patch.passwordHash !== undefined) {
    update.password = patch.passwordHash;
    update.password_hash = patch.passwordHash;
  }

  const { data, error } = await supabase
    .from('users')
    .update(update)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error && (error as { code?: string }).code !== 'PGRST116') {
    console.error('Failed to update user:', error.message || error);
    throw error;
  }
  if (data) {
    return mapRow(data);
  }
  return { id, ...patch } as User;
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
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete user:', error);
      throw new Error(error.message || 'Failed to delete user');
    }
  } catch (err) {
    console.error('deleteUser error:', err);
    throw err;
  }
}