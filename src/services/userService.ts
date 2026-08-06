import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';
import { verifyPassword } from '../lib/auth';

function mapRow(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string,
    role: row.role as UserRole,
    avatar: row.avatar as string,
    communityId: row.community_id as string,
    communityName: row.community_name as string,
    membershipId: row.membership_id as string,
    isVerified: row.is_verified as boolean,
    isPremium: row.is_premium as boolean,
    joinDate: row.join_date as string,
    city: row.city as string,
    state: row.state as string,
    totalDonatedINR: row.total_donated_inr as number,
    donationsCount: row.donations_count as number,
    lifeImpactScore: row.life_impact_score as number | undefined,
    familiesHelped: row.families_helped as number | undefined,
    hasanatCounter: row.hasanat_counter as number | undefined,
    givingStreakMonths: row.giving_streak_months as number | undefined,
    communityRank: row.community_rank as number | undefined,
    passwordHash: (row.password || row.password_hash || row.passwordHash) as string | undefined,
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

export async function getUsers(communityId?: string): Promise<User[]> {
  let query = supabase.from('users').select('*').order('created_at', { ascending: false });
  if (communityId) query = query.eq('community_id', communityId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function createUser(user: User & { kycDocumentUrl?: string }): Promise<User> {
  const insertPayload: Record<string, unknown> = {
    id: user.id,
    name: user.name,
    email: user.email.trim().toLowerCase(),
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    community_id: user.communityId,
    community_name: user.communityName,
    membership_id: user.membershipId,
    is_verified: user.isVerified,
    is_premium: user.isPremium,
    join_date: user.joinDate,
    city: user.city,
    state: user.state,
    total_donated_inr: user.totalDonatedINR,
    donations_count: user.donationsCount,
    kyc_document_url: user.kycDocumentUrl ?? null,
    password: user.passwordHash ?? null,
  };

  try {
    const { data, error } = await supabase
      .from('users')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase user insert error:', error.message, error.details);
      // Try essential payload if optional columns differ
      const essentialPayload = {
        id: user.id,
        name: user.name,
        email: user.email.trim().toLowerCase(),
        phone: user.phone,
        role: user.role,
        community_id: user.communityId,
        community_name: user.communityName,
        membership_id: user.membershipId,
        is_verified: user.isVerified,
        city: user.city,
        state: user.state,
        password: user.passwordHash ?? null,
      };
      const { data: retryData, error: retryError } = await supabase
        .from('users')
        .insert(essentialPayload)
        .select()
        .single();
      if (!retryError && retryData) {
        return mapRow(retryData);
      }
      return user;
    }
    return mapRow(data);
  } catch (err) {
    console.error('Supabase createUser exception:', err);
    return user;
  }
}

export async function authenticateUser(email: string, plainPassword: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const user = await getUserByEmail(email);
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
  if (patch.totalDonatedINR !== undefined) update.total_donated_inr = patch.totalDonatedINR;
  if (patch.donationsCount !== undefined) update.donations_count = patch.donationsCount;
  if (patch.isVerified !== undefined) update.is_verified = patch.isVerified;
  if (patch.avatar !== undefined) update.avatar = patch.avatar;
  if (patch.givingStreakMonths !== undefined) update.giving_streak_months = patch.givingStreakMonths;
  if (patch.hasanatCounter !== undefined) update.hasanat_counter = patch.hasanatCounter;
  if (patch.passwordHash !== undefined) {
    update.password = patch.passwordHash;
    update.password_hash = patch.passwordHash;
  }
  const { error } = await supabase.from('users').update(update).eq('id', id);
  if (error) throw error;
}
