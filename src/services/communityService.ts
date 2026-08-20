import { Community } from '../types';

function mapRow(row: Record<string, unknown>): Community {
  return {
    id: (row.id as string),
    name: (row.name as string) || '',
    city: (row.city as string) || '',
    state: (row.state as string) || '',
    adminName: (row.adminName || row.admin_name) as string,
    adminRoleTitle: (row.adminRoleTitle || row.admin_role_title) as string,
    avatar: (row.avatar as string) || '',
    totalMembers: Number(row.totalMembers ?? row.total_members ?? 0),
    activeCampaigns: Number(row.activeCampaigns ?? row.active_campaigns ?? 0),
    totalRaisedINR: Number(row.totalRaisedINR ?? row.total_raised_inr ?? 0),
    healthScore: Number(row.healthScore ?? row.health_score ?? 95),
    verifiedStatus: ((row.verifiedStatus || row.verified_status) as Community['verifiedStatus']) || 'Verified',
    description: (row.description as string) || '',
    establishedYear: Number(row.establishedYear ?? row.established_year ?? 2020),
    coverImage: (row.coverImage || row.cover_image) as string,
  };
}



export async function getCommunities(): Promise<Community[]> {
  try {
    const res = await fetch('/api/communities');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    const mapped = (json.data || []).map(mapRow);
    return mapped;
  } catch (err) {
    console.error('getCommunities error:', err);
    return [];
  }
}

export async function getCommunityById(id: string): Promise<Community | null> {
  const communities = await getCommunities();
  return communities.find((c) => c.id === id) || null;
}

export async function updateCommunityStats(
  id: string,
  patch: { totalMembers?: number; totalRaisedINR?: number; activeCampaigns?: number }
) {
  try {
    await fetch('/api/communities', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, total_members: patch.totalMembers, total_raised_inr: patch.totalRaisedINR, active_campaigns: patch.activeCampaigns }),
    });
  } catch (err) {
    console.error('updateCommunityStats error:', err);
  }
}

function mapToDb(community: Partial<Community>): Record<string, any> {
  const mapped: Record<string, any> = {
    id: community.id,
    name: community.name,
    city: community.city,
    state: community.state,
    admin_name: community.adminName,
    admin_role_title: community.adminRoleTitle,
    avatar: community.avatar,
    total_members: community.totalMembers,
    active_campaigns: community.activeCampaigns,
    total_raised_inr: community.totalRaisedINR,
    health_score: community.healthScore,
    verified_status: community.verifiedStatus,
    description: community.description,
    established_year: community.establishedYear,
    cover_image: community.coverImage,
  };
  Object.keys(mapped).forEach(key => mapped[key] === undefined && delete mapped[key]);
  return mapped;
}

export async function createCommunity(community: Omit<Community, 'id'>): Promise<Community> {
  const payload = mapToDb({ ...community, id: `comm_${Date.now()}` });
  const res = await fetch('/api/communities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create community');
  const json = await res.json();
  return mapRow(json.data);
}

export async function updateCommunity(id: string, updates: Partial<Community>): Promise<Community> {
  const payload = mapToDb({ id, ...updates });
  const res = await fetch('/api/communities', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update community');
  const json = await res.json();
  return mapRow(json.data);
}

export async function deleteCommunity(id: string): Promise<void> {
  const res = await fetch(`/api/communities?id=${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete community');
  }
}
