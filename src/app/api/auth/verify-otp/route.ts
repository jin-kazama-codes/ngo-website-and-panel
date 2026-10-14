import { NextResponse } from 'next/server';
import { verifyPasswordResetOtp } from '@/lib/passwordResetOtp';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, membershipId } = body;

    if (!email || typeof email !== 'string' || !otp || !membershipId || typeof membershipId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email, membership ID, and verification code are required.' },
        { status: 400 }
      );
    }

    const result = await verifyPasswordResetOtp(email, membershipId, otp);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully.',
    });
  } catch (error: any) {
    console.error('Error in verify-otp route:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to verify code.' },
      { status: 500 }
    );
  }
}
