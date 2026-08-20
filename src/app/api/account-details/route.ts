import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('account_details')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error fetching account details:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch account details' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bank_name, account_number, ifsc_code, upi_id, qr_code_url } = body;

    if (!bank_name || !account_number || !ifsc_code || !upi_id) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('account_details')
      .insert({
        bank_name,
        account_number,
        ifsc_code,
        upi_id,
        qr_code_url
      })
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error creating account details:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to create account details' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Account details ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('account_details')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error updating account details:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update account details' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Account details ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('account_details')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting account details:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to delete account details' }, { status: 500 });
  }
}
