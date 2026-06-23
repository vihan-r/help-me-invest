import { sanityFetch } from "./fetch";
import { MODULES_BY_TOPIC_QUERY, type Module } from "./queries";

export const WHOLESALE_SLUG = "wholesale";

// Placeholder durations for the gated "rest of the series" — shown until real
// account-gated modules are added to the CMS, so the sign-up wall and the module
// pages stay populated. Mirrors the design reference (education/module.html).
const PLACEHOLDER_DURATIONS = ["11:02", "09:48", "14:15", "10:30", "12:50", "07:20", "15:40"];

export interface SeriesRow {
  index: number;
  title: string;
  duration?: string;
  blurb: string;
  isPlaceholder: boolean;
}

export interface Series {
  /** The free intro module (Module 01) shown as the hero, if any. */
  hero: SeriesRow | null;
  /** The account-gated rest of the series (real modules, or placeholders). */
  rest: SeriesRow[];
}

function placeholderRest(): SeriesRow[] {
  return PLACEHOLDER_DURATIONS.map((duration, i) => ({
    index: i + 2,
    title: "Module title placeholder.",
    duration,
    blurb: "A short description of the module goes here.",
    isPlaceholder: true,
  }));
}

function toRow(m: Module): SeriesRow {
  return {
    index: m.moduleNumber,
    title: m.title,
    duration: m.duration,
    blurb: m.blurb ?? "",
    isPlaceholder: false,
  };
}

/**
 * The Wholesale series as the topic page and the module pages both consume it:
 * the free hero (Module 01) plus the account-gated rest. `accessLevel` drives
 * the split; when no real gated modules exist yet, the rest falls back to
 * placeholders so the funnel + module pages stay intact.
 */
export async function getWholesaleSeries(): Promise<Series> {
  const modules = await sanityFetch<Module[]>(MODULES_BY_TOPIC_QUERY, { slug: WHOLESALE_SLUG });

  const free = modules.filter((m) => m.accessLevel === "free");
  const gated = modules.filter((m) => m.accessLevel === "account");

  return {
    hero: free[0] ? toRow(free[0]) : null,
    rest: gated.length ? gated.map(toRow) : placeholderRest(),
  };
}
