/**
 * Returns `path` only when it is a safe, same-origin relative path — it must
 * start with a single "/" and not "//" or "/\" (which browsers can treat as a
 * protocol-relative URL and use for an open redirect). Anything else falls back
 * to `fallback`. Used to sanitise the post-auth `redirect_url` before navigating.
 */
export function safeInternalPath(path: string | null | undefined, fallback = "/"): string {
  if (!path || !path.startsWith("/")) return fallback;
  if (path.startsWith("//") || path.startsWith("/\\")) return fallback;
  return path;
}
