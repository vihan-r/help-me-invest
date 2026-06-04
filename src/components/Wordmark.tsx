import Link from "next/link";

type WordmarkColour = "emerald" | "paper" | "grey";

const COLOUR_VAR: Record<WordmarkColour, string> = {
  emerald: "var(--color-emerald)",
  paper: "var(--color-paper)",
  grey: "var(--color-grey)",
};

export interface WordmarkProps {
  /** Ink colour. Emerald on light grounds, Paper on Emerald grounds. */
  colour?: WordmarkColour;
  /** Font size in px; the mark scales with it (1.5em). Default 18. */
  size?: number;
  /** Link target. Defaults to home. */
  href?: string;
}

/**
 * The HMI wordmark: the "h" mark paired with the lockup "help me" (Bold 700) +
 * "invest" (Medium 500), lowercase, single line. The colourway is driven by the
 * `colour` prop — Emerald on light grounds, Soft Paper on Emerald — and applied
 * via `currentColor`, so there is no background/box behind the mark on any ground.
 */
export function Wordmark({ colour = "emerald", size = 18, href = "/" }: WordmarkProps) {
  return (
    <Link
      href={href}
      aria-label="help me invest, home"
      className="brand-lockup"
      style={{ color: COLOUR_VAR[colour], fontSize: `${size}px` }}
    >
      {/*
        TODO(FEAT-21): The real "h" mark is a transparent SVG still owed by the
        client. This is a PLACEHOLDER, not the mark. When the SVG arrives, drop
        the supplied <path> in here with fill="currentColor" and delete the
        placeholder <rect>. Nothing else needs to change: colourway and sizing
        are already handled via currentColor + the .brand-mark sizing, so the
        mark will reverse correctly (Emerald on light, Soft Paper on Emerald)
        with no box on any ground.
      */}
      <svg
        className="brand-mark"
        viewBox="0 0 24 24"
        fill="none"
        role="img"
        aria-label="HMI mark — placeholder, final SVG pending"
      >
        <rect
          x="1.5"
          y="1.5"
          width="21"
          height="21"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.55"
        />
      </svg>
      <span style={{ display: "inline-flex", alignItems: "baseline", gap: "0.18em" }}>
        <span style={{ fontWeight: 700 }}>help me</span>
        <span style={{ fontWeight: 500 }}>invest</span>
      </span>
    </Link>
  );
}
