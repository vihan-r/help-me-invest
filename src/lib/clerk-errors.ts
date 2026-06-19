import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

/**
 * Extracts a human-readable message from a Clerk error for display in our forms.
 * Clerk API errors carry a structured `errors[]`; anything else (network, etc.)
 * falls back to a generic message so we never surface internals to the user.
 */
export function clerkErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (isClerkAPIResponseError(err)) {
    return err.errors[0]?.longMessage ?? err.errors[0]?.message ?? fallback;
  }
  return fallback;
}
