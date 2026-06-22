import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

/**
 * Public read client for the Next.js app. Used for fetching published content in
 * Server Components (wired in a later sub-step — P3.1 only scaffolds it).
 *
 * `useCdn: false` because our dataset is private (reads are server-side and need
 * a token) and because we revalidate on publish via a webhook rather than
 * relying on the CDN's stale-while-revalidate window. A token is added alongside
 * the first real reads.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});
