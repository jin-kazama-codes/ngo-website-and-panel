import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {

    // 2. Fetch pending campaigns
    const { data: campaignsData, error: cError } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (cError) throw cError;

    // 3. Format campaigns to match PendingVerificationItem
    const formattedCampaigns = (campaignsData || []).map((camp) => {
      let docUrl = camp.main_image;
      if (camp.documents && Array.isArray(camp.documents) && camp.documents.length > 0) {
        docUrl = camp.documents[0].url || camp.main_image;
      }

      return {
        id: camp.id,
        type: 'campaign',
        title: camp.title,
        submitted_by: camp.community_name || 'Community Admin',
        date: camp.created_date || new Date(camp.created_at).toLocaleDateString('en-IN'),
        status: camp.status,
        details: `Goal: ₹${camp.goal_inr} - ${camp.beneficiary_name} (${camp.beneficiary_relation})`,
        document_url: docUrl,
        amount_inr: camp.goal_inr,
      };
    });

    const combinedData = [...formattedCampaigns];

    return NextResponse.json({ success: true, data: combinedData });
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
      if (id.startsWith('camp_')) {
        // Handle campaign approval/rejection
        const newStatus = action === 'approve' ? 'active' : 'rejected';
        const isVerified = action === 'approve' ? true : false;

        const { data, error } = await supabaseAdmin
          .from('campaigns')
          .update({ status: newStatus, is_verified: isVerified })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
      } else {
        // Handle normal verification approval/rejection
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
    }

    // Insert new verification
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
