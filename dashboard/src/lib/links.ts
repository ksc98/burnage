// Maps a Cloudflare-Access-authenticated Google email to a user_hash.
// Lets the dashboard auto-scope to the right DO after a one-time /setup
// paste, across browsers/devices for the same Google identity.

const LINK_PREFIX = "link:";

function keyFor(email: string): string {
  return LINK_PREFIX + email.trim().toLowerCase();
}

export function readCfAccessEmail(req: Request): string | null {
  const raw = req.headers.get("cf-access-authenticated-user-email");
  if (!raw) return null;
  const v = raw.trim();
  return v.length > 0 ? v : null;
}

export async function getLinkedHash(
  kv: KVNamespace,
  email: string | null,
): Promise<string | null> {
  if (!email) return null;
  const v = await kv.get(keyFor(email));
  if (v && /^[0-9a-f]{16}$/.test(v)) return v;
  return null;
}

export async function linkEmailToHash(
  kv: KVNamespace,
  email: string,
  hash: string,
): Promise<void> {
  await kv.put(keyFor(email), hash);
}

export async function unlinkEmail(
  kv: KVNamespace,
  email: string,
): Promise<void> {
  await kv.delete(keyFor(email));
}
