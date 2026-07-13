import "server-only";

/**
 * Minimal in-memory sliding-window rate limiter. Keyed by an arbitrary string
 * (e.g. `contact:<ip>`). Good enough to blunt bursts/abuse on the public form
 * endpoints; it's per-instance (not shared across Railway replicas) and resets on
 * redeploy — swap in Upstash/Redis if we ever need distributed limits.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 5, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false; // blocked
  }
  recent.push(now);
  hits.set(key, recent);
  return true; // allowed
}
