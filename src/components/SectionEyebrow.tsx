import type { ReactNode } from "react";

/** Structural section label, preceded by a short Warm Mid-Grey rule. */
export function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="section-eyebrow">{children}</p>;
}
