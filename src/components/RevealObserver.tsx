"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Drives the brand's calm reveal-on-scroll motion. Watches every element marked
 * with `data-reveal` / `data-reveal-chain` and adds `is-in` when it enters the
 * viewport (one-shot). Re-scans on route change. Honours reduced-motion and
 * degrades gracefully (reveals everything) where IntersectionObserver is absent.
 *
 * Mounted once in the root layout; the CSS lives in globals.css.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-chain]"),
    );
    if (els.length === 0) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
