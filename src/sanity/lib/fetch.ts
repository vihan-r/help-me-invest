import "server-only";

import { client } from "./client";

/**
 * Server-only Sanity read helper. The dataset is private, so reads carry a
 * read-only token (`SANITY_API_READ_TOKEN`) that must never reach the browser —
 * importing "server-only" makes a client-side import a build error.
 *
 * Caching is governed by each page's `export const revalidate` (ISR): pages are
 * statically rendered and refresh on that interval, and the publish webhook
 * (`/api/revalidate`) calls `revalidatePath` for instant updates on publish.
 */
const serverClient = client.withConfig({ token: process.env.SANITY_API_READ_TOKEN });

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  return serverClient.fetch<T>(query, params);
}
