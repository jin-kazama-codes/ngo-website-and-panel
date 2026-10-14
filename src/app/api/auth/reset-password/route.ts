import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { verifyPasswordResetOtp } from '@/lib/passwordResetOtp';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const membershipId = typeof body.membershipId === 'string' ? body.membershipId.trim().toUpperCase() : '';
    const otp = typeof body.otp === 'string' ? body.otp.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email.includes('@') || !membershipId || !/^\d{6}$/.test(otp) || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Enter a valid email, membership ID, 6-digit code, and password of at least 6 characters.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: user, error: lookupError } = await supabaseAdmin
      .from('users')
      .select('id')
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

    const verification = await verifyPasswordResetOtp(email, membershipId, otp);
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.message },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password: passwordHash })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully.',
    });
  } catch (error) {
    console.error('Error in reset-password route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password. Please request a new code and try again.' },
      { status: 500 }
    );
  }
}
