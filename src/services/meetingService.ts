import { supabase } from '../lib/supabase';

export interface Meeting {
  id: string;
  title: string;
  agenda: string;
  date: string;
  time: string;
  venue: string;
  chairperson: string;
  recordedBy: string;
  attendeesCount: number;
  status: 'upcoming' | 'completed' | 'pending';
  minutes?: string;
  resolutions?: string[];
  district?: string;
}

export const DEFAULT_MEETINGS: Meeting[] = [
  {
    id: 'meet-101',
    title: 'Monthly District Executive Coordination Meeting (मासिक जिला कार्यकारिणी बैठक)',
    agenda: 'Review of August medical aid disbursements, review of block volunteer expansion, and planning for upcoming district relief campaign.',
    date: '2026-09-05',
    time: '11:00 AM - 01:30 PM',
    venue: 'District Chapter Secretariat, Bareilly',
    chairperson: 'District President',
    recordedBy: 'District Secretary',
    attendeesCount: 18,
    status: 'completed',
    district: 'Bareilly District Chapter',
    minutes: 'All 5 core district posts reviewed their monthly reports. The Finance Coordinator submitted the audited statement for Sadakah fund collections. The General Secretary announced the formation of 2 new block units.',
    resolutions: [
      'Unanimous approval of 15 emergency surgery funds.',
      'Mandatory physical Aadhaar verification by volunteer team prior to release.',
      'Next core review scheduled for mid-September 2026.',
    ],
  },
  {
    id: 'meet-99',
    title: 'Education Grant & Scholarship Committee (शिक्षा अनुदान एवं छात्रवृत्ति समिति)',
    agenda: 'Scrutiny of school fee aid applications for orphans and single-parent households for academic session 2026-27.',
    date: '2026-08-10',
    time: '10:30 AM - 01:00 PM',
    venue: 'Bareilly Central Care Society Meeting Room',
    chairperson: 'Executive Officer',
    recordedBy: 'District Secretary',
    attendeesCount: 14,
    status: 'completed',
    district: 'Bareilly District Chapter',
    minutes: 'All 48 applicant files were audited with fee vouchers and report cards. 39 orphan students qualified under merit-cum-means criteria.',
    resolutions: [
      'Disburse tuition fees directly to designated school bank accounts via NEFT.',
      'Obtain official receipt stamped by school administration.',
    ],
  },
];

// Helper to map Supabase database record to frontend Meeting object
function mapDbRowToMeeting(row: any): Meeting {
  let resolutions: string[] = [];
  if (Array.isArray(row.resolutions)) {
    resolutions = row.resolutions;
  } else if (typeof row.resolutions === 'string') {
    try {
      resolutions = JSON.parse(row.resolutions);
    } catch {
      resolutions = row.resolutions.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  return {
    id: String(row.id),
    title: row.title || '',
    agenda: row.agenda || '',
    date: row.date || '',
    time: row.time || '11:00 AM - 01:00 PM',
    venue: row.venue || '',
    chairperson: row.chairperson || 'District President',
    recordedBy: row.recorded_by || row.recordedBy || 'District Secretary',
    attendeesCount: Number(row.attendees_count || row.attendeesCount) || 10,
    status: row.status || 'upcoming',
    district: row.district || '',
    minutes: row.minutes || '',
    resolutions,
  };
}

/**
 * Fetch all meetings from Supabase (via API endpoint which uses server-side SupabaseAdmin)
 */
export async function getMeetings(district?: string): Promise<Meeting[]> {
  try {
    const url = district && district !== 'All Districts'
      ? `/api/meetings?district=${encodeURIComponent(district)}`
      : '/api/meetings';

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();

    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      const mapped = json.data.map(mapDbRowToMeeting);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mfct_district_meetings', JSON.stringify(mapped));
      }
      return mapped;
    }

    // Fallback to localStorage if Supabase returned empty/no table yet
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mfct_district_meetings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch { }
      }
    }

    return DEFAULT_MEETINGS;
  } catch (err) {
    console.warn('Failed to fetch meetings from Supabase API, falling back to local cache:', err);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mfct_district_meetings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch { }
      }
    }
    return DEFAULT_MEETINGS;
  }
}

/**
 * Create a new meeting in Supabase
 */
export async function createMeeting(meetingData: Omit<Meeting, 'id'>): Promise<Meeting> {
  const res = await fetch('/api/meetings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(meetingData),
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Server response error (HTTP ${res.status})`);
  }

  if (!res.ok || !json.success || !json.data) {
    const errorMsg = json?.error || `Failed to save meeting in Supabase (Status: ${res.status})`;
    console.error('Supabase create error:', errorMsg);
    throw new Error(errorMsg);
  }

  const created = mapDbRowToMeeting(json.data);
  updateLocalCache(created);
  return created;
}

/**
 * Update a meeting in Supabase
 */
export async function updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting> {
  try {
    const res = await fetch('/api/meetings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });

    const json = await res.json();
    if (res.ok && json.success && json.data) {
      return mapDbRowToMeeting(json.data);
    }
  } catch (err) {
    console.error('Error updating meeting in Supabase:', err);
  }

  return { id, ...updates } as Meeting;
}

/**
 * Delete a meeting from Supabase
 */
export async function deleteMeeting(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/meetings?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.error('Error deleting meeting from Supabase:', err);
    return false;
  }
}

/**
 * Approve a pending meeting — sets status to 'upcoming'
 */
export async function approveMeeting(id: string): Promise<Meeting> {
  return updateMeeting(id, { status: 'upcoming' });
}


function updateLocalCache(newMeeting: Meeting) {
  if (typeof window === 'undefined') return;
  try {
    const existing = JSON.parse(localStorage.getItem('mfct_district_meetings') || '[]');
    const filtered = existing.filter((m: any) => m.id !== newMeeting.id);
    localStorage.setItem('mfct_district_meetings', JSON.stringify([newMeeting, ...filtered]));
  } catch { }
}
