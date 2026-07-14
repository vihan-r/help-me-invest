import posthog from "posthog-js";

/**
 * Fire a product-analytics event. No-ops safely when PostHog isn't initialised
 * (e.g. local dev with no key), so call sites don't need to guard. Client-only.
 */
export function capture(event: string, properties?: Record<string, unknown>): void {
  if (typeof window !== "undefined" && posthog.__loaded) {
    posthog.capture(event, properties);
  }
}
