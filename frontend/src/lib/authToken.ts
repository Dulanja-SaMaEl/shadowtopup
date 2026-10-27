import crypto from 'crypto';

function getDerivedKey(secret: string): Buffer {
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts arbitrary payload using AES-256-GCM.
 * The resulting token is URL-safe and guarantees confidentiality and integrity.
 */
export function encryptAuthPayload(data: Record<string, any>, secret: string): string {
  const key = getDerivedKey(secret);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = JSON.stringify(data);
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64url');
  ciphertext += cipher.final('base64url');
  const tag = cipher.getAuthTag().toString('base64url');
  return `${iv.toString('base64url')}.${ciphertext}.${tag}`;
}

/**
 * Decrypts and authenticates AES-256-GCM token.
 * Returns the original payload if valid and un-tampered, or null otherwise.
 */
export function decryptAuthPayload<T = any>(token: string, secret: string): T | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [ivB64, cipherB64, tagB64] = parts;
    const key = getDerivedKey(secret);
    const iv = Buffer.from(ivB64, 'base64url');
    const tag = Buffer.from(tagB64, 'base64url');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(cipherB64, 'base64url', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted) as T;
  } catch {
    return null;
  }
}

/**
 * Hashes an OTP code bound to an email address with HMAC-SHA256
 */
export function hashOtpCode(otp: string, email: string, secret: string): string {
  const cleanEmail = String(email || '').toLowerCase().trim();
  const cleanOtp = String(otp || '').trim().replace(/\D/g, '');
  return crypto.createHmac('sha256', secret).update(`${cleanEmail}:${cleanOtp}`).digest('hex');
}
