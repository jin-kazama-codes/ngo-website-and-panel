import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const donorId = searchParams.get('donorId');
  const campaignId = searchParams.get('campaignId');
  const limitStr = searchParams.get('limit');
  const limit = limitStr ? parseInt(limitStr, 10) : 50;

  try {
    let query = supabaseAdmin.from('donations').select('*').order('created_at', { ascending: false }).limit(limit);

    if (donorId) {
      query = query.eq('donor_id', donorId);
    }
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data, error } = await query;
    if (error) throw error;

    let results = data ?? [];

    // Query users for donor avatars if missing
    try {
      const userIds = [...new Set(results.map((r: any) => r.donor_id).filter((id: string) => id && id !== 'anonymous' && !id.startsWith('anon_')))];
      if (userIds.length > 0) {
        const { data: usersData } = await supabaseAdmin
          .from('users')
          .select('id, avatar, name')
          .in('id', userIds);

        if (usersData && usersData.length > 0) {
          const userMap = new Map(usersData.map((u: any) => [u.id, u]));
          results = results.map((r: any) => {
            const u = userMap.get(r.donor_id);
            return {
              ...r,
              donor_avatar: r.donor_avatar || u?.avatar || null,
              donor_name: r.donor_name || u?.name || 'Generous Donor',
            };
          });
        }
      }
    } catch (uErr) {
      console.warn('Could not join users for avatars:', uErr);
    }

    function getDonationTime(item: any): number {
      const dateStr = item.created_at || item.date;
      if (dateStr) {
        const t = new Date(dateStr).getTime();
        if (!isNaN(t) && t > 0) return t;
      }
      const idStr = String(item.id || '');
      const match13 = idStr.match(/don_(\d{13})/);
      if (match13) return parseInt(match13[1], 10);
      return 0;
    }

    results.sort((a: any, b: any) => getDonationTime(b) - getDonationTime(a));

    return NextResponse.json({ success: true, data: results });
  } catch (err: any) {
    console.error('Error in GET /api/donations:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch donations', data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nowIso = new Date().toISOString();

    const newDonation = {
      id: body.id || `don_${Date.now()}`,
      transaction_id: body.transactionId || body.transaction_id,
      utr_number: body.utrNumber || body.utr_number,
      donor_name: body.donorName || body.donor_name,
      donor_id: body.donorId || body.donor_id,
      donor_role: body.donorRole || body.donor_role,
      donor_avatar: body.donorAvatar || body.donor_avatar || null,
      campaign_id: body.campaignId || body.campaign_id,
      campaign_title: body.campaignTitle || body.campaign_title,
      community_name: body.communityName || body.community_name,
      amount_inr: body.amountINR || body.amount_inr,
      category: body.category,
      is_outside_community: body.isOutsideCommunity !== undefined ? Boolean(body.isOutsideCommunity) : false,
      payment_method: body.paymentMethod || body.payment_method,
      payment_screenshot_url: body.paymentScreenshotUrl || body.payment_screenshot_url || null,
      status: body.status || 'verified',
      date: body.date || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      created_at: nowIso,
      receipt_number: body.receiptNumber || body.receipt_number || `RCP-${Date.now().toString().slice(-6)}`,
      wakalahInformation: body.wakalahInformation || (
        body.zakatGuardianName ? [{
          donorName: body.donorName || 'Anonymous',
          guardianName: body.zakatGuardianName,
          address: body.zakatAddress,
          mobile: body.zakatMobile,
          amountINR: body.amountINR,
          amountInWords: body.zakatAmountWords,
          isAccepted: Boolean(body.isWakalahAccepted),
        }] : null
      ),
    };

    let { data, error } = await supabaseAdmin.from('donations').insert(newDonation).select().single();
    if (error) {
      console.error('Supabase error inserting donation:', error);
      // If error is about is_outside_community column missing, retry without it
      if (error.message?.includes('is_outside_community')) {
        delete (newDonation as any).is_outside_community;
        const retryRes = await supabaseAdmin.from('donations').insert(newDonation).select().single();
        if (!retryRes.error) {
          data = retryRes.data;
          error = null;
        }
      }
      // If error is related to json vs text format for wakalahInformation, retry with JSON string
      if (newDonation.wakalahInformation && typeof newDonation.wakalahInformation !== 'string') {
        try {
          const retryDonation = {
            ...newDonation,
            wakalahInformation: JSON.stringify(newDonation.wakalahInformation)
          };
          const retryRes = await supabaseAdmin.from('donations').insert(retryDonation).select().single();
          if (!retryRes.error) {
            data = retryRes.data;
            error = null;
          }
        } catch { }
      }
      if (error) {
        // Return created payload if DB insertion returned warning
        return NextResponse.json({ success: true, data: newDonation, warning: error.message });
      }
    }

    // Update campaign raised amount & donors count if campaign_id present
    if (newDonation.campaign_id) {
      try {
        const { data: campaign } = await supabaseAdmin
          .from('campaigns')
          .select('raised_inr, donors_count, community_id')
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

          if (campaign.community_id) {
            const { data: community } = await supabaseAdmin
              .from('communities')
              .select('total_raised_inr, campaign_details')
              .eq('id', campaign.community_id)
              .single();

            if (community) {
              const currentTotal = community.total_raised_inr || 0;
              const currentDetails = community.campaign_details || [];
              const newDetail = {
                campaign_id: newDonation.campaign_id,
                donor_id: newDonation.donor_id,
                campaign_amount: newDonation.amount_inr,
              };

              await supabaseAdmin
                .from('communities')
                .update({
                  total_raised_inr: currentTotal + newDonation.amount_inr,
                  campaign_details: [...currentDetails, newDetail],
                })
                .eq('id', campaign.community_id);
            }
          }
        }
      } catch (cErr) {
        console.error('Error updating campaign and community stats:', cErr);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in POST /api/donations:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to process donation' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing donation id' }, { status: 400 });
    }

    const updatePayload: any = {};
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.rejectionReason !== undefined || body.rejection_reason !== undefined) {
      updatePayload.rejection_reason = body.rejectionReason ?? body.rejection_reason ?? null;
    }
    if (body.utrNumber !== undefined || body.utr_number !== undefined) {
      updatePayload.utr_number = body.utrNumber ?? body.utr_number;
    }
    if (body.paymentScreenshotUrl !== undefined || body.payment_screenshot_url !== undefined) {
      updatePayload.payment_screenshot_url = body.paymentScreenshotUrl ?? body.payment_screenshot_url;
    }
    if (body.donorName !== undefined || body.donor_name !== undefined) {
      updatePayload.donor_name = body.donorName ?? body.donor_name;
    }
    if (body.amountINR !== undefined || body.amount_inr !== undefined) {
      updatePayload.amount_inr = body.amountINR ?? body.amount_inr;
    }

    let { data, error } = await supabaseAdmin
      .from('donations')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error && (error.message?.includes('rejection_reason') || error.code === '42703')) {
      // Fallback if rejection_reason column not yet added to table
      const fallback = { ...updatePayload };
      delete fallback.rejection_reason;
      const retry = await supabaseAdmin
        .from('donations')
        .update(fallback)
        .eq('id', id)
        .select()
        .single();
      if (!retry.error) {
        data = { ...retry.data, rejection_reason: updatePayload.rejection_reason };
        error = null;
      }
    }

    if (error) {
      console.error('Supabase error updating donation:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in PATCH /api/donations:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update donation' }, { status: 500 });
  }
}
