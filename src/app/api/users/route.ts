import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const role = searchParams.get('role');
    const communityId = searchParams.get('community_id');

    let query = supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (communityId && communityId !== 'all') {
      query = query.eq('community_id', communityId);
    }

    if (district && district !== 'all') {
      query = query.or(`city.ilike.%${district}%,district.ilike.%${district}%`);
    }

    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    const { data, error } = await query;
    if (error) {
      console.error('GET /api/users Supabase error:', error.message);
      return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    console.error('Error in GET /api/users:', err);
    return NextResponse.json({
      success: false,
      data: [],
      error: err?.message,
    }, { status: 500 });
  }
}
