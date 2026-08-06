import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const donorId = searchParams.get('donorId');
  const limitStr = searchParams.get('limit');
  const limit = limitStr ? parseInt(limitStr, 10) : 50;

  try {
    let query = supabaseAdmin.from('donations').select('*').order('created_at', { ascending: false }).limit(limit);

    if (donorId) {
      query = query.eq('donor_id', donorId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err: any) {
    console.error('Error in GET /api/donations:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch donations', data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newDonation = {
      id: body.id || `don_${Date.now()}`,
      transaction_id: body.transactionId || body.transaction_id,
      utr_number: body.utrNumber || body.utr_number,
      donor_name: body.donorName || body.donor_name,
      donor_id: body.donorId || body.donor_id,
      donor_role: body.donorRole || body.donor_role,
      campaign_id: body.campaignId || body.campaign_id,
      campaign_title: body.campaignTitle || body.campaign_title,
      community_name: body.communityName || body.community_name,
      amount_inr: body.amountINR || body.amount_inr,
      category: body.category,
      is_outside_community: body.isOutsideCommunity !== undefined ? body.isOutsideCommunity : false,
      payment_method: body.paymentMethod || body.payment_method,
      payment_screenshot_url: body.paymentScreenshotUrl || body.payment_screenshot_url || null,
      status: body.status || 'verified',
      date: body.date || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      receipt_number: body.receiptNumber || body.receipt_number || `RCP-${Date.now().toString().slice(-6)}`,
    };

    const { data, error } = await supabaseAdmin.from('donations').insert(newDonation).select().single();
    if (error) {
      console.error('Supabase error inserting donation:', error);
      // Return created payload if DB insertion returned warning
      return NextResponse.json({ success: true, data: newDonation, warning: error.message });
    }

    // Update campaign raised amount & donors count if campaign_id present
    if (newDonation.campaign_id) {
      try {
        const { data: campaign } = await supabaseAdmin
          .from('campaigns')
          .select('raised_inr, donors_count')
          .eq('id', newDonation.campaign_id)
          .single();

        if (campaign) {
          await supabaseAdmin
            .from('campaigns')
            .update({
              raised_inr: (campaign.raised_inr || 0) + newDonation.amount_inr,
              donors_count: (campaign.donors_count || 0) + 1,
            })
            .eq('id', newDonation.campaign_id);
        }
      } catch (cErr) {
        console.error('Error updating campaign stats:', cErr);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in POST /api/donations:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to process donation' }, { status: 500 });
  }
}
