import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function parseNomineeRow(row: any) {
  let photo_url = row.photo_url || '';
  let aadhaar_front_url = row.aadhaar_front_url || '';
  let aadhaar_back_url = row.aadhaar_back_url || '';

  if (row.id_proof_url && typeof row.id_proof_url === 'string') {
    const trimmed = row.id_proof_url.trim();
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (!photo_url) photo_url = parsed.photo_url || parsed.photo || '';
        if (!aadhaar_front_url) aadhaar_front_url = parsed.aadhaar_front_url || parsed.front || '';
        if (!aadhaar_back_url) aadhaar_back_url = parsed.aadhaar_back_url || parsed.back || '';
      } catch {
        if (!aadhaar_front_url) aadhaar_front_url = row.id_proof_url;
      }
    } else if (!aadhaar_front_url) {
      aadhaar_front_url = row.id_proof_url;
    }
  }

  return {
    ...row,
    photo_url,
    aadhaar_front_url,
    aadhaar_back_url,
    id_proof_url: aadhaar_front_url || row.id_proof_url || '',
  };
}

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

    const mapped = (data || []).map(parseNomineeRow);
    return NextResponse.json({ success: true, data: mapped });
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
      photo_url,
      aadhaar_front_url,
      aadhaar_back_url,
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

    const frontDoc = aadhaar_front_url || id_proof_url || '';
    const docBundle = {
      photo_url: photo_url || '',
      aadhaar_front_url: frontDoc,
      aadhaar_back_url: aadhaar_back_url || '',
    };
    const stringifiedBundle = JSON.stringify(docBundle);

    const record: Record<string, any> = {
      user_id: String(user_id),
      nominee_name: nominee_name.trim(),
      relation: relation.trim(),
      phone: phone.trim(),
      email: email?.trim() || '',
      date_of_birth: date_of_birth || '',
      age: age ? Number(age) : null,
      aadhaar_number: aadhaar_number?.trim() || '',
      id_proof_url: stringifiedBundle,
      photo_url: photo_url || '',
      aadhaar_front_url: frontDoc,
      aadhaar_back_url: aadhaar_back_url || '',
      address: address?.trim() || '',
      share_percentage: share_percentage ? Number(share_percentage) : 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // If id is provided and strictly numeric, allow it, otherwise omit to let Postgres identity sequence assign it
    if (body.id && /^\d+$/.test(String(body.id))) {
      record.id = Number(body.id);
    }

    let insertResult = await supabaseAdmin
      .from('member_nominees')
      .insert(record)
      .select()
      .single();

    // If columns photo_url / aadhaar_front_url / aadhaar_back_url do not exist in DB table yet
    if (insertResult.error && (insertResult.error.message.includes('column') || insertResult.error.code === '42703')) {
      delete record.photo_url;
      delete record.aadhaar_front_url;
      delete record.aadhaar_back_url;
      insertResult = await supabaseAdmin
        .from('member_nominees')
        .insert(record)
        .select()
        .single();
    }

    if (insertResult.error) {
      console.error('Supabase insert error on member_nominees:', insertResult.error);
      let errMsg = insertResult.error.message;
      if (insertResult.error.code === '22P02' && insertResult.error.message.includes('bigint')) {
        errMsg = `Database column type mismatch: 'user_id' in member_nominees must be TEXT. Run SQL: ALTER TABLE member_nominees ALTER COLUMN user_id TYPE text USING user_id::text;`;
      }
      return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
    }

    const savedData = parseNomineeRow(insertResult.data);
    return NextResponse.json({
      success: true,
      data: {
        ...savedData,
        photo_url: photo_url || savedData.photo_url,
        aadhaar_front_url: frontDoc || savedData.aadhaar_front_url,
        aadhaar_back_url: aadhaar_back_url || savedData.aadhaar_back_url,
      },
    });
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
    const {
      id,
      photo_url,
      aadhaar_front_url,
      aadhaar_back_url,
      id_proof_url,
      ...otherUpdates
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Nominee ID is required' }, { status: 400 });
    }

    const updates: Record<string, any> = {
      ...otherUpdates,
      updated_at: new Date().toISOString(),
    };

    const frontDoc = aadhaar_front_url !== undefined ? aadhaar_front_url : id_proof_url;
    const docBundle: Record<string, string> = {};
    if (photo_url !== undefined) docBundle.photo_url = photo_url;
    if (frontDoc !== undefined) docBundle.aadhaar_front_url = frontDoc;
    if (aadhaar_back_url !== undefined) docBundle.aadhaar_back_url = aadhaar_back_url;

    if (Object.keys(docBundle).length > 0) {
      updates.id_proof_url = JSON.stringify(docBundle);
      if (photo_url !== undefined) updates.photo_url = photo_url;
      if (frontDoc !== undefined) updates.aadhaar_front_url = frontDoc;
      if (aadhaar_back_url !== undefined) updates.aadhaar_back_url = aadhaar_back_url;
    }

    const queryId = /^\d+$/.test(String(id)) ? Number(id) : id;

    let updateResult = await supabaseAdmin
      .from('member_nominees')
      .update(updates)
      .eq('id', queryId)
      .select()
      .single();

    if (updateResult.error && (updateResult.error.message.includes('column') || updateResult.error.code === '42703')) {
      delete updates.photo_url;
      delete updates.aadhaar_front_url;
      delete updates.aadhaar_back_url;
      updateResult = await supabaseAdmin
        .from('member_nominees')
        .update(updates)
        .eq('id', queryId)
        .select()
        .single();
    }

    if (updateResult.error) {
      console.error('Supabase update error on member_nominees:', updateResult.error);
      return NextResponse.json({ success: false, error: updateResult.error.message }, { status: 500 });
    }

    const parsedData = parseNomineeRow(updateResult.data);
    return NextResponse.json({
      success: true,
      data: {
        ...parsedData,
        photo_url: photo_url !== undefined ? photo_url : parsedData.photo_url,
        aadhaar_front_url: frontDoc !== undefined ? frontDoc : parsedData.aadhaar_front_url,
        aadhaar_back_url: aadhaar_back_url !== undefined ? aadhaar_back_url : parsedData.aadhaar_back_url,
      },
    });
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
