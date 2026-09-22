import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Removed DEFAULT_COMMUNITIES

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('communities')
      .select('*')
      .order('total_members', { ascending: false });

    if (error) throw error;

    let results = data ?? [];

    return NextResponse.json({ success: true, data: results });
  } catch (err: any) {
    console.error('Error in GET /api/communities:', err);
    return NextResponse.json(
      { success: true, data: [], warning: err?.message },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { data, error } = await supabaseAdmin.from('communities').insert(body).select().single();
    if (error && error.message && (error.message.includes('district') || error.code === '42703')) {
      const { district, ...bodyWithoutDistrict } = body;
      const retry = await supabaseAdmin.from('communities').insert(bodyWithoutDistrict).select().single();
      if (retry.error) throw retry.error;
      data = { ...retry.data, district };
      error = null;
    }
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to create community' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    let { data, error } = await supabaseAdmin.from('communities').update(updates).eq('id', id).select().single();
    if (error && error.message && (error.message.includes('district') || error.code === '42703')) {
      const { district, ...updatesWithoutDistrict } = updates;
      const retry = await supabaseAdmin.from('communities').update(updatesWithoutDistrict).eq('id', id).select().single();
      if (retry.error) throw retry.error;
      data = { ...retry.data, district };
      error = null;
    }
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update community' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw new Error('ID is required');

    const { error } = await supabaseAdmin.from('communities').delete().eq('id', id);
    if (error) {
      if (error.message.includes('foreign key constraint') || error.code === '23503') {
        throw new Error('Cannot delete this community because it has active members, campaigns, or other linked records.');
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to delete community' }, { status: 400 });
  }
}
