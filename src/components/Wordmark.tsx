import Link from "next/link";

type WordmarkColour = "emerald" | "paper" | "grey";

const COLOUR_VAR: Record<WordmarkColour, string> = {
  emerald: "var(--color-emerald)",
  paper: "var(--color-paper)",
  grey: "var(--color-grey)",
};

// The colourway implies the ground the wordmark sits on: Soft Paper ink is used
// on Emerald grounds; Emerald/Grey ink on light (Soft Paper) grounds.
type Ground = "light" | "emerald";
const GROUND_BY_COLOUR: Record<WordmarkColour, Ground> = {
  emerald: "light",
  grey: "light",
  paper: "emerald",
};

/*
 * INTERIM: the 'h' mark is swapped by ground using opaque PNGs (each with a
 * baked-in background), because we don't yet have a recolourable asset.
 *   - light:   green 'h' on off-white  (have it)
 *   - emerald: white 'h' on green      (OWED by client — drop at the path below)
 * A `null` entry falls back to the labelled placeholder so nothing renders broken.
 *
 * TODO(FEAT-21): Replace BOTH PNGs with the single transparent 'h' SVG (still
 * owed by the client). Inline it with fill="currentColor" so the mark recolours
 * with the wordmark on any ground and no per-ground files / baked backgrounds
 * are needed. The placeholder branch below shows the intended currentColor wiring.
 */
const MARK_PNG: Record<Ground, string | null> = {
  light: "/logos/hmi-mark-on-light.png",
  emerald: null, // -> "/logos/hmi-mark-on-emerald.png" once supplied
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
 * "invest" (Medium 500), lowercase, single line. The text colourway is driven by
 * `colour`; the mark image is swapped by ground (see MARK_PNG).
 */
export function Wordmark({ colour = "emerald", size = 18, href = "/" }: WordmarkProps) {
  const ground = GROUND_BY_COLOUR[colour];
  const markSrc = MARK_PNG[ground];

  return (
    <Link
      href={href}
      aria-label="help me invest, home"
      className="brand-lockup"
      style={{ color: COLOUR_VAR[colour], fontSize: `${size}px` }}
    >
      {markSrc ? (
        <span
          className="brand-mark"
          aria-hidden="true"
          style={{
            backgroundImage: `url(${markSrc})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      ) : (
        // Placeholder for grounds we don't yet have a PNG for (Emerald). Reverses
        // via currentColor; no box. This is the wiring the final SVG will reuse.
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
      )}
      <span style={{ display: "inline-flex", alignItems: "baseline", gap: "0.18em" }}>
        <span style={{ fontWeight: 700 }}>help me</span>
        <span style={{ fontWeight: 500 }}>invest</span>
      </span>
    </Link>
  );
}
