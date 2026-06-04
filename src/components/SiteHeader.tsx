"use client";

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
 * Global site header: wordmark left; primary nav + Sign in right. Collapses to a
 * toggle-driven menu below 720px (mobile-first).
 *
 * NOTE: the signed-in account chip + dropdown arrives with accounts (FEAT-1/55);
 * the shell shows the signed-out state (Sign in).
 */
export function SiteHeader() {
  const isActive = useIsActive();
  const [open, setOpen] = useState(false);

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
          <Button variant="secondary" size="sm" href="/sign-in" className="site-signin">
            Sign in
          </Button>
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
          <Link href="/sign-in" className="site-mobile-signin" onClick={() => setOpen(false)}>
            Sign in
          </Link>
        </nav>
      )}
    </header>
  );
}
