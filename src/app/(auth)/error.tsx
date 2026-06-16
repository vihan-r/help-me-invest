"use client";

import { useEffect } from "react";
import { Button, Container } from "@/components";

/**
 * Error boundary for the auth screens. Renders inside (auth)/layout, which keeps
 * the minimal wordmark-only chrome; this replaces only the screen body.
 */
export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" tabIndex={-1}>
      <Container width="body" className="py-2xl">
        <p className="eyebrow mb-sm">Something went wrong</p>
        <h1 className="h1">This screen hit a snag</h1>
        <p className="body-large mt-md">Please try again, or head back to sign in.</p>
        <div className="mt-lg flex flex-wrap gap-md">
          <Button variant="primary" onClick={() => reset()}>
            Try again
          </Button>
          <Button variant="secondary" href="/sign-in">
            Back to sign in
          </Button>
        </div>
      </Container>
    </main>
  );
}
