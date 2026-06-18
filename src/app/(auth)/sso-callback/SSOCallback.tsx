"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * Completes the Google OAuth redirect. AuthenticateWithRedirectCallback does the
 * token exchange and then redirects to the fallback URL; it renders nothing
 * visible, so we show a brief holding message alongside it.
 */
export function SSOCallback() {
  return (
    <section className="account-shell pt-16 pb-30">
      <div className="account-form">
        <p className="eyebrow">One moment</p>
        <h1 className="d1 mt-3.5">Signing you in…</h1>
        <p className="body-large mt-6 max-w-[520px]">
          Finishing your Google sign-in. You&rsquo;ll be redirected automatically.
        </p>
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
        />
      </div>
    </section>
  );
}
