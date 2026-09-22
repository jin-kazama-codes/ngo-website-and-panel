export interface TeamMember {
  id: string;
  name: string;
  phone: string;
  role?: string;
  appointedDate: string;
}

export interface DistrictTeamUnit {
  id: string;
  unitName: string;
  tehsilOrZone: string;
  district: string;
  HeadName: string;
  HeadPhone: string;
  formedDate: string;
  activeVolunteersCount: number;
  status: 'active' | 'in_formation' | 'pending';
  objectives: string;
  members: TeamMember[];
}

function mapDbRowToTeam(row: any): DistrictTeamUnit {
  let members: TeamMember[] = [];
  if (Array.isArray(row.members)) {
    members = row.members;
  } else if (typeof row.members === 'string') {
    try {
      members = JSON.parse(row.members);
    } catch {
      members = [];
    }
  }

  return {
    id: String(row.id),
    unitName: row.unit_name || row.unitName || '',
    tehsilOrZone: row.tehsil_or_zone || row.tehsilOrZone || '',
    district: row.district || '',
    HeadName: row.head_name || row.HeadName || row.headName || '',
    HeadPhone: row.head_phone || row.HeadPhone || row.headPhone || '',
    formedDate: row.formed_date || row.formedDate || '',
    activeVolunteersCount: Number(row.active_volunteers_count || row.activeVolunteersCount) || 15,
    status: (row.status || 'pending') as 'active' | 'in_formation' | 'pending',
    objectives: row.objectives || '',
    members,
  };
}

export async function getTeams(district?: string): Promise<DistrictTeamUnit[]> {
  try {
    const url = district && district !== 'All Districts'
      ? `/api/teams?district=${encodeURIComponent(district)}`
      : '/api/teams';

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json.success && Array.isArray(json.data)) {
      const mapped = json.data.map(mapDbRowToTeam);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mfct_district_teams', JSON.stringify(mapped));
      }
      return mapped;
    }

    return [];
  } catch (err) {
    console.warn('Failed to fetch teams from Supabase:', err);
    return [];
  }
}

export async function createTeam(teamData: Omit<DistrictTeamUnit, 'id'>): Promise<DistrictTeamUnit> {
  const res = await fetch('/api/teams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teamData),
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Server returned status ${res.status}`);
  }

  if (!res.ok || !json.success || !json.data) {
    const errorMsg = json?.error || `Failed to save team unit to Supabase (HTTP ${res.status})`;
    console.error('createTeam error:', errorMsg);
    throw new Error(errorMsg);
  }

  const created = mapDbRowToTeam(json.data);
  updateLocalCache(created);
  return created;
}

export async function updateTeam(id: string, updates: Partial<DistrictTeamUnit>): Promise<DistrictTeamUnit> {
  const res = await fetch('/api/teams', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Server returned status ${res.status}`);
  }

  if (!res.ok || !json.success || !json.data) {
    const errorMsg = json?.error || `Failed to update team unit (HTTP ${res.status})`;
    console.error('updateTeam error:', errorMsg);
    throw new Error(errorMsg);
  }

  const updated = mapDbRowToTeam(json.data);
  updateLocalCache(updated);
  return updated;
}

export async function addTeamMember(team: DistrictTeamUnit, member: Omit<TeamMember, 'id'>): Promise<DistrictTeamUnit> {
  const newMember: TeamMember = {
    ...member,
    id: `mem-${Date.now()}`,
  };

  const updatedMembers = [...(team.members || []), newMember];
  const updatedVolunteers = (team.activeVolunteersCount || 0) + 1;

  return updateTeam(team.id, {
    members: updatedMembers,
    activeVolunteersCount: updatedVolunteers,
  });
}

export async function deleteTeam(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/teams?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.error('deleteTeam error:', err);
    return false;
  }
}

function updateLocalCache(newTeam: DistrictTeamUnit) {
  if (typeof window === 'undefined') return;
  try {
    const existing = JSON.parse(localStorage.getItem('mfct_district_teams') || '[]');
    const filtered = existing.filter((t: any) => t.id !== newTeam.id);
    localStorage.setItem('mfct_district_teams', JSON.stringify([newTeam, ...filtered]));
  } catch { }
}
