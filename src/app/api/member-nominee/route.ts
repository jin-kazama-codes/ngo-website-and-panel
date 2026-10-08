import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = supabaseAdmin
      .from('member_nominees')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('GET /api/member-nominee Supabase error:', error.message);
      let errMsg = error.message;
      if (error.code === '22P02' && error.message.includes('bigint')) {
        errMsg = `Column 'user_id' in table 'member_nominees' must be type TEXT. Run: ALTER TABLE member_nominees ALTER COLUMN user_id TYPE text USING user_id::text;`;
      }
      return NextResponse.json({ success: false, error: errMsg, data: [] }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    console.error('Error fetching member nominees:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch nominee' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      user_id,
      nominee_name,
      relation,
      phone,
      email,
      date_of_birth,
      age,
      aadhaar_number,
      id_proof_url,
      address,
      share_percentage,
    } = body;

    if (!user_id || !nominee_name || !relation || !phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required nominee fields (user_id, nominee_name, relation, phone)' },
        { status: 400 }
      );
    }

    const record: Record<string, any> = {
      user_id: String(user_id),
      nominee_name: nominee_name.trim(),
      relation: relation.trim(),
      phone: phone.trim(),
      email: email?.trim() || '',
      date_of_birth: date_of_birth || '',
      age: age ? Number(age) : null,
      aadhaar_number: aadhaar_number?.trim() || '',
      id_proof_url: id_proof_url || '',
      address: address?.trim() || '',
      share_percentage: share_percentage ? Number(share_percentage) : 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // If id is provided and strictly numeric, allow it, otherwise omit to let Postgres identity sequence assign it
    if (body.id && /^\d+$/.test(String(body.id))) {
      record.id = Number(body.id);
    }

    const { data, error } = await supabaseAdmin
      .from('member_nominees')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error on member_nominees:', error);
      let errMsg = error.message;
      if (error.code === '22P02' && error.message.includes('bigint')) {
        errMsg = `Database column type mismatch: 'user_id' in member_nominees must be TEXT. Run SQL: ALTER TABLE member_nominees ALTER COLUMN user_id TYPE text USING user_id::text;`;
      }
      return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error creating nominee:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save nominee' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Nominee ID is required' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();
    const queryId = /^\d+$/.test(String(id)) ? Number(id) : id;

    const { data, error } = await supabaseAdmin
      .from('member_nominees')
      .update(updates)
      .eq('id', queryId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error on member_nominees:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error updating nominee:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update nominee' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Nominee ID is required' }, { status: 400 });
    }

    const queryId = /^\d+$/.test(String(id)) ? Number(id) : id;

    const { error } = await supabaseAdmin
      .from('member_nominees')
      .delete()
      .eq('id', queryId);

    if (error) {
      console.error('Supabase delete error on member_nominees:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting nominee:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to delete nominee' },
      { status: 500 }
    );
  }
}
