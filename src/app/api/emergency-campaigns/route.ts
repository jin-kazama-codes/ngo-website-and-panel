import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    let query = supabaseAdmin
      .from('emergency_aid_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err: any) {
    console.error('Error in GET /api/emergency-campaigns:', err);
    return NextResponse.json(
      { success: false, data: [], error: err?.message },
      { status: 200 } // keep 200 so UI doesn't crash, just returns empty
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Campaign ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('emergency_aid_requests')
      .update({
        status: body.status
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating emergency request:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in PATCH /api/emergency-campaigns:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update emergency request' }, { status: 500 });
  }
}
