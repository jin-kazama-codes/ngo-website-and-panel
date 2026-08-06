import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const DEFAULT_COMMUNITIES = [
  {
    id: 'comm_bareilly_rohilkhand',
    name: 'Rohilkhand Educational & Nikah Trust',
    city: 'Bareilly',
    state: 'Uttar Pradesh',
    admin_name: 'Dr. Shakeel Ahmad Usmani',
    admin_role_title: 'Community Admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    total_members: 1820,
    active_campaigns: 5,
    total_raised_inr: 4120000,
    health_score: 97,
    verified_status: 'Verified',
    description: 'Serving Qutubkhana and Rohilkhand University area through collective Nikah assistance, widow pensions, and orphan schooling.',
    established_year: 2019,
    cover_image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'comm_bareilly_hq',
    name: 'Bareilly Central Care Society (Headquarters)',
    city: 'Bareilly',
    state: 'Uttar Pradesh',
    admin_name: 'Maulana Hafiz Ziauddin Bareillvi',
    admin_role_title: 'Headquarters Administrator',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    total_members: 3450,
    active_campaigns: 12,
    total_raised_inr: 9850000,
    health_score: 99,
    verified_status: 'Verified',
    description: 'Headquarters of SevaSangam in Civil Lines, Bareilly. Managing emergency Janazah mortuary van, Nikah bridal kits, and student scholarships across Uttar Pradesh.',
    established_year: 2017,
    cover_image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'comm_delhi_central',
    name: 'Hazrat Nizamuddin Welfare Community',
    city: 'Delhi',
    state: 'Delhi NCR',
    admin_name: 'Maulana Salman Farooqui',
    admin_role_title: 'Community Administrator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    total_members: 1240,
    active_campaigns: 6,
    total_raised_inr: 4250000,
    health_score: 98,
    verified_status: 'Verified',
    description: 'Providing medical, educational, and monthly food kit assistance to lower-income North Indian families in Central Delhi.',
    established_year: 2018,
    cover_image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'comm_lko_chowk',
    name: 'Chowk Heritage Community Foundation',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    admin_name: 'Syed Tariq Husain',
    admin_role_title: 'Community Administrator',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    total_members: 1190,
    active_campaigns: 4,
    total_raised_inr: 3290000,
    health_score: 95,
    verified_status: 'Verified',
    description: 'Focusing on girl-child higher education, artisan medical aid, and emergency heart surgeries in Lucknow & Central UP.',
    established_year: 2020,
    cover_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
];

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('communities')
      .select('*')
      .order('total_members', { ascending: false });

    if (error) throw error;

    let results = data ?? [];

    if (results.length === 0) {
      for (const item of DEFAULT_COMMUNITIES) {
        await supabaseAdmin.from('communities').insert(item);
      }
      const { data: refetched } = await supabaseAdmin.from('communities').select('*');
      results = refetched ?? DEFAULT_COMMUNITIES;
    }

    return NextResponse.json({ success: true, data: results });
  } catch (err: any) {
    console.error('Error in GET /api/communities:', err);
    return NextResponse.json(
      { success: true, data: DEFAULT_COMMUNITIES, warning: err?.message },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, error } = await supabaseAdmin.from('communities').insert(body).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to create community' }, { status: 500 });
  }
}
