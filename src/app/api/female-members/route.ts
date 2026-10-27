import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = supabaseAdmin
      .from('member_female_family')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('GET /api/female-members Supabase error:', error.message);
      return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    console.error('Error fetching female family members:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch female members' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      user_id,
      name,
      relation,
      age,
      date_of_birth,
      phone,
      aadhaar_number,
      address,
      photo_url,
      fee_amount,
      payment_method,
      payment_utr,
      payment_screenshot_url,
      status,
    } = body;

    if (!user_id || !name || !relation) {
      return NextResponse.json(
        { success: false, error: 'Missing required female member fields (user_id, name, relation)' },
        { status: 400 }
      );
    }

    const trimmedRelation = relation.trim();
    if (!['Daughter', 'Sister'].includes(trimmedRelation)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only female family members can be added: Daughter (बेटी) or Sister (बहन). Allowed combinations: 2 Beti, 2 Behen, or 1 Behen + 1 Beti.'
        },
        { status: 400 }
      );
    }

    // Check existing count of female members for this member (Max 2 allowed)
    const { count, error: countError } = await supabaseAdmin
      .from('member_female_family')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', String(user_id));

    if (countError) {
      console.warn('Warning: Could not count female members:', countError.message);
    } else if (count !== null && count >= 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Maximum limit of 2 female family members reached. Combinations allowed: 2 Beti, 2 Behen, or 1 Behen 1 Beti.'
        },
        { status: 400 }
      );
    }

    const record: Record<string, any> = {
      user_id: String(user_id),
      name: name.trim(),
      relation: relation.trim(),
      age: age ? Number(age) : null,
      date_of_birth: date_of_birth || '',
      phone: phone?.trim() || '',
      aadhaar_number: aadhaar_number?.trim() || '',
      address: address?.trim() || '',
      photo_url: photo_url || '',
      fee_amount: fee_amount ? Number(fee_amount) : 50,
      payment_method: payment_method || 'UPI',
      payment_utr: payment_utr?.trim() || '',
      payment_screenshot_url: payment_screenshot_url || '',
      status: status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (body.id && /^\d+$/.test(String(body.id))) {
      record.id = Number(body.id);
    }

    const { data, error } = await supabaseAdmin
      .from('member_female_family')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error on member_female_family:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('POST /api/female-members error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save female family member' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing member ID for update' },
        { status: 400 }
      );
    }

    const allowedFields = [
      'name',
      'relation',
      'age',
      'date_of_birth',
      'phone',
      'aadhaar_number',
      'address',
      'photo_url',
      'fee_amount',
      'payment_method',
      'payment_utr',
      'payment_screenshot_url',
      'status',
      'rejection_reason',
    ];

    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const f of allowedFields) {
      if (updates[f] !== undefined) {
        payload[f] = updates[f];
      }
    }

    const { data, error } = await supabaseAdmin
      .from('member_female_family')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error on member_female_family:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('PUT /api/female-members error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update female member' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing member ID for deletion' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('member_female_family')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error on member_female_family:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/female-members error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to delete female member' },
      { status: 500 }
    );
  }
}
