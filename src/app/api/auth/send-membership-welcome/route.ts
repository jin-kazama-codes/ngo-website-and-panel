import { NextResponse } from 'next/server';
import { escapeHtml, sendEmail } from '@/lib/email';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const membershipId = typeof body.membershipId === 'string' ? body.membershipId.trim().toUpperCase() : '';

    if (!id || !email.includes('@') || !membershipId) {
      return NextResponse.json(
        { success: false, error: 'User ID, membership ID, and a valid email are required.' },
        { status: 400 }
      );
    }

    const { data: user, error: lookupError } = await supabase
      .from('users')
      .select('id, name, email, membership_id')
      .eq('id', id)
      .eq('email', email)
      .eq('membership_id', membershipId)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'The registered member could not be verified.' },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mfcttrust.com';
    const safeName = escapeHtml(user.name || 'Member');
    const safeMembershipId = escapeHtml(user.membership_id);
    const result = await sendEmail(
      user.email,
      'Your MFCT Membership Registration Details',
      `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;color:#17211c">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#0f3322;margin:0">MFCT Portal</h1>
          <p style="color:#64748b;font-size:13px">Mohammad Faeem Charitable Trust</p>
        </div>
        <h2 style="color:#0f3322">Welcome, ${safeName}!</h2>
        <p>Your membership registration has been received. Keep this membership ID for sign-in and future reference:</p>
        <div style="margin:24px 0;padding:18px;text-align:center;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px">
          <span style="font-size:12px;color:#047857">YOUR MEMBERSHIP ID</span>
          <div style="font-size:28px;font-weight:bold;letter-spacing:2px;color:#0f3322;margin-top:8px">${safeMembershipId}</div>
        </div>
        <p>Your registration is pending review by MFCT administrators. You can sign in using your membership ID and password to check its status.</p>
        <p style="text-align:center;margin:28px 0">
          <a href="${escapeHtml(appUrl)}/sign-in" style="display:inline-block;padding:12px 24px;border-radius:10px;background:#0f3322;color:#f0c868;text-decoration:none;font-weight:bold">Sign In</a>
        </p>
        <p style="color:#64748b;font-size:12px;text-align:center">If you did not register for MFCT, please contact info@mfcttrust.com.</p>
      </div>`
    );

    if (!result.sent) {
      console.error('[Membership welcome email] Delivery failed:', result.error);
      return NextResponse.json(
        { success: false, error: 'Registration was saved, but the membership email could not be sent.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, emailSent: true });
  } catch (error) {
    console.error('Error in send-membership-welcome route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send membership information email.' },
      { status: 500 }
    );
  }
}
