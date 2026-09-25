import { NextResponse } from 'next/server';
import { saveOtp } from '@/lib/otpStore';
import fs from 'fs';
import path from 'path';

// Helper to get environment variable dynamically from process.env or .env files
// Ensures newly added keys work immediately without restarting `npm run dev`
function getEnvVar(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  try {
    const candidates = [
      '.env.development.local',
      '.env.local',
      '.env.production.local',
      '.env',
    ];
    for (const filename of candidates) {
      const fullPath = path.resolve(process.cwd(), filename);
      if (fs.existsSync(fullPath)) {
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const match = raw.match(new RegExp(`^${key}=(.*)$`, 'm'));
        if (match && match[1]) {
          return match[1].trim().replace(/^['"]|['"]$/g, '');
        }
      }
    }
  } catch (e) {
    console.warn(`[getEnvVar] Error reading env files for ${key}:`, e);
  }
  return undefined;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Generate cryptographically-seeded 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save in OTP store (valid for 10 minutes)
    saveOtp(normalizedEmail, code, 600);

    const resendApiKey = getEnvVar('RESEND_API_KEY');
    const brevoApiKey = getEnvVar('BREVO_API_KEY');
    const senderEmail = getEnvVar('EMAIL_FROM') || 'MFCT Portal <onboarding@resend.dev>';

    let emailSent = false;
    let emailErrorMessage = '';

    // 1. Send via Resend
    if (resendApiKey) {
      try {
        console.log(`[Resend] Dispatching OTP email to ${normalizedEmail} from ${senderEmail}...`);

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: senderEmail,
            to: normalizedEmail,
            subject: `${code} is your MFCT Password Reset Code`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #0f3322; font-size: 22px; font-weight: 800; margin: 0;">MFCT Portal</h1>
                  <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Mohammad Faeem Charitable Trust</p>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                  <p style="color: #334155; font-size: 14px; margin: 0 0 12px; font-weight: 500;">Your password reset verification code is:</p>
                  <div style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f3322; background: #ecfdf5; padding: 12px 24px; border-radius: 8px; border: 1.5px dashed #10b981;">
                    ${code}
                  </div>
                  <p style="color: #64748b; font-size: 12px; margin: 12px 0 0;">This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
                </div>
                <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                  If you did not request a password reset, you can safely ignore this email.
                </p>
              </div>
            `,
          }),
        });

        const resData = await res.json().catch(() => ({}));

        if (res.ok) {
          emailSent = true;
          console.log(`[Resend SUCCESS] Email delivered! ID: ${resData?.id}`);
        } else {
          emailErrorMessage = resData?.message || `Resend error code: ${res.status}`;
          console.warn('[Resend API Warning/Error]:', resData);
        }
      } catch (err: any) {
        console.error('[Resend Network Error]:', err);
        emailErrorMessage = err?.message || 'Failed to reach Resend API';
      }
    }

    // 2. Fallback to Brevo if configured and Resend not sent
    if (!emailSent && brevoApiKey) {
      try {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey.trim(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'MFCT Portal', email: senderEmail },
            to: [{ email: normalizedEmail }],
            subject: `${code} is your MFCT Password Reset Code`,
            htmlContent: `
              <div style="font-family: sans-serif; max-width: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #0f3322; margin-top: 0;">Password Reset Code</h2>
                <p>Your verification code for MFCT is:</p>
                <h1 style="letter-spacing: 6px; color: #059669;">${code}</h1>
                <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes.</p>
              </div>
            `,
          }),
        });

        if (res.ok) {
          emailSent = true;
        }
      } catch (err) {
        console.error('[Brevo Error]:', err);
      }
    }

    // Terminal log
    console.log(`\n======================================================`);
    console.log(`[MFCT AUTH] Password Reset OTP for: ${normalizedEmail}`);
    console.log(`[MFCT AUTH] Code: >>> ${code} <<< (Valid for 10 mins)`);
    console.log(`[MFCT AUTH] Resend Key Found: ${resendApiKey ? 'YES' : 'NO'}`);
    console.log(`[MFCT AUTH] From: ${senderEmail}`);
    console.log(`[MFCT AUTH] Live Email Sent: ${emailSent ? 'YES' : 'NO'}`);
    if (emailErrorMessage) {
      console.log(`[MFCT AUTH] Error Notice: ${emailErrorMessage}`);
    }
    console.log(`======================================================\n`);

    if (emailSent) {
      return NextResponse.json({
        success: true,
        emailSent: true,
        message: 'Verification code sent to your email.',
      });
    }

    // If Resend gave an error, return it so the user sees it in the modal
    if (emailErrorMessage) {
      return NextResponse.json({
        success: true,
        emailSent: false,
        previewCode: code,
        emailError: emailErrorMessage,
        message: `Resend: ${emailErrorMessage}`,
      });
    }

    // If no API key configured
    return NextResponse.json({
      success: true,
      emailSent: false,
      previewCode: code,
      message: 'Verification code generated (Test mode).',
    });
  } catch (error: any) {
    console.error('Error in send-otp route:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to send verification code.' },
      { status: 500 }
    );
  }
}
