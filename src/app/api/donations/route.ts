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
      if (campaignId === 'general') {
        query = query.or('campaign_id.is.null,campaign_id.eq.general');
      } else {
        query = query.eq('campaign_id', campaignId);
      }
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

    const rawCampaignId = body.campaignId || body.campaign_id;
    const rawDonorId = body.donorId || body.donor_id;

    // In PostgreSQL, 'general' is not a valid campaign ID and 'anonymous' is not a valid user ID.
    // If set to strings that don't exist in campaigns/users tables, foreign key constraints fail.
    // Setting to null satisfies foreign key checks while representing General Fund / unauthenticated donor.
    const campaignId = (!rawCampaignId || rawCampaignId === 'general') ? null : rawCampaignId;
    const donorId = (!rawDonorId || rawDonorId === 'anonymous') ? null : rawDonorId;

    const newDonation: Record<string, any> = {
      id: body.id || `don_${Date.now()}`,
      transaction_id: body.transactionId || body.transaction_id || `TXN${Date.now()}`,
      utr_number: body.utrNumber || body.utr_number,
      donor_name: body.donorName || body.donor_name || 'Anonymous Donor',
      donor_id: donorId,
      donor_role: body.donorRole || body.donor_role || 'member',
      donor_avatar: body.donorAvatar || body.donor_avatar || null,
      campaign_id: campaignId,
      campaign_title: body.campaignTitle || body.campaign_title || 'General Fund',
      community_name: body.communityName || body.community_name || 'Mohammad Faeem Charitable Trust (MFCT)',
      amount_inr: Number(body.amountINR || body.amount_inr || 0),
      category: body.category || 'General',
      is_outside_community: body.isOutsideCommunity !== undefined ? Boolean(body.isOutsideCommunity) : false,
      payment_method: body.paymentMethod || body.payment_method || 'UPI',
      payment_screenshot_url: body.paymentScreenshotUrl || body.payment_screenshot_url || null,
      status: body.status || 'pending_verification',
      date: body.date || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      created_at: nowIso,
      receipt_number: body.receiptNumber || body.receipt_number || `RCP-${Date.now().toString().slice(-6)}`,
      district: body.district || null,
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

      // 1. If error is foreign key violation on campaign_id, set campaign_id = null and retry
      if (error.message?.includes('donations_campaign_id_fkey') || error.message?.includes('campaign_id')) {
        newDonation.campaign_id = null;
        const retryRes = await supabaseAdmin.from('donations').insert(newDonation).select().single();
        if (!retryRes.error) {
          data = retryRes.data;
          error = null;
        } else {
          error = retryRes.error;
        }
      }

      // 2. If error is foreign key violation on donor_id, set donor_id = null and retry
      if (error && (error.message?.includes('donations_donor_id_fkey') || error.message?.includes('donor_id'))) {
        newDonation.donor_id = null;
        const retryRes = await supabaseAdmin.from('donations').insert(newDonation).select().single();
        if (!retryRes.error) {
          data = retryRes.data;
          error = null;
        } else {
          error = retryRes.error;
        }
      }

      // 3. If error is about is_outside_community column missing, retry without it
      if (error && error.message?.includes('is_outside_community')) {
        delete (newDonation as any).is_outside_community;
        const retryRes = await supabaseAdmin.from('donations').insert(newDonation).select().single();
        if (!retryRes.error) {
          data = retryRes.data;
          error = null;
        } else {
          error = retryRes.error;
        }
      }

      // 4. If error is related to json vs text format for wakalahInformation, retry with JSON string
      if (error && newDonation.wakalahInformation && typeof newDonation.wakalahInformation !== 'string') {
        try {
          const retryDonation = {
            ...newDonation,
            wakalahInformation: JSON.stringify(newDonation.wakalahInformation)
          };
          const retryRes = await supabaseAdmin.from('donations').insert(retryDonation).select().single();
          if (!retryRes.error) {
            data = retryRes.data;
            error = null;
          } else {
            error = retryRes.error;
          }
        } catch { }
      }

      if (error) {
        console.error('All retry attempts failed to insert donation:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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

    const returnData = {
      ...(data || newDonation),
      campaignId: (data?.campaign_id || rawCampaignId || 'general'),
      campaign_id: (data?.campaign_id || rawCampaignId || 'general'),
      donorId: (data?.donor_id || rawDonorId || 'anonymous'),
      donor_id: (data?.donor_id || rawDonorId || 'anonymous'),
    };

    return NextResponse.json({ success: true, data: returnData });
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
