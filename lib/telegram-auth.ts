import crypto from "crypto";

export interface TelegramAuthData {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
}

/**
 * Verify a Telegram Login Widget payload.
 *
 * Algorithm (also reused later for Mini App initData):
 *  1. Build data-check-string from all fields except `hash`, sorted by key,
 *     joined as `key=value` with `\n`.
 *  2. secret = SHA256(botToken).
 *  3. expected = HMAC-SHA256(dataCheckString, secret), hex.
 *  4. Compare to provided hash (constant-time) and check auth_date freshness.
 */
export function verifyTelegramLogin(
  data: TelegramAuthData,
  botToken: string,
  maxAgeSeconds = 300
): boolean {
  if (!botToken) return false;
  const { hash, ...fields } = data;
  if (!hash) return false;

  const dataCheckString = Object.keys(fields)
    .filter((k) => (fields as Record<string, unknown>)[k] !== undefined)
    .sort()
    .map((k) => `${k}=${(fields as Record<string, string>)[k]}`)
    .join("\n");

  const secret = crypto.createHash("sha256").update(botToken).digest();
  const expected = crypto
    .createHmac("sha256", secret)
    .update(dataCheckString)
    .digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  // Freshness: prevent replay.
  const authDate = Number(data.auth_date);
  if (!Number.isFinite(authDate)) return false;
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
  return ageSeconds >= 0 && ageSeconds <= maxAgeSeconds;
}
