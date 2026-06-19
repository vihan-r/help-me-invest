"use client";

import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "./Button";
import { Wordmark } from "./Wordmark";
import { PRIMARY_NAV } from "@/config/site";

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

/**
 * Global site header: wordmark left; primary nav + auth control right. Collapses
 * to a toggle-driven menu below 880px (mobile-first).
 *
 * Auth (FEAT-2): signed-out shows "Sign in"; signed-in shows "Sign out". The full
 * account menu (FEAT-55) is a follow-up.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const isActive = useIsActive();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on any route change — including browser back/forward
  // and programmatic navigation, which the per-link onClick handlers miss.
  // Adjusting state during render (React's recommended pattern) avoids the
  // cascading re-render that a setState-in-effect would cause.
  const [navPath, setNavPath] = useState(pathname);
  if (pathname !== navPath) {
    setNavPath(pathname);
    setOpen(false);
  }

  return (
    <header className="site-header">
      <div className="shell site-header-inner">
        <Wordmark size={20} />
        <div className="site-header-right">
          <nav className="site-nav" aria-label="Primary">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? "active" : ""}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <SignedOut>
            <Button variant="secondary" size="sm" href="/sign-in" className="site-signin">
              Sign in
            </Button>
          </SignedOut>
          <SignedIn>
            <button
              type="button"
              className="btn btn-secondary btn-sm site-signin"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              Sign out
            </button>
          </SignedIn>
          <button
            type="button"
            className="site-nav-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
              {open ? (
                <path
                  d="M5 5l14 14M19 5L5 19"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 6h18M3 12h18M3 18h18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Primary" className="shell site-mobile-nav">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "active" : ""}
              aria-current={isActive(item.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <SignedOut>
            <Link href="/sign-in" className="site-mobile-signin" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <button
              type="button"
              className="site-mobile-signin"
              onClick={() => {
                setOpen(false);
                signOut({ redirectUrl: "/" });
              }}
            >
              Sign out
            </button>
          </SignedIn>
        </nav>
      )}
    </header>
  );
}
