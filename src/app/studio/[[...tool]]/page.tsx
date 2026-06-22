/**
 * Embedded Sanity Studio route — serves the full Studio at `/studio` (and its
 * sub-tools via the catch-all). Clerk middleware is configured to skip `/studio`
 * so the Studio manages its own auth.
 *
 * The Studio is a client-only React SPA: `sanity.config` pulls in client React
 * APIs (`createContext`) that can't be evaluated in a server/RSC context, so the
 * actual Studio is loaded through a client boundary with `ssr: false` (see
 * `StudioClient`). This page stays a Server Component purely so it can export
 * `metadata`/`viewport` (a `"use client"` module can't).
 */
import { StudioClient } from "./StudioClient";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <StudioClient />;
}
