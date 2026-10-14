import { randomInt } from 'crypto';
import { NextResponse } from 'next/server';
import { escapeHtml, sendEmail } from '@/lib/email';
import { savePasswordResetOtp } from '@/lib/passwordResetOtp';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const membershipId = typeof body.membershipId === 'string' ? body.membershipId.trim().toUpperCase() : '';

    if (!email.includes('@') || !membershipId) {
      return NextResponse.json(
        { success: false, error: 'A valid email address and membership ID are required.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: user, error: lookupError } = await supabaseAdmin
      .from('users')
      .select('id, email, membership_id')
      .eq('email', email)
      .eq('membership_id', membershipId)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Membership ID and registered email do not match.' },
        { status: 404 }
      );
    }

    const otp = String(randomInt(100000, 1000000));
    await savePasswordResetOtp(email, membershipId, otp);

    const result = await sendEmail(
      email,
      'Your MFCT Password Reset Code',
      `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;border:1px solid #e2e8f0;border-radius:16px">
        <h1 style="color:#0f3322;text-align:center">MFCT Portal</h1>
        <p>Your password reset verification code for membership <strong>${escapeHtml(membershipId)}</strong> is:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;color:#0f3322">${otp}</p>
        <p>This code expires in 10 minutes. Do not share it with anyone.</p>
        <p style="color:#64748b;font-size:12px">If you did not request this code, you can ignore this email.</p>
      </div>`
    );

    if (!result.sent) {
      console.error('[Password reset email] Delivery failed:', result.error);
      if (process.env.NODE_ENV === 'development' && result.error?.startsWith('No email provider')) {
        return NextResponse.json({
          success: true,
          emailSent: false,
          previewCode: otp,
          message: 'No email provider is configured. Development-only preview code is shown.',
        });
      }
      return NextResponse.json(
        {
          success: false,
          error: 'Could not send the verification email. Please try again later.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      emailSent: true,
      message: 'Verification code sent to your registered email.',
    });
  } catch (error) {
    console.error('Error in send-otp route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send verification code.' },
      { status: 500 }
    );
  }
}
