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

    const payload: Record<string, unknown> = {
      id: user.id || `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: user.name,
      email: (user.email ?? '').trim().toLowerCase(),
      phone: user.phone,
      role: user.role || 'member',
      avatar: validAvatar,
      community_id: user.communityId && user.communityId !== '' ? user.communityId : null,
      community_name: user.communityName || null,
      membership_id: user.membershipId || `MEM-${Date.now().toString().slice(-4)}`,
      is_verified: user.isVerified ?? false,
      city: user.city || null,
      state: user.state || null,
      password: user.passwordHash || user.password || null,
      join_date: user.joinDate || user.join_date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      payment_method: user.paymentMethod || user.payment_method || null,
      payment_utr: user.paymentUtr || user.payment_utr || null,
      payment_screenshot_url: user.paymentScreenshotUrl || user.payment_screenshot_url || null,
      aadhaar_front_url: user.aadhaarFrontUrl || user.aadhaar_front_url || null,
      aadhaar_back_url: user.aadhaarBackUrl || user.aadhaar_back_url || null,
      adderess: user.address || user.adderess || null,
      religion: user.religion || null,
      is_malik_e_nisab: typeof user.isMalikENisab === 'boolean' ? user.isMalikENisab : (typeof user.is_malik_e_nisab === 'boolean' ? user.is_malik_e_nisab : null),
      help_type: user.helpType || user.help_type || null,
      help_details: user.helpDetails || user.help_details || null,
    };

    // Try inserting with all fields, dynamically removing only unsupported columns if any
    let currentPayload = { ...payload };
    let insertResult = null;
    let lastError = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert(currentPayload)
        .select()
        .single();

      if (!error) {
        insertResult = data;
        break;
      }

      lastError = error;
      console.warn(`Supabase insert attempt ${attempt + 1} warning:`, error.message);

      // Check if error is due to a missing column: e.g. column "xyz" of relation "users" does not exist
      const match = error.message.match(/column "([^"]+)" of relation "users" does not exist/);
      if (match && match[1]) {
        const missingCol = match[1];
        delete currentPayload[missingCol];
        // If adderess failed, try address
        if (missingCol === 'adderess' && (user.address || user.adderess)) {
          currentPayload['address'] = user.address || user.adderess;
        }
        continue;
      }

      // If generic error on optional column, try address fallback
      if (currentPayload['adderess'] !== undefined) {
        delete currentPayload['adderess'];
        if (user.address || user.adderess) currentPayload['address'] = user.address || user.adderess;
        continue;
      }

      break;
    }

    if (!insertResult) {
      if (lastError) throw lastError;
      throw new Error('Failed to insert user');
    }

    return NextResponse.json({ success: true, data: insertResult });
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
    if (updates.districtRole !== undefined) {
      updates.district_role = updates.districtRole;
      delete updates.districtRole;
    }
    delete updates.is_premium;
    delete updates.isPremium;
    delete updates.join_date;
    delete updates.joinDate;

    if (updates.address && !updates.adderess) {
      updates.adderess = updates.address;
      delete updates.address;
    }

    let currentUpdates = { ...updates };
    let updateResult = null;
    let lastError = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update(currentUpdates)
        .eq('id', id)
        .select()
        .single();

      if (!error) {
        updateResult = data;
        break;
      }

      lastError = error;
      console.warn(`Supabase update attempt ${attempt + 1} warning:`, error.message);

      const match = error.message.match(/column "([^"]+)" of relation "users" does not exist/);
      if (match && match[1]) {
        const missingCol = match[1];
        delete currentUpdates[missingCol];
        if (missingCol === 'adderess' && updates.adderess) {
          currentUpdates['address'] = updates.adderess;
        }
        continue;
      }

      break;
    }

    if (!updateResult) {
      if (lastError) throw lastError;
      throw new Error('Failed to update user');
    }
    
    return NextResponse.json({ success: true, data: updateResult });
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
