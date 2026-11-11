import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function parseFemaleMemberRow(row: any) {
  let photo_url = row.photo_url || '';
  let aadhaar_front_url = row.aadhaar_front_url || '';
  let aadhaar_back_url = row.aadhaar_back_url || '';

  if (photo_url && typeof photo_url === 'string') {
    const trimmed = photo_url.trim();
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        photo_url = parsed.photo_url || parsed.photo || '';
        if (!aadhaar_front_url) aadhaar_front_url = parsed.aadhaar_front_url || parsed.front || '';
        if (!aadhaar_back_url) aadhaar_back_url = parsed.aadhaar_back_url || parsed.back || '';
      } catch {
        // Keep as-is if parsing fails
      }
    }
  }

  return {
    ...row,
    photo_url,
    aadhaar_front_url,
    aadhaar_back_url,
  };
}

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

    const mapped = (data || []).map(parseFemaleMemberRow);
    return NextResponse.json({ success: true, data: mapped });
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
      aadhaar_front_url,
      aadhaar_back_url,
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

    // If aadhaar documents are provided, bundle into photo_url fallback in case dedicated columns don't exist yet
    const photoBundle = (aadhaar_front_url || aadhaar_back_url)
      ? JSON.stringify({
          photo_url: photo_url || '',
          aadhaar_front_url: aadhaar_front_url || '',
          aadhaar_back_url: aadhaar_back_url || '',
        })
      : (photo_url || '');

    const record: Record<string, any> = {
      user_id: String(user_id),
      name: name.trim(),
      relation: relation.trim(),
      age: age ? Number(age) : null,
      date_of_birth: date_of_birth || '',
      phone: phone?.trim() || '',
      aadhaar_number: aadhaar_number?.trim() || '',
      address: address?.trim() || '',
      photo_url: photoBundle,
      aadhaar_front_url: aadhaar_front_url || '',
      aadhaar_back_url: aadhaar_back_url || '',
      fee_amount: fee_amount ? Number(fee_amount) : 50,
      payment_method: payment_method || 'UPI',
      payment_utr: payment_utr?.trim() || '',
      payment_screenshot_url: payment_screenshot_url || '',
      status: status || 'pending',
      monthly_payment: body.monthly_payment === 'yes' || body.monthly_payment === true ? 'yes' : 'no',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (body.id && /^\d+$/.test(String(body.id))) {
      record.id = Number(body.id);
    }

    let insertResult = await supabaseAdmin
      .from('member_female_family')
      .insert(record)
      .select()
      .single();

    if (insertResult.error && (insertResult.error.message.includes('column') || insertResult.error.code === '42703')) {
      delete record.aadhaar_front_url;
      delete record.aadhaar_back_url;
      if (insertResult.error.message.includes('monthly_payment')) {
        delete record.monthly_payment;
      }
      insertResult = await supabaseAdmin
        .from('member_female_family')
        .insert(record)
        .select()
        .single();
    }

    if (insertResult.error) {
      console.error('Supabase insert error on member_female_family:', insertResult.error);
      return NextResponse.json({ success: false, error: insertResult.error.message }, { status: 500 });
    }

    const parsedData = parseFemaleMemberRow(insertResult.data);
    return NextResponse.json({
      success: true,
      data: {
        ...parsedData,
        photo_url: photo_url || parsedData.photo_url,
        aadhaar_front_url: aadhaar_front_url || parsedData.aadhaar_front_url,
        aadhaar_back_url: aadhaar_back_url || parsedData.aadhaar_back_url,
      },
    });
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
      'aadhaar_front_url',
      'aadhaar_back_url',
      'fee_amount',
      'payment_method',
      'payment_utr',
      'payment_screenshot_url',
      'status',
      'rejection_reason',
      'monthly_payment',
      'monthly_payment_date',
      'monthly_payment_amount',
      'last_monthly_utr',
    ];

    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const f of allowedFields) {
      if (updates[f] !== undefined) {
        payload[f] = updates[f];
      }
    }

    // If aadhaar documents are being updated, keep bundle in photo_url as fallback
    if (updates.photo_url !== undefined || updates.aadhaar_front_url !== undefined || updates.aadhaar_back_url !== undefined) {
      const pUrl = updates.photo_url !== undefined ? updates.photo_url : '';
      const fUrl = updates.aadhaar_front_url !== undefined ? updates.aadhaar_front_url : '';
      const bUrl = updates.aadhaar_back_url !== undefined ? updates.aadhaar_back_url : '';
      if (fUrl || bUrl) {
        payload.photo_url = JSON.stringify({
          photo_url: pUrl,
          aadhaar_front_url: fUrl,
          aadhaar_back_url: bUrl,
        });
      }
    }

    let updateResult = await supabaseAdmin
      .from('member_female_family')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (updateResult.error && (updateResult.error.message.includes('column') || updateResult.error.code === '42703')) {
      delete payload.aadhaar_front_url;
      delete payload.aadhaar_back_url;
      if (updateResult.error.message.includes('monthly_payment')) {
        delete payload.monthly_payment;
        delete payload.monthly_payment_date;
        delete payload.monthly_payment_amount;
        delete payload.last_monthly_utr;
      }
      updateResult = await supabaseAdmin
        .from('member_female_family')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    }

    if (updateResult.error) {
      console.error('Supabase update error on member_female_family:', updateResult.error);
      return NextResponse.json({ success: false, error: updateResult.error.message }, { status: 500 });
    }

    const parsedData = parseFemaleMemberRow(updateResult.data);
    return NextResponse.json({
      success: true,
      data: {
        ...parsedData,
        photo_url: updates.photo_url !== undefined ? updates.photo_url : parsedData.photo_url,
        aadhaar_front_url: updates.aadhaar_front_url !== undefined ? updates.aadhaar_front_url : parsedData.aadhaar_front_url,
        aadhaar_back_url: updates.aadhaar_back_url !== undefined ? updates.aadhaar_back_url : parsedData.aadhaar_back_url,
      },
    });
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
