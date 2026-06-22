"use client";

import dynamic from "next/dynamic";

/**
 * Client boundary for the embedded Studio. `ssr: false` keeps the Studio (and
 * its `sanity.config` import) out of the server module graph entirely, so it's
 * never evaluated during build-time page-data collection or SSR — only in the
 * browser. `ssr: false` is only permitted inside a client component, which is
 * why this wrapper exists.
 */
const Studio = dynamic(() => import("./Studio").then((m) => m.Studio), {
  ssr: false,
});

export function StudioClient() {
  return <Studio />;
}
