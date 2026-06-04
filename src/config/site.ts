/**
 * Site-wide configuration for the shell: identity, primary navigation, and
 * footer link groups. Nav structure and labels mirror the design source of
 * truth (`Help Me Invest Website v3`).
 */

export const SITE = {
  name: "Help Me Invest",
  description:
    "Help Me Invest helps everyday Australians invest in property on their own terms — learn how property investing works, then choose how you want help.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export interface NavItem {
  label: string;
  href: string;
}

/** Primary header navigation. */
export const PRIMARY_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Partners", href: "/partners" },
  { label: "Investor Stories", href: "/success-stories" },
  { label: "Education", href: "/education" },
];

/** Footer "Site" column. */
export const FOOTER_SITE: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Partners", href: "/partners" },
  { label: "Investor Stories", href: "/success-stories" },
  { label: "Education", href: "/education" },
  { label: "Talk to an expert", href: "/find-an-expert" },
  { label: "Contact", href: "/contact" },
];

/** Footer "Legal" column. */
export const FOOTER_LEGAL: NavItem[] = [
  { label: "Terms and conditions", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
];

/**
 * Footer registered-entity line. ABN and address are placeholders from the
 * design source pending real details; the year is rendered dynamically.
 */
export const FOOTER_ENTITY =
  "Help Me Invest Pty Ltd · ABN 00 000 000 000 · Level 4, 100 Collins Street, Melbourne VIC 3000";
