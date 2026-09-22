import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';
import { verifyPassword } from '../lib/auth';
import { updateCommunityStats } from './communityService';

function cleanDisplayName(name: string | undefined | null): string {
  if (!name) return '';
  return name.replace(/\s*\([^)]*\)/g, '').trim();
}

const STATUS_OVERRIDES_KEY = 'ngo_user_status_overrides';

function getStatusOverrides(): Record<string, { status?: string; rejectionReason?: string }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STATUS_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStatusOverride(userId: string, data: { status?: string; rejectionReason?: string }) {
  if (typeof window === 'undefined') return;
  try {
    const current = getStatusOverrides();
    current[userId] = {
      ...current[userId],
      ...data,
    };
    localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save local status override:', e);
  }
}

export function extractMissingColumn(error: any): string | null {
  if (!error) return null;
  const msg = [
    error.message,
    error.details,
    error.hint,
    typeof error === 'string' ? error : '',
  ]
    .filter(Boolean)
    .join(' ');

  // 1. PostgREST: Could not find the 'xyz' column of 'users' in the schema cache
  const postgrestMatch = msg.match(/Could not find the '([^']+)' column/i);
  if (postgrestMatch && postgrestMatch[1]) return postgrestMatch[1];

  // 2. PostgREST generic schema cache
  const schemaMatch = msg.match(/Could not find the column '([^']+)'/i);
  if (schemaMatch && schemaMatch[1]) return schemaMatch[1];

  // 3. Postgres relation: column "xyz" of relation "users" does not exist
  const relMatch = msg.match(/column "([^"]+)" of relation/i);
  if (relMatch && relMatch[1]) return relMatch[1];

  // 4. Postgres generic: column "xyz" does not exist
  const colMatch = msg.match(/column "([^"]+)" does not exist/i);
  if (colMatch && colMatch[1]) return colMatch[1];

  // 5. Dot notation: column users.xyz does not exist
  const dotMatch = msg.match(/column [a-zA-Z0-9_]+\.([a-zA-Z0-9_]+) does not exist/i);
  if (dotMatch && dotMatch[1]) return dotMatch[1];

  return null;
}

function mapRow(row: Record<string, unknown>): User {
  const overrides = getStatusOverrides();
  const override = overrides[row.id as string];

  const rawStatus = ((row.status as string) || override?.status)?.toLowerCase();
  let userStatus: 'pending' | 'approved' | 'reject' | 'rejected' = 'pending';
  if (rawStatus === 'approved' || rawStatus === 'approve') {
    userStatus = 'approved';
  } else if (rawStatus === 'reject') {
    userStatus = 'reject';
  } else if (rawStatus === 'rejected') {
    userStatus = 'rejected';
  } else if (rawStatus === 'pending') {
    userStatus = 'pending';
  } else if (row.is_verified === true) {
    userStatus = 'approved';
  } else {
    userStatus = 'pending';
  }

  const effectiveRejectionReason =
    (row.rejection_reason || row.rejectionReason) as string | undefined ||
    override?.rejectionReason;

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
    status: userStatus,
    isVerified: userStatus === 'approved',
    rejectionReason: effectiveRejectionReason,
    rejection_reason: effectiveRejectionReason,
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
      query = query.or(`city.ilike.%${communityIdOrDistrict}%,district.ilike.%${communityIdOrDistrict}%`);
    }
  }
  if (district && district !== 'all') {
    query = query.or(`district.ilike.%${district}%,city.ilike.%${district}%`);
  }
  const { data, error } = await query;
  if (error) {
    // Fallback if PostgREST OR syntax has issues on specific schemas
    let fallbackQuery = supabase.from('users').select('*').order('created_at', { ascending: false });
    if (communityIdOrDistrict && communityIdOrDistrict !== 'all') {
      if (communityIdOrDistrict.startsWith('comm_')) {
        fallbackQuery = fallbackQuery.eq('community_id', communityIdOrDistrict);
      } else {
        fallbackQuery = fallbackQuery.eq('city', communityIdOrDistrict);
      }
    }
    if (district && district !== 'all') {
      fallbackQuery = fallbackQuery.eq('district', district);
    }
    const { data: fbData, error: fbError } = await fallbackQuery;
    if (fbError) throw fbError;
    return (fbData ?? []).map(mapRow);
  }
  return (data ?? []).map(mapRow);
}

