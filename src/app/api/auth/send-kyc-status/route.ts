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
    const { email, name, status, reason } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid recipient email is required.' },
        { status: 400 }
      );
    }

    if (!status || (status !== 'approved' && status !== 'rejected')) {
      return NextResponse.json(
        { success: false, error: "Valid status ('approved' or 'rejected') is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const resendApiKey = getEnvVar('RESEND_API_KEY');
    const senderEmail = getEnvVar('EMAIL_FROM') || 'MFCT Portal <info@mfcttrust.com>';
    const appUrl = getEnvVar('NEXT_PUBLIC_APP_URL') || 'https://mfcttrust.com';

    let emailSent = false;
    let emailErrorMessage = '';

    const isApproved = status === 'approved';

    const subject = isApproved
      ? 'Congratulations! Your MFCT Membership KYC Has Been Approved'
      : 'Action Required: Update on Your MFCT Membership KYC Verification';

    const emailHtml = isApproved
      ? `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f3322; font-size: 22px; font-weight: 800; margin: 0;">MFCT Portal</h1>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Mohammad Faeem Charitable Trust</p>
          </div>

          <div style="background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 12px; padding: 22px; margin-bottom: 24px;">
            <div style="display: inline-block; background: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px;">
              KYC Verified & Approved
            </div>
            <h3 style="color: #065f46; font-size: 17px; margin: 0 0 8px; font-weight: 800;">
              Welcome, ${name || 'Valued Member'}!
            </h3>
            <p style="color: #047857; font-size: 14px; margin: 0; line-height: 1.6;">
              We are pleased to inform you that your membership KYC documents and identity verification have been <strong>approved</strong> by the MFCT Administration.
            </p>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
            <p style="color: #334155; font-size: 13px; font-weight: 700; margin: 0 0 10px;">What this means for your account:</p>
            <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.7;">
              <li>Your membership status is now <strong>Fully Active</strong>.</li>
              <li>You can view and download your official <strong>Digital Member ID Card</strong>.</li>
              <li>You have complete access to participation in community campaigns and events.</li>
            </ul>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${appUrl}/dashboard" style="display: inline-block; background: #0f3322; color: #f0c868; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(15,51,34,0.2);">
              Open Member Dashboard
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
            Thank you for being a part of Mohammad Faeem Charitable Trust.<br/>
            For support or queries, email us at info@mfcttrust.com.
          </p>
        </div>
      `
      : `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f3322; font-size: 22px; font-weight: 800; margin: 0;">MFCT Portal</h1>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Mohammad Faeem Charitable Trust</p>
          </div>

          <div style="background: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 12px; padding: 22px; margin-bottom: 24px;">
            <div style="display: inline-block; background: #e11d48; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px;">
              Verification Update Required
            </div>
            <h3 style="color: #be123c; font-size: 17px; margin: 0 0 8px; font-weight: 800;">
              KYC Verification Notice
            </h3>
            <p style="color: #334155; font-size: 14px; margin: 0; line-height: 1.6;">
              Dear <strong>${name || 'Member'}</strong>,<br/>
              Your membership KYC verification could not be approved at this time. Please review the reason below and update your submission.
            </p>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
            <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin: 0 0 6px;">Reason for Rejection / Modification Needed:</p>
            <p style="color: #be123c; font-size: 14px; font-weight: 700; margin: 0; line-height: 1.5; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px dashed #fca5a5;">
              "${reason || 'Submitted identity proof or payment details require modification or clearer re-upload.'}"
            </p>
          </div>

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
            <h4 style="color: #1e40af; font-size: 13px; font-weight: 700; margin: 0 0 6px;">How to resolve this:</h4>
            <p style="color: #1e3a8a; font-size: 13px; margin: 0 0 14px; line-height: 1.5;">
              Please log in to your MFCT account, navigate to your Profile, and re-upload clear Aadhaar Card front & back images or provide valid payment details.
            </p>
            <div style="text-align: center;">
              <a href="${appUrl}/profile" style="display: inline-block; background: #0f3322; color: #f0c868; font-weight: 700; font-size: 13px; text-decoration: none; padding: 10px 22px; border-radius: 8px;">
                Update KYC in Profile
              </a>
            </div>
          </div>

          <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
            For assistance, contact Mohammad Faeem Charitable Trust support at info@mfcttrust.com.
          </p>
        </div>
      `;

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
            subject,
            html: emailHtml,
          }),
        });

        const resData = await res.json().catch(() => ({}));
        if (res.ok) {
          emailSent = true;
          console.log(`[KYC Email Resend SUCCESS] Email dispatched to ${normalizedEmail}, ID: ${resData?.id}`);
        } else {
          emailErrorMessage = resData?.message || `Resend HTTP error ${res.status}`;
          console.warn('[KYC Email Resend Failed]:', resData);
        }
      } catch (sendErr: any) {
        emailErrorMessage = sendErr?.message || 'Network error calling Resend API';
        console.error('[KYC Email Resend Exception]:', sendErr);
      }
    } else {
      emailErrorMessage = 'RESEND_API_KEY is not configured in environment.';
      console.warn('[KYC Email Resend] Missing RESEND_API_KEY');
    }

    return NextResponse.json({
      success: true,
      emailSent,
      emailError: emailErrorMessage || undefined,
      message: emailSent
        ? `KYC status notification email sent successfully to ${normalizedEmail}.`
        : `KYC updated, but email could not be delivered: ${emailErrorMessage}`,
    });
  } catch (error: any) {
    console.error('[send-kyc-status] Route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
