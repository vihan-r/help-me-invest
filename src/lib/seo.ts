import type { Metadata } from "next";
import { SITE } from "@/config/site";

export interface PageMetaInput {
  /**
   * Page title, used verbatim for the document `<title>` (the root layout's
   * template appends ` · Help Me Invest`) and for the OpenGraph/Twitter title.
   * Omit on the home page so the bare site name is used.
   */
  title?: string;
  /** Page description — drives the meta description and the social card text. */
  description: string;
  /**
   * Route path (e.g. "/how-it-works"). When set, emits a canonical URL and an
   * absolute `og:url`. Resolved against `metadataBase` from the root layout.
   */
  path?: string;
  /** Keep the page out of search indexes (e.g. the internal styleguide). */
  noindex?: boolean;
}

/** Shared social card — the build-time image from `src/app/opengraph-image.tsx`. */
const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Help Me Invest — property investing on your own terms",
};

/**
 * Builds a route's `Metadata` so each page carries its own title, description,
 * and matching OpenGraph + Twitter card — not just the global defaults from the
 * root layout. Two Next.js details are handled here:
 *   - OpenGraph/Twitter titles do NOT inherit the document title template, so we
 *     set the full "Title · Help Me Invest" social title explicitly.
 *   - A page-level `openGraph` REPLACES the layout's rather than deep-merging,
 *     which would otherwise drop `type`/`siteName` and the file-convention image.
 *     So we re-declare the full object (including the shared card) on every page.
 */
export function pageMeta({ title, description, path, noindex }: PageMetaInput): Metadata {
  // For social cards, spell out the full "Title · Help Me Invest"; on home
  // (no title) use the bare site name.
  const socialTitle = title ? `${title} · ${SITE.name}` : SITE.name;

  return {
    ...(title ? { title } : {}),
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: "en_AU",
      title: socialTitle,
      description,
      images: [OG_IMAGE],
      ...(path ? { url: path } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
