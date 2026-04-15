import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { readUserHash } from "@/lib/cookie";
import { getLinkedHash, readCfAccessEmail } from "@/lib/links";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const cfEmail = readCfAccessEmail(request);
  const linked = await getLinkedHash(env.SESSION, cfEmail);
  const cookieHash = readUserHash(request.headers.get("cookie"));
  const userHash = linked ?? cookieHash;
  if (!userHash) {
    return new Response(JSON.stringify({ error: "unauthenticated" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  let body: { q?: unknown; mode?: unknown; limit?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const q = typeof body.q === "string" ? body.q : "";
  if (!q.trim()) {
    return new Response(JSON.stringify({ error: "missing q" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const mode =
    body.mode === "fts" || body.mode === "vector" || body.mode === "hybrid"
      ? body.mode
      : "hybrid";
  const limit = typeof body.limit === "number" ? body.limit : 20;

  // DO /search needs user_hash for Vectorize's id-prefix + metadata filter.
  // It doesn't know its own name otherwise.
  const doBody = JSON.stringify({ q, mode, limit, user_hash: userHash });
  const id = env.USER_STORE.idFromName(userHash);
  const stub = env.USER_STORE.get(id);
  const res = await stub.fetch("https://store/search", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: doBody,
  });
  // Pass through status + body verbatim — DO returns 429 for rate limits,
  // 4xx for bad input, 200 for success. Dashboard just relays.
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
};
