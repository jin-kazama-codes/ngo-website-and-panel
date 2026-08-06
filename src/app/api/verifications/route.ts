import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('pending_verifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err: any) {
    console.error('Error in GET /api/verifications:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch verifications', data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, action, reviewerName, ...rest } = body;

    if (id && (action === 'approve' || action === 'reject')) {
      const status = action === 'approve' ? 'approved' : 'rejected';
      const { data, error } = await supabaseAdmin
        .from('pending_verifications')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    const newVerification = {
      id: rest.id || `ver_${Date.now()}`,
      type: rest.type,
      title: rest.title,
      submitted_by: rest.submittedBy || rest.submitted_by,
      date: rest.date || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      status: rest.status || 'pending',
      details: rest.details,
      document_url: rest.documentUrl || rest.document_url || null,
      amount_inr: rest.amountINR || rest.amount_inr || null,
      utr: rest.utr || null,
    };

    const { data, error } = await supabaseAdmin
      .from('pending_verifications')
      .insert(newVerification)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in POST /api/verifications:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to process verification' }, { status: 500 });
  }
}
