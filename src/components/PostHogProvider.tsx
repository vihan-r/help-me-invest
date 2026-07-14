"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { Suspense, useEffect, useRef, type ReactNode } from "react";

// Module-scoped so init/pageview coordinate across the provider + its trackers.
let initialized = false;

/** Captures a $pageview on each App Router client navigation (the initial one is
 *  fired from the provider's init effect). Uses useSearchParams, so it's wrapped
 *  in Suspense by the provider to keep pages static. */
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!initialized || !pathname) return;
    const qs = searchParams.toString();
    posthog.capture("$pageview", {
      $current_url: window.origin + pathname + (qs ? `?${qs}` : ""),
    });
  }, [pathname, searchParams]);

  return null;
}

/** Ties events to the signed-in Clerk user; resets identity on sign-out. */
function PostHogIdentify() {
  const { isLoaded, isSignedIn, user } = useUser();
  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (!initialized || !isLoaded) return;
    if (isSignedIn && user) {
      posthog.identify(user.id, { email: user.primaryEmailAddress?.emailAddress });
      wasSignedIn.current = true;
    } else if (wasSignedIn.current) {
      posthog.reset();
      wasSignedIn.current = false;
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
}

/**
 * Client-side PostHog. Initialises once when a key is set (otherwise a no-op —
 * local dev without a key just skips analytics). Pageviews are captured manually
 * (App Router client nav doesn't fire them); `person_profiles: "identified_only"`
 * keeps anonymous visitors profile-less until they sign in; DNT is respected.
 * (Consent banner is a separate, later step — client signed off on shipping now.)
 */
export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (initialized) return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      capture_pageview: false,
      capture_pageleave: true,
      respect_dnt: true,
      person_profiles: "identified_only",
    });
    initialized = true;
    posthog.capture("$pageview"); // initial load (subsequent nav via PostHogPageView)
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      <PostHogIdentify />
      {children}
    </>
  );
}
