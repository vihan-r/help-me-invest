import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

// On-brand, specific replacements for Clerk's vaguer error codes. Clerk's default
// "Given password is not strong enough" / generic messages are mapped to clear
// guidance that states the actual requirement. Unmapped codes fall back to
// Clerk's own longMessage.
const FRIENDLY_BY_CODE: Record<string, string> = {
  form_password_pwned:
    "That password has appeared in a data breach. Please choose a different one.",
  form_password_length_too_short: "Use at least 8 characters.",
  form_password_not_strong_enough:
    "Please choose a stronger password — avoid common words and simple patterns.",
  form_password_size_in_bytes_exceeded: "That password is too long. Please choose a shorter one.",
  form_password_incorrect: "That email and password don’t match.",
  strategy_for_user_invalid:
    "This account uses a different sign-in method. If you created it with Google, use “Continue with Google” to sign in.",
  form_identifier_not_found: "We couldn’t find an account with that email.",
  form_identifier_exists: "An account with that email already exists. Try signing in instead.",
  form_code_incorrect: "That code isn’t right. Check it and try again.",
  verification_expired: "That code has expired. Request a new one.",
};

/**
 * Extracts a human-readable, on-brand message from a Clerk error for display in
 * our forms. Clerk API errors carry a structured `errors[]` with a `code`; we map
 * known codes to clearer wording and otherwise fall back to Clerk's own message.
 * Non-Clerk errors (network, etc.) return a generic fallback so internals never
 * reach the user.
 */
export function clerkErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (isClerkAPIResponseError(err)) {
    const first = err.errors[0];
    if (first?.code && FRIENDLY_BY_CODE[first.code]) return FRIENDLY_BY_CODE[first.code];
    return first?.longMessage ?? first?.message ?? fallback;
  }
  return fallback;
}
