"use client";

import { useEffect } from "react";
import { Button, Container, SiteFooter, SiteHeader } from "@/components";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced to the console for now; wired to analytics/error reporting in Phase 2.
    console.error(error);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
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
      <SiteFooter />
    </>
  );
}
