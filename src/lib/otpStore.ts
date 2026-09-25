// Shared OTP Store with TTL expiry and global caching across Next.js dev reloads

interface OtpEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
}

const globalForOtp = globalThis as unknown as {
  otpStore?: Map<string, OtpEntry>;
};

export const otpStore = globalForOtp.otpStore ?? new Map<string, OtpEntry>();
if (process.env.NODE_ENV !== 'production') {
  globalForOtp.otpStore = otpStore;
}

/**
 * Save a 6-digit OTP for an email address with a 10-minute expiry
 */
export function saveOtp(email: string, otp: string, ttlSeconds = 600): void {
  const normalized = email.trim().toLowerCase();
  otpStore.set(normalized, {
    otp: otp.trim(),
    expiresAt: Date.now() + ttlSeconds * 1000,
    attempts: 0,
  });
}

/**
 * Verify an input OTP for an email
 */
export function verifyOtp(email: string, inputOtp: string): { valid: boolean; message: string } {
  const normalized = email.trim().toLowerCase();
  const entry = otpStore.get(normalized);

  if (!entry) {
    return {
      valid: false,
      message: 'No OTP requested for this email or it has expired. Please request a new OTP.',
    };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalized);
    return {
      valid: false,
      message: 'OTP has expired. Please request a new code.',
    };
  }

  // Prevent brute force (max 5 attempts)
  if (entry.attempts >= 5) {
    otpStore.delete(normalized);
    return {
      valid: false,
      message: 'Too many incorrect attempts. Please request a new OTP.',
    };
  }

  entry.attempts += 1;

  if (entry.otp !== inputOtp.trim()) {
    return {
      valid: false,
      message: 'Incorrect OTP code. Please check your email and try again.',
    };
  }

  // Once verified, consume the OTP to prevent reuse
  otpStore.delete(normalized);
  return {
    valid: true,
    message: 'OTP verified successfully.',
  };
}
