/**
 * Sanity Studio configuration.
 *
 * The Studio is embedded in the Next.js app at `/studio` (single Railway deploy,
 * same domain) via `src/app/studio/[[...tool]]/page.tsx`. Imports here are
 * relative (not the `@/` alias) so both Next's bundler and the Sanity CLI can
 * resolve them.
 */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "default",
  title: "Help Me Invest",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool(),
    // GROQ playground for querying content during development.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  schema: {
    types: schemaTypes,
  },
});
