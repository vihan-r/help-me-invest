import type { ReactNode } from "react";
import { Container } from "./Container";

export interface PagePlaceholderProps {
  /** Small structural eyebrow (usually the section/area name). */
  eyebrow: string;
  /** Page headline. */
  title: string;
  /** Optional supporting line. Falls back to a generic shell note. */
  children?: ReactNode;
}

/**
 * Stage 2 route stub. Renders a route's shell (header/footer come from the
 * layout) with an on-brand heading so navigation is fully clickable before the
 * page's real content is built in a later stage.
 */
export function PagePlaceholder({ eyebrow, title, children }: PagePlaceholderProps) {
  return (
    <main id="main-content" tabIndex={-1} className="flex-1">
      <Container width="body" className="py-2xl">
        <p className="eyebrow mb-sm">{eyebrow}</p>
        <h1 className="h1">{title}</h1>
        <p className="body-large mt-md">
          {children ?? "This page is part of the Help Me Invest MVP and is built in a later stage."}
        </p>
      </Container>
    </main>
  );
}
