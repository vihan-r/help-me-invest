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
 * The HMI wordmark: the supplied "h" mark artwork paired with the lockup
 * "help me" (Bold 700) + "invest" (Medium 500), lowercase, single line.
 * Construction mirrors `Help Me Invest Website v3` exactly.
 */
export function Wordmark({ colour = "emerald", size = 18, href = "/" }: WordmarkProps) {
  return (
    <Link
      href={href}
      aria-label="help me invest, home"
      className="brand-lockup"
      style={{ color: COLOUR_VAR[colour], fontSize: `${size}px` }}
    >
      <span
        className="brand-mark"
        aria-hidden="true"
        style={{ backgroundImage: "url(/logos/hmi-mark.png)" }}
      />
      <span style={{ display: "inline-flex", alignItems: "baseline", gap: "0.18em" }}>
        <span style={{ fontWeight: 700 }}>help me</span>
        <span style={{ fontWeight: 500 }}>invest</span>
      </span>
    </Link>
  );
}
