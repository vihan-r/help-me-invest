"use client";

import { useEffect } from "react";
import { Button, Container } from "@/components";

/**
 * Error boundary for the public/content pages. It renders *inside* (site)/layout,
 * so the header and footer chrome are already present — this only replaces the
 * page body. Root-layout/global crashes are caught by app/global-error.tsx.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced to the console for now; wired to error reporting in Phase 2.
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" tabIndex={-1} className="flex-1">
      <Container width="body" className="py-2xl">
        <p className="eyebrow mb-sm">Something went wrong</p>
        <h1 className="h1">This page hit a snag</h1>
        <p className="body-large mt-md">
          Sorry about that. You can try again, or head back to safe ground.
        </p>
        <div className="mt-lg flex flex-wrap gap-md">
          <Button variant="primary" onClick={() => reset()}>
            Try again
          </Button>
          <Button variant="secondary" href="/">
            Back to home
          </Button>
        </div>
      </Container>
    </main>
  );
}
