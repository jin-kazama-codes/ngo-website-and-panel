/**
 * SHA-256 Password Hashing Utility using Web Crypto API
 */

export async function hashPassword(password: string): Promise<string> {
  if (!password) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error('Crypto hashing failed:', err);
    // Simple fallback string transformation if crypto.subtle is unavailable
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `sha_${Math.abs(hash).toString(16)}`;
  }
}

export async function verifyPassword(plainPassword: string, hashedPassword?: string): Promise<boolean> {
  if (!hashedPassword || !plainPassword) return false;
  const computedHash = await hashPassword(plainPassword);
  return computedHash === hashedPassword;
}
