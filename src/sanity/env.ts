/**
 * Sanity environment configuration.
 *
 * `projectId` and `dataset` are public (they ship in the client bundle and the
 * embedded Studio), so they live in `NEXT_PUBLIC_*` vars. The API version is
 * pinned in code — Sanity dates its API, and we want a version we've tested
 * against rather than silently tracking "latest". Reads/writes that need a token
 * (private dataset, drafts) use a server-only token wired in a later sub-step.
 */

// Pinned Sanity API date. Bump deliberately after testing, never automatically.
export const apiVersion = "2024-10-01";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET",
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID",
);

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}
