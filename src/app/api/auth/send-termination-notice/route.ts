import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
    const { email, name, reason } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid recipient email is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const resendApiKey = getEnvVar('RESEND_API_KEY');
    const senderEmail = getEnvVar('EMAIL_FROM') || 'MFCT Portal <info@mfcttrust.com>';
    const appUrl = getEnvVar('NEXT_PUBLIC_APP_URL') || 'https://mfcttrust.com';

    let emailSent = false;
    let emailErrorMessage = '';

    if (resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: senderEmail,
            to: normalizedEmail,
            subject: 'Important Notice: Your MFCT Membership Account Status',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #0f3322; font-size: 22px; font-weight: 800; margin: 0;">MFCT Portal</h1>
                  <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Mohammad Faeem Charitable Trust</p>
                </div>

                <div style="background: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                  <h3 style="color: #be123c; font-size: 16px; margin: 0 0 8px; font-weight: 700;">Account Status Notice</h3>
                  <p style="color: #334155; font-size: 14px; margin: 0; line-height: 1.6;">
                    Dear <strong>${name || 'Member'}</strong>,<br/>
                    Your membership registration on the MFCT Portal has been <strong>terminated</strong> by the administration.
                  </p>
                </div>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                  <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin: 0 0 6px;">Reason for Termination:</p>
                  <p style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0; line-height: 1.5;">
                    "${reason || 'Incomplete or unverified identity documents.'}"
                  </p>
                </div>

                <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                  <h4 style="color: #065f46; font-size: 14px; font-weight: 700; margin: 0 0 6px;">What should you do next?</h4>
                  <p style="color: #047857; font-size: 13px; margin: 0 0 14px; line-height: 1.5;">
                    Your previous registration record has been cleared from our database. You are welcome to submit a <strong>fresh registration</strong> with correct details and clear documents.
                  </p>
                  <div style="text-align: center;">
                    <a href="${appUrl}/sign-up" style="display: inline-block; background: #0f3322; color: #f0c868; font-weight: 700; font-size: 13px; text-decoration: none; padding: 10px 22px; border-radius: 8px;">
                      Register New Account
                    </a>
                  </div>
                </div>

                <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                  For any questions or clarification, please reach out to our support team at info@mfcttrust.com.
                </p>
              </div>
            `,
          }),
        });

        const resData = await res.json().catch(() => ({}));
        if (res.ok) {
          emailSent = true;
          console.log(`[Termination Notice] Email delivered to ${normalizedEmail}`);
        } else {
          emailErrorMessage = resData?.message || 'Resend error';
          console.warn('[Termination Notice Error]:', resData);
        }
      } catch (err: any) {
        console.error('[Termination Notice Error]:', err);
        emailErrorMessage = err?.message || 'Network error';
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      emailError: !emailSent && emailErrorMessage ? emailErrorMessage : undefined,
    });
  } catch (error: any) {
    console.error('Error in send-termination-notice:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to dispatch termination notice.' },
      { status: 500 }
    );
  }
}
