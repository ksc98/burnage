// user_hash cookie helpers. We never store credentials — only the opaque
// 16-char hash the user retrieves from /_cm/whoami on the proxy.

export const USER_HASH_COOKIE = "llmetry_user_hash";

export function readUserHash(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const pair of cookieHeader.split(";")) {
    const [k, v] = pair.trim().split("=");
    if (k === USER_HASH_COOKIE && v && /^[0-9a-f]{16}$/.test(v)) return v;
  }
  return null;
}

export function setUserHashCookie(hash: string): string {
  return `${USER_HASH_COOKIE}=${hash}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`;
}

export function clearUserHashCookie(): string {
  return `${USER_HASH_COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`;
}
