"use client";

import { NextStudio } from "next-sanity/studio";

import config from "../../../../sanity.config";

/**
 * The actual Studio component. Imported lazily (browser-only) via `StudioClient`
 * so that `config` — which transitively imports client-only React APIs — is
 * never evaluated on the server.
 */
export function Studio() {
  return <NextStudio config={config} />;
}
