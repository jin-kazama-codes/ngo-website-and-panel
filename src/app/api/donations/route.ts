import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function extractMissingDonationColumn(error: any): string | null {
  if (!error) return null;
  const msg = [error.message, error.details, error.hint].filter(Boolean).join(' ');
  const postgrestMatch = msg.match(/Could not find the '([^']+)' column/i);
  if (postgrestMatch?.[1]) return postgrestMatch[1];
  const schemaMatch = msg.match(/Could not find the column '([^']+)'/i);
  if (schemaMatch?.[1]) return schemaMatch[1];
  const relMatch = msg.match(/column "([^"]+)" of relation/i);
  if (relMatch?.[1]) return relMatch[1];
  const colMatch = msg.match(/column "([^"]+)" does not exist/i);
  if (colMatch?.[1]) return colMatch[1];
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const donorId = searchParams.get('donorId');
  const campaignId = searchParams.get('campaignId');
  const limitStr = searchParams.get('limit');
  const limit = limitStr ? parseInt(limitStr, 10) : (donorId ? 200 : 100);

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
    const donorName = String(body.donorName || body.donor_name || '').trim();
    const utrNumber = String(body.utrNumber || body.utr_number || '').trim();
    const paymentScreenshotUrl = String(
      body.paymentScreenshotUrl || body.payment_screenshot_url || ''
    ).trim();
    const amountINR = Number(body.amountINR ?? body.amount_inr);

    if (!donorName || !Number.isFinite(amountINR) || amountINR <= 0) {
      return NextResponse.json(
        { success: false, error: 'A donor name and a valid donation amount are required.' },
        { status: 400 }
      );
    }
    if (utrNumber && !/^\d{12}$/.test(utrNumber)) {
      return NextResponse.json(
        { success: false, error: 'If provided, UTR must be a valid 12-digit number.' },
        { status: 400 }
      );
    }
    if (paymentScreenshotUrl && !/^https?:\/\/\S+$/.test(paymentScreenshotUrl)) {
      return NextResponse.json(
        { success: false, error: 'If provided, payment screenshot must be a valid URL.' },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();

    const rawCampaignId = body.campaignId || body.campaign_id;
    const rawDonorId = body.donorId || body.donor_id;

    // In PostgreSQL, 'general' is not a valid campaign ID and 'anonymous' is not a valid user ID.
    // If set to strings that don't exist in campaigns/users tables, foreign key constraints fail.
    // Setting to null satisfies foreign key checks while representing General Fund / unauthenticated donor.
    const campaignId = (!rawCampaignId || rawCampaignId === 'general') ? null : rawCampaignId;
    const donorId = (!rawDonorId || rawDonorId === 'anonymous') ? null : rawDonorId;

    const rawPaymentType = body.paymentType || body.payment_type || 'donation';
    const rawFemaleMemberId = body.femaleMemberId || body.female_member_id || null;
    const rawFemaleMemberName = body.femaleMemberName || body.female_member_name || null;
    const rawBillingMonth = body.billingMonth || body.billing_month || null;
    const rawMonthlyBreakdown = body.monthlyBreakdown || body.monthly_breakdown || null;

    const newDonation: Record<string, any> = {
      id: body.id || `don_${Date.now()}`,
      transaction_id: body.transactionId || body.transaction_id || `TXN${Date.now()}`,
      utr_number: utrNumber || null,
      donor_name: donorName,
      donor_id: donorId,
      donor_role: body.donorRole || body.donor_role || 'member',
      donor_avatar: body.donorAvatar || body.donor_avatar || null,
      campaign_id: campaignId,
      campaign_title: body.campaignTitle || body.campaign_title || 'General Fund',
      community_name: body.communityName || body.community_name || 'Mohammad Faeem Charitable Trust (MFCT)',
      amount_inr: amountINR,
      category: body.category || 'General',
      is_outside_community: body.isOutsideCommunity !== undefined ? Boolean(body.isOutsideCommunity) : false,
      payment_method: body.paymentMethod || body.payment_method || 'UPI',
      payment_screenshot_url: paymentScreenshotUrl || null,
      status: 'pending_verification',
      date: body.date || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      created_at: nowIso,
      receipt_number: body.receiptNumber || body.receipt_number || `RCP-${Date.now().toString().slice(-6)}`,
      district: body.district || null,
      payment_type: rawPaymentType,
      female_member_id: rawFemaleMemberId,
      female_member_name: rawFemaleMemberName,
      billing_month: rawBillingMonth,
      monthly_breakdown: rawMonthlyBreakdown,
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

    const optionalFieldsToKeep = {
      payment_type: rawPaymentType,
      female_member_id: rawFemaleMemberId,
      female_member_name: rawFemaleMemberName,
      billing_month: rawBillingMonth,
      monthly_breakdown: rawMonthlyBreakdown,
    };

    let data: any = null;
    let error: any = null;

    for (let attempt = 0; attempt < 8; attempt++) {
      const res = await supabaseAdmin.from('donations').insert(newDonation).select().single();
      if (!res.error) {
        data = res.data;
        error = null;
        break;
      }

      error = res.error;

      // 1. Foreign key violation on campaign_id
      if (error.message?.includes('donations_campaign_id_fkey') || (error.message?.includes('campaign_id') && error.message?.includes('foreign key'))) {
        newDonation.campaign_id = null;
        continue;
      }

      // 2. Foreign key violation on donor_id
      if (error.message?.includes('donations_donor_id_fkey') || (error.message?.includes('donor_id') && error.message?.includes('foreign key'))) {
        newDonation.donor_id = null;
        continue;
      }

      // 3. Not-null on utr_number
      if (error.message?.includes('utr_number') || error.message?.includes('null value in column "utr_number"')) {
        newDonation.utr_number = '';
        continue;
      }

      // 4. Missing optional column (e.g. before Supabase migration runs)
      const missingCol = extractMissingDonationColumn(error);
      if (missingCol && missingCol in newDonation) {
        delete newDonation[missingCol];
        continue;
      }

      // 5. JSON vs text format for wakalahInformation or monthly_breakdown
      if (newDonation.wakalahInformation && typeof newDonation.wakalahInformation !== 'string' && error.message?.toLowerCase().includes('wakalah')) {
        newDonation.wakalahInformation = JSON.stringify(newDonation.wakalahInformation);
        continue;
      }
      if (newDonation.monthly_breakdown && typeof newDonation.monthly_breakdown !== 'string' && error.message?.toLowerCase().includes('monthly_breakdown')) {
        newDonation.monthly_breakdown = JSON.stringify(newDonation.monthly_breakdown);
        continue;
      }

      break;
    }

    if (error) {
      console.error('All retry attempts failed to insert donation:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const returnData = {
      ...optionalFieldsToKeep,
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

    let newlyVerifiedDonation: {
      campaign_id: string | null;
      donor_id: string | null;
      amount_inr: number;
      utr_number?: string | null;
      created_at?: string | null;
      payment_type?: string | null;
      female_member_id?: string | null;
      monthly_breakdown?: any;
    } | null = null;
    if (body.status === 'verified') {
      let prevRes = await supabaseAdmin
        .from('donations')
        .select('status, campaign_id, donor_id, amount_inr, utr_number, created_at, payment_type, female_member_id, monthly_breakdown')
        .eq('id', id)
        .single();

      if (prevRes.error && extractMissingDonationColumn(prevRes.error)) {
        prevRes = await supabaseAdmin
          .from('donations')
          .select('status, campaign_id, donor_id, amount_inr, utr_number, created_at')
          .eq('id', id)
          .single();
      }

      if (prevRes.error) {
        return NextResponse.json(
          { success: false, error: prevRes.error.message },
          { status: 500 }
        );
      }

      const previousDonation: any = prevRes.data;
      if (previousDonation.status !== 'verified') {
        newlyVerifiedDonation = {
          campaign_id: previousDonation.campaign_id,
          donor_id: previousDonation.donor_id,
          amount_inr: Number(previousDonation.amount_inr || 0),
          utr_number: previousDonation.utr_number,
          created_at: previousDonation.created_at,
          payment_type: previousDonation.payment_type,
          female_member_id: previousDonation.female_member_id,
          monthly_breakdown: previousDonation.monthly_breakdown,
        };
      }
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

    if (newlyVerifiedDonation && newlyVerifiedDonation.campaign_id && newlyVerifiedDonation.amount_inr > 0) {
      try {
        const { data: campaign } = await supabaseAdmin
          .from('campaigns')
          .select('raised_inr, donors_count, community_id')
          .eq('id', newlyVerifiedDonation.campaign_id)
          .single();

        if (campaign) {
          await supabaseAdmin
            .from('campaigns')
            .update({
              raised_inr: (campaign.raised_inr || 0) + newlyVerifiedDonation.amount_inr,
              donors_count: (campaign.donors_count || 0) + 1,
            })
            .eq('id', newlyVerifiedDonation.campaign_id);

          if (campaign.community_id) {
            const { data: community } = await supabaseAdmin
              .from('communities')
              .select('total_raised_inr, campaign_details')
              .eq('id', campaign.community_id)
              .single();

            if (community) {
              await supabaseAdmin
                .from('communities')
                .update({
                  total_raised_inr:
                    (community.total_raised_inr || 0) + newlyVerifiedDonation.amount_inr,
                  campaign_details: [
                    ...(community.campaign_details || []),
                    {
                      campaign_id: newlyVerifiedDonation.campaign_id,
                      donor_id: newlyVerifiedDonation.donor_id,
                      campaign_amount: newlyVerifiedDonation.amount_inr,
                    },
                  ],
                })
                .eq('id', campaign.community_id);
            }
          }
        }
      } catch (cErr) {
        console.error('Error updating verified donation campaign stats:', cErr);
      }
    }

    // Sync monthly payment snapshot onto users & member_female_family when verified
    if (newlyVerifiedDonation) {
      try {
        const paidAt = newlyVerifiedDonation.created_at || new Date().toISOString();
        let breakdown: any[] = [];
        if (Array.isArray(newlyVerifiedDonation.monthly_breakdown)) {
          breakdown = newlyVerifiedDonation.monthly_breakdown;
        } else if (typeof newlyVerifiedDonation.monthly_breakdown === 'string') {
          try {
            const parsed = JSON.parse(newlyVerifiedDonation.monthly_breakdown);
            if (Array.isArray(parsed)) breakdown = parsed;
          } catch {}
        }

        const primaryItem = breakdown.find((b) => b?.targetType === 'primary');
        const pType = newlyVerifiedDonation.payment_type;
        if (
          newlyVerifiedDonation.donor_id &&
          (primaryItem || pType === 'member_monthly' || pType === 'combined_monthly')
        ) {
          const primaryAmount = Number(primaryItem?.amountINR || newlyVerifiedDonation.amount_inr || 0);
          await supabaseAdmin
            .from('users')
            .update({
              monthly_payment: 'yes',
              monthly_payment_date: paidAt,
              monthly_payment_amount: primaryAmount,
            })
            .eq('id', newlyVerifiedDonation.donor_id);
        }

        const femaleItems = breakdown.filter((b) => b?.targetType === 'female' && b?.targetId);
        if (femaleItems.length > 0) {
          for (const item of femaleItems) {
            await supabaseAdmin
              .from('member_female_family')
              .update({
                monthly_payment: 'yes',
                monthly_payment_date: paidAt,
                monthly_payment_amount: Number(item.amountINR || 50),
                last_monthly_utr: newlyVerifiedDonation.utr_number || '',
              })
              .eq('id', item.targetId);
          }
        } else if (newlyVerifiedDonation.female_member_id) {
          const ids = String(newlyVerifiedDonation.female_member_id)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          const perMemberAmount = ids.length > 0 ? Math.round(newlyVerifiedDonation.amount_inr / ids.length) : newlyVerifiedDonation.amount_inr;
          for (const fId of ids) {
            await supabaseAdmin
              .from('member_female_family')
              .update({
                monthly_payment: 'yes',
                monthly_payment_date: paidAt,
                monthly_payment_amount: perMemberAmount,
                last_monthly_utr: newlyVerifiedDonation.utr_number || '',
              })
              .eq('id', fId);
          }
        }
      } catch (mErr) {
        console.warn('Could not sync monthly payment columns (SQL migration may not have run yet):', mErr);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in PATCH /api/donations:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update donation' }, { status: 500 });
  }
}
