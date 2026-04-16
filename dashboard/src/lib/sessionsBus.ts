// Page-wide pub/sub for session summaries. The Sidebar already polls
// /api/sessions.json every 5 s — it publishes here so other islands
// (RecentTurnsTable) can subscribe without a duplicate fetch.

import type { SessionSummary } from "@/lib/sessions";

type Listener = (sessions: SessionSummary[]) => void;

const listeners = new Set<Listener>();
let latest: SessionSummary[] | null = null;

export function publishSessions(sessions: SessionSummary[]): void {
  latest = sessions;
  for (const fn of listeners) {
    try {
      fn(sessions);
    } catch {
      /* one bad subscriber shouldn't break the others */
    }
  }
}

export function subscribeSessions(fn: Listener): () => void {
  listeners.add(fn);
  if (latest) fn(latest);
  return () => {
    listeners.delete(fn);
  };
}
