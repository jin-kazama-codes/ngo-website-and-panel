import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = supabaseAdmin
      .from('member_bank_details')
      .select('*')
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('GET /api/member-bank-details Supabase error:', error.message);
      let errMsg = error.message;
      if (error.code === '22P02' && error.message.includes('bigint')) {
        errMsg = `Column 'user_id' in table 'member_bank_details' must be type TEXT. Run: ALTER TABLE member_bank_details ALTER COLUMN user_id TYPE text USING user_id::text;`;
      }
      return NextResponse.json({ success: false, error: errMsg, data: [] }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    console.error('Error fetching member bank details:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch member bank details' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      user_id,
      account_holder_name,
      bank_name,
      account_number,
      ifsc_code,
      branch_name,
      account_type,
      upi_id,
      passbook_or_cheque_url,
      is_primary,
    } = body;

    if (!user_id || !account_holder_name || !bank_name || !account_number || !ifsc_code) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required bank fields (user_id, account_holder_name, bank_name, account_number, ifsc_code)',
        },
        { status: 400 }
      );
    }

    const record: Record<string, any> = {
      user_id: String(user_id),
      account_holder_name: account_holder_name.trim(),
      bank_name: bank_name.trim(),
      account_number: account_number.trim(),
      ifsc_code: ifsc_code.trim().toUpperCase(),
      branch_name: branch_name?.trim() || '',
      account_type: account_type || 'Savings',
      upi_id: upi_id?.trim() || '',
      passbook_or_cheque_url: passbook_or_cheque_url || '',
      is_primary: is_primary ?? true,
      created_at: new Date().toISOString(),
    };

    // If id is provided and strictly numeric, allow it, otherwise omit to let Postgres identity sequence assign it
    if (body.id && /^\d+$/.test(String(body.id))) {
      record.id = Number(body.id);
    }

    // If marked as primary, unmark others for the same user
    if (record.is_primary) {
      try {
        await supabaseAdmin
          .from('member_bank_details')
          .update({ is_primary: false })
          .eq('user_id', user_id);
      } catch (e) {
        console.warn('Could not reset other primary bank accounts:', e);
      }
    }

    let { data, error } = await supabaseAdmin
      .from('member_bank_details')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error on member_bank_details:', error);
      let errMsg = error.message;
      if (error.code === '22P02' && error.message.includes('bigint')) {
        errMsg = `Database column type mismatch: 'user_id' in member_bank_details must be TEXT. Run SQL: ALTER TABLE dev.member_bank_details ALTER COLUMN user_id TYPE text USING user_id::text;`;
      } else if (error.code === '22007' && error.message.includes('time with time zone')) {
        errMsg = `Database column type mismatch: 'updated_at' must be TIMESTAMP WITH TIME ZONE. Run SQL: ALTER TABLE dev.member_bank_details ALTER COLUMN updated_at TYPE timestamp with time zone USING now();`;
      }
      return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error creating member bank details:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save member bank details' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Bank details ID is required' }, { status: 400 });
    }

    if (updates.ifsc_code) {
      updates.ifsc_code = updates.ifsc_code.trim().toUpperCase();
    }
    const updatePayload = { ...updates, updated_at: new Date().toISOString() };
    const queryId = /^\d+$/.test(String(id)) ? Number(id) : id;

    let { data, error } = await supabaseAdmin
      .from('member_bank_details')
      .update(updatePayload)
      .eq('id', queryId)
      .select()
      .single();

    // If update fails because updated_at is 'time with time zone' in the database, retry without updated_at
    if (error && error.code === '22007') {
      const { updated_at: _, ...payloadWithoutUpdatedAt } = updatePayload;
      const retryResult = await supabaseAdmin
        .from('member_bank_details')
        .update(payloadWithoutUpdatedAt)
        .eq('id', queryId)
        .select()
        .single();
      if (!retryResult.error) {
        return NextResponse.json({ success: true, data: retryResult.data });
      }
    }

    if (error) {
      console.error('Supabase update error on member_bank_details:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error updating member bank details:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update member bank details' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Bank details ID is required' }, { status: 400 });
    }

    const queryId = /^\d+$/.test(String(id)) ? Number(id) : id;

    const { error } = await supabaseAdmin
      .from('member_bank_details')
      .delete()
      .eq('id', queryId);

    if (error) {
      console.error('Supabase delete error on member_bank_details:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting member bank details:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to delete member bank details' },
      { status: 500 }
    );
  }
}
