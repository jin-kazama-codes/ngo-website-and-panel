import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get('communityId');

    let query = supabaseAdmin.from('users').select('*').order('created_at', { ascending: false });
    if (communityId) query = query.eq('community_id', communityId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err: any) {
    console.error('Error fetching users:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await request.json();
    
    // Sanitize avatar
    const validAvatar = (user.avatar && typeof user.avatar === 'string' && !user.avatar.startsWith('file://')) 
      ? user.avatar 
      : null;

    const basePayload: Record<string, unknown> = {
      id: user.id || `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: user.name,
      email: (user.email ?? '').trim().toLowerCase(),
      phone: user.phone,
      role: user.role || 'member',
      avatar: validAvatar,
      community_id: user.communityId && user.communityId !== '' ? user.communityId : null,
      community_name: user.communityName || null,
      membership_id: user.membershipId || `MEM-${Date.now().toString().slice(-4)}`,
      is_verified: user.isVerified ?? true,
      city: user.city || null,
      state: user.state || null,
      password: user.passwordHash || user.password || null,
    };

    if (user.documentUrl || user.kycDocumentUrl) {
      basePayload.document_url = user.kycDocumentUrl || user.documentUrl;
    }
    if (user.paymentUtr) {
      basePayload.payment_utr = user.paymentUtr;
    }
    if (user.paymentScreenshotUrl) {
      basePayload.payment_screenshot_url = user.paymentScreenshotUrl;
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(basePayload)
      .select()
      .single();

    if (error) {
      console.warn('First insert attempt warning:', error.message);
      // Fallback to essential columns only
      const minimalPayload = {
        id: basePayload.id,
        name: basePayload.name,
        email: basePayload.email,
        phone: basePayload.phone,
        role: basePayload.role,
        community_id: basePayload.community_id,
        community_name: basePayload.community_name,
        membership_id: basePayload.membership_id,
        is_verified: basePayload.is_verified,
        city: basePayload.city,
        state: basePayload.state,
        password: basePayload.password,
      };

      const { data: retryData, error: retryError } = await supabaseAdmin
        .from('users')
        .insert(minimalPayload)
        .select()
        .single();

      if (retryError) {
        console.error('Supabase admin insert failed:', retryError.message);
        throw retryError;
      }

      return NextResponse.json({ success: true, data: retryData });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error creating user:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Sanitize community_id and avatar
    if (updates.community_id === '') updates.community_id = null;
    if (updates.avatar && typeof updates.avatar === 'string' && updates.avatar.startsWith('file://')) {
      updates.avatar = null;
    }
    delete updates.is_premium;
    delete updates.isPremium;
    delete updates.join_date;
    delete updates.joinDate;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error updating user:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to delete user' }, { status: 500 });
  }
}
