import Link from "next/link";
import type { ReactNode } from "react";

export interface PillarsProps {
  children: ReactNode;
}

/** Three-up grid of pillar cards (the home "what we do" section). */
export function Pillars({ children }: PillarsProps) {
  return <div className="whatwedo-grid whatwedo-grid--carded">{children}</div>;
}

export interface PillarProps {
  /** Two-digit ordinal, e.g. "01". Hidden in the filled (carded) variant. */
  number: string;
  /** Headline; may include an <em> for the accent word (rendered plain). */
  headline: ReactNode;
  body: ReactNode;
  linkLabel: string;
  href: string;
}

/** A single pillar card (Lighter Mint filled variant). */
export function Pillar({ number, headline, body, linkLabel, href }: PillarProps) {
  return (
    <Link className="whatwedo-card whatwedo-card--filled" href={href} data-reveal="">
      <span className="whatwedo-card-number">{number}</span>
      <h3 className="whatwedo-card-headline">{headline}</h3>
      <p className="whatwedo-card-body">{body}</p>
      <p className="whatwedo-card-link">{linkLabel} →</p>
    </Link>
  );
}
