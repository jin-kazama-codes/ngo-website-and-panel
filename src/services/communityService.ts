import { Community } from '../types';

function mapRow(row: Record<string, unknown>): Community {
  return {
    id: (row.id as string) || `comm_${Date.now()}`,
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

export const FALLBACK_COMMUNITIES: Community[] = [
  {
    id: 'comm_bareilly_rohilkhand',
    name: 'Rohilkhand Educational & Nikah Trust',
    city: 'Bareilly',
    state: 'Uttar Pradesh',
    adminName: 'Dr. Shakeel Ahmad Usmani',
    adminRoleTitle: 'Community Admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    totalMembers: 1820,
    activeCampaigns: 5,
    totalRaisedINR: 4120000,
    healthScore: 97,
    verifiedStatus: 'Verified',
    description: 'Serving Qutubkhana and Rohilkhand University area through collective Nikah assistance, widow pensions, and orphan schooling.',
    establishedYear: 2019,
    coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'comm_bareilly_hq',
    name: 'Bareilly Central Care Society (Headquarters)',
    city: 'Bareilly',
    state: 'Uttar Pradesh',
    adminName: 'Maulana Hafiz Ziauddin Bareillvi',
    adminRoleTitle: 'Headquarters Administrator',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    totalMembers: 3450,
    activeCampaigns: 12,
    totalRaisedINR: 9850000,
    healthScore: 99,
    verifiedStatus: 'Verified',
    description: 'Headquarters of SevaSangam in Civil Lines, Bareilly.',
    establishedYear: 2017,
    coverImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'comm_delhi_central',
    name: 'Hazrat Nizamuddin Welfare Community',
    city: 'Delhi',
    state: 'Delhi NCR',
    adminName: 'Maulana Salman Farooqui',
    adminRoleTitle: 'Community Administrator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    totalMembers: 1240,
    activeCampaigns: 6,
    totalRaisedINR: 4250000,
    healthScore: 98,
    verifiedStatus: 'Verified',
    description: 'Providing medical, educational, and food kit assistance in Central Delhi.',
    establishedYear: 2018,
    coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'comm_lko_chowk',
    name: 'Chowk Heritage Community Foundation',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    adminName: 'Syed Tariq Husain',
    adminRoleTitle: 'Community Administrator',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    totalMembers: 1190,
    activeCampaigns: 4,
    totalRaisedINR: 3290000,
    healthScore: 95,
    verifiedStatus: 'Verified',
    description: 'Focusing on education, medical aid, and emergency surgeries in Lucknow.',
    establishedYear: 2020,
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
];

export async function getCommunities(): Promise<Community[]> {
  try {
    const res = await fetch('/api/communities');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    const mapped = (json.data || []).map(mapRow);
    return mapped.length > 0 ? mapped : FALLBACK_COMMUNITIES;
  } catch (err) {
    console.error('getCommunities error:', err);
    return FALLBACK_COMMUNITIES;
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
  } catch (err) {
    console.error('updateCommunityStats error:', err);
  }
}
