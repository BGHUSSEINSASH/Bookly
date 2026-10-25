import { randomBytes, randomInt } from 'crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** توليد رمز حجز مقروء: BK-7F3K9Q */
export function generateBookingCode(prefix = 'BK'): string {
  const bytes = randomBytes(6);
  let out = '';
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `${prefix}-${out}`;
}

/** رمز عشوائي آمن بطول محدد */
export function randomToken(length = 32): string {
  return randomBytes(Math.ceil((length * 3) / 4))
    .toString('base64url')
    .slice(0, length);
}

/** رمز تحقق من 6 أرقام */
export function randomOtp(): string {
  return String(randomInt(100000, 1000000));
}

/** رمز جانبي للرابط */
export function randomSlugId(): string {
  return randomBytes(8).toString('hex');
}
