import { createHash, timingSafeEqual } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function hashOtp(otp: string): string {
  return createHash('sha256').update(otp.trim()).digest('hex');
}

export async function savePasswordResetOtp(email: string, membershipId: string, otp: string): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedMembershipId = membershipId.trim().toUpperCase();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: cleanupError } = await supabaseAdmin
    .from('password_reset_otps')
    .delete()
    .lt('expires_at', new Date().toISOString());
  if (cleanupError) throw cleanupError;

  const { error } = await supabaseAdmin
    .from('password_reset_otps')
    .upsert({
      membership_id: normalizedMembershipId,
      email: normalizedEmail,
      otp_hash: hashOtp(otp),
      expires_at: expiresAt,
      attempts: 0,
    }, { onConflict: 'membership_id' });
  if (error) throw error;
}

export async function verifyPasswordResetOtp(
  email: string,
  membershipId: string,
  otp: string
): Promise<{ valid: boolean; message: string }> {
  const supabaseAdmin = getSupabaseAdmin();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedMembershipId = membershipId.trim().toUpperCase();
  const { data: entry, error } = await supabaseAdmin
    .from('password_reset_otps')
    .select('otp_hash, expires_at, attempts')
    .eq('membership_id', normalizedMembershipId)
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) throw error;
  if (!entry) {
    return { valid: false, message: 'No OTP requested for this membership and email, or it has expired. Please request a new OTP.' };
  }

  const deleteOtp = async () => {
    const { error: deleteError } = await supabaseAdmin
      .from('password_reset_otps')
      .delete()
      .eq('membership_id', normalizedMembershipId)
      .eq('email', normalizedEmail);
    if (deleteError) throw deleteError;
  };

  if (Date.now() > new Date(entry.expires_at).getTime()) {
    await deleteOtp();
    return { valid: false, message: 'OTP has expired. Please request a new code.' };
  }

  if (entry.attempts >= 5) {
    await deleteOtp();
    return { valid: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  const expectedHash = Buffer.from(entry.otp_hash, 'hex');
  const providedHash = Buffer.from(hashOtp(otp), 'hex');
  if (!timingSafeEqual(expectedHash, providedHash)) {
    const { error: updateError } = await supabaseAdmin
      .from('password_reset_otps')
      .update({ attempts: entry.attempts + 1 })
      .eq('membership_id', normalizedMembershipId)
      .eq('email', normalizedEmail)
      .eq('attempts', entry.attempts);
    if (updateError) throw updateError;
    return { valid: false, message: 'Incorrect OTP code. Please check your email and try again.' };
  }

  const { data: consumed, error: consumeError } = await supabaseAdmin
    .from('password_reset_otps')
    .delete()
    .eq('membership_id', normalizedMembershipId)
    .eq('email', normalizedEmail)
    .eq('otp_hash', entry.otp_hash)
    .select('membership_id')
    .maybeSingle();
  if (consumeError) throw consumeError;
  if (!consumed) {
    return { valid: false, message: 'This OTP was already used. Please request a new code.' };
  }

  return { valid: true, message: 'OTP verified successfully.' };
}
