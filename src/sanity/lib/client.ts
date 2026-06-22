import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

/**
 * Read client for the Next.js app, used for fetching content in Server
 * Components. `sanityFetch` (server-only) adds the read token.
 *
 * - `perspective: "published"` — the live site only ever sees published content,
 *   never editors' unpublished drafts, even though the token could read them.
 * - `useCdn: false` — the dataset is private (reads are server-side with a
 *   token), and freshness is handled by ISR + the publish webhook rather than
 *   the CDN's stale window.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});
