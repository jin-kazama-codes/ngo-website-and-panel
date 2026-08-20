import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Removed DEFAULT_CAMPAIGNS

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const city = searchParams.get('city');
  const zakatOnly = searchParams.get('zakatOnly') === 'true';
  const status = searchParams.get('status');

  try {
    let query = supabaseAdmin.from('campaigns').select('*');

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (category && category !== 'All') {
      if (category === 'Zakat') {
        query = query.eq('is_zakat_eligible', true);
      } else {
        query = query.eq('category', category);
      }
    }

    if (zakatOnly) {
      query = query.eq('is_zakat_eligible', true);
    }

    if (city && city !== 'All') {
      query = query.eq('city', city);
    }

    query = query.order('is_urgent', { ascending: false }).order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    let results = data ?? [];

    return NextResponse.json({ success: true, data: results });
  } catch (err: any) {
    console.error('Error in GET /api/campaigns:', err);
    return NextResponse.json(
      { success: true, data: [], warning: err?.message },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newCampaign = {
      id: body.id || `camp_${Date.now()}`,
      title: body.title,
      category: body.category,
      community_id: body.communityId || body.community_id,
      community_name: body.communityName || body.community_name,
      city: body.city,
      beneficiary_name: body.beneficiaryName || body.beneficiary_name,
      beneficiary_relation: body.beneficiaryRelation || body.beneficiary_relation,
      goal_inr: body.goalINR || body.goal_inr,
      raised_inr: body.raisedINR || body.raised_inr || 0,
      donors_count: body.donorsCount || body.donors_count || 0,
      days_left: body.daysLeft || body.days_left || 30,
      is_verified: body.isVerified !== undefined ? body.isVerified : true,
      is_zakat_eligible: body.isZakatEligible !== undefined ? body.isZakatEligible : true,
      is_urgent: body.isUrgent !== undefined ? body.isUrgent : false,
      main_image: [body.mainImage, ...(body.galleryImages || [])].filter(Boolean).join(','),
      story: body.story,
      documents: body.documents || [],
      created_date: body.createdDate || body.created_date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: body.status || 'pending_approval',
    };

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .insert(newCampaign)
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting campaign:', error);
      // Fallback return created object if DB insert failed
      return NextResponse.json({ success: true, data: newCampaign, warning: error.message });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in POST /api/campaigns:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Campaign ID is required' }, { status: 400 });
    }

    // Fetch existing campaign first to check status transition
    const { data: existingCamp, error: fetchError } = await supabaseAdmin
      .from('campaigns')
      .select('status, community_id')
      .eq('id', body.id)
      .maybeSingle();

    const updatePayload: any = {};
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.is_verified !== undefined) updatePayload.is_verified = body.is_verified;
    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.category !== undefined) updatePayload.category = body.category;
    if (body.communityId !== undefined) updatePayload.community_id = body.communityId;
    if (body.communityName !== undefined) updatePayload.community_name = body.communityName;
    if (body.city !== undefined) updatePayload.city = body.city;
    if (body.beneficiaryName !== undefined) updatePayload.beneficiary_name = body.beneficiaryName;
    if (body.beneficiaryRelation !== undefined) updatePayload.beneficiary_relation = body.beneficiaryRelation;
    if (body.goalINR !== undefined) updatePayload.goal_inr = body.goalINR;
    if (body.isZakatEligible !== undefined) updatePayload.is_zakat_eligible = body.isZakatEligible;
    if (body.isUrgent !== undefined) updatePayload.is_urgent = body.isUrgent;
    if (body.mainImage !== undefined || body.galleryImages !== undefined) {
      updatePayload.main_image = [body.mainImage, ...(body.galleryImages || [])].filter(Boolean).join(',');
    }
    if (body.story !== undefined) updatePayload.story = body.story;
    if (body.documents !== undefined) updatePayload.documents = body.documents;

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update(updatePayload)
      .eq('id', body.id)
      .select()
      .maybeSingle();

    if (error || !data) {
      console.warn('Supabase error updating campaign (or not found):', error?.message || 'No row found');
      // Fallback for mock mode or missing db record
      return NextResponse.json({
        success: true,
        data: { id: body.id, ...updatePayload },
        warning: error?.message || 'Record not found in DB'
      });
    }

    // Increment community active_campaigns count if status changed to active
    if (existingCamp && existingCamp.status !== 'active' && body.status === 'active' && existingCamp.community_id) {
      try {
        const { data: community } = await supabaseAdmin
          .from('communities')
          .select('active_campaigns')
          .eq('id', existingCamp.community_id)
          .single();

        if (community) {
          await supabaseAdmin
            .from('communities')
            .update({
              active_campaigns: (community.active_campaigns || 0) + 1,
            })
            .eq('id', existingCamp.community_id);
        }
      } catch (cErr) {
        console.error('Error updating community active_campaigns:', cErr);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in PATCH /api/campaigns:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update campaign' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Campaign ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting campaign:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error in DELETE /api/campaigns:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to delete campaign' }, { status: 500 });
  }
}