export async function createUser(user: User & { aadhaarFrontUrl?: string; aadhaarBackUrl?: string }): Promise<User> {
  const initialStatus = user.status || (user.isVerified ? 'approved' : 'pending');
  const payload: Record<string, unknown> = {
    id: user.id,
    name: user.name,
    email: (user.email ?? '').trim().toLowerCase(),
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    community_id: user.communityId,
    community_name: user.communityName,
    membership_id: user.membershipId,
    status: initialStatus,
    is_verified: initialStatus === 'approved',
    rejection_reason: user.rejectionReason || user.rejection_reason || null,
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

  let currentPayload = { ...payload };
  let insertResult = null;
  let lastError: any = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from('users')
      .insert(currentPayload)
      .select('*')
      .maybeSingle();

    if (!error && data) {
      insertResult = data;
      break;
    }

    if (error && (error as { code?: string }).code === 'PGRST116') {
      break;
    }

    lastError = error;
    const missingCol = extractMissingColumn(error);
    if (missingCol && currentPayload[missingCol] !== undefined) {
      delete currentPayload[missingCol];
      continue;
    }
    break;
  }

  // Database error (ignore PGRST116 if thrown)
  if (!insertResult && lastError && (lastError as { code?: string }).code !== 'PGRST116') {
    console.error('Failed to create user:', lastError.message || lastError);
    throw lastError;
  }

  const createdUser = insertResult ? mapRow(insertResult) : user;

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
  if (patch.status !== undefined) {
    update.status = patch.status;
    update.is_verified = patch.status === 'approved';
  } else if (patch.isVerified !== undefined) {
    update.status = patch.isVerified ? 'approved' : 'reject';
    update.is_verified = patch.isVerified;
  }
  if (patch.rejectionReason !== undefined || patch.rejection_reason !== undefined) {
    update.rejection_reason = patch.rejectionReason ?? patch.rejection_reason ?? null;
  }

  // Save to local cache so UI remains fully consistent even if DB schema lacks these columns
  if (patch.status !== undefined || patch.rejectionReason !== undefined || patch.rejection_reason !== undefined) {
    saveStatusOverride(id, {
      status: patch.status,
      rejectionReason: patch.rejectionReason ?? patch.rejection_reason,
    });
  }

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

  let updatePayload = { ...update };
  let updateResult = null;
  let lastError: any = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (!error && data) {
      updateResult = data;
      break;
    }

    if (error && (error as { code?: string }).code === 'PGRST116') {
      break;
    }

    lastError = error;
    const missingCol = extractMissingColumn(error);
    if (missingCol && updatePayload[missingCol] !== undefined) {
      delete updatePayload[missingCol];
      continue;
    }

    break;
  }

  if (!updateResult && lastError && (lastError as { code?: string }).code !== 'PGRST116') {
    console.error('Failed to update user:', lastError.message || lastError);
    throw lastError;
  }

  const effectiveReason = patch.rejectionReason ?? patch.rejection_reason;
  if (updateResult) {
    const mapped = mapRow(updateResult);
    return {
      ...mapped,
      status: patch.status ?? mapped.status,
      isVerified: patch.status ? patch.status === 'approved' : mapped.isVerified,
      rejectionReason: effectiveReason !== undefined ? effectiveReason : mapped.rejectionReason,
      rejection_reason: effectiveReason !== undefined ? effectiveReason : mapped.rejection_reason,
    };
  }
  return {
    id,
    ...patch,
    status: patch.status ?? 'pending',
    isVerified: patch.status === 'approved',
    rejectionReason: effectiveReason,
    rejection_reason: effectiveReason,
  } as User;
}

export async function getUnverifiedUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or('is_verified.eq.false,status.eq.pending')
      .order('created_at', { ascending: false });
    if (!error && data) return data.map(mapRow);
  } catch {
    // Fallback if status column does not exist in schema cache
  }

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