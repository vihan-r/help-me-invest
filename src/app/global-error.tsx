"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for crashes that fire *above* the root layout (e.g. an
 * error in `layout.tsx` itself). It replaces the entire document, so it must
 * render its own <html>/<body> and cannot rely on globals.css — styling is
 * inlined with the brand palette. In-app errors are handled by the per-group
 * boundaries: (site)/error.tsx and (auth)/error.tsx.
 */
export default function GlobalError({
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
    <html lang="en-AU">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A4B34",
          color: "#F6F7F4",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: 13,
              opacity: 0.7,
              margin: 0,
            }}
          >
            Something went wrong
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 600, margin: "12px 0 0" }}>The site hit a snag</h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, margin: "16px 0 28px", opacity: 0.9 }}>
            A critical error stopped the page from loading. Try again, or come back shortly.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              border: "none",
              borderRadius: 10,
              background: "#F6F7F4",
              color: "#0A4B34",
              fontFamily: "inherit",
              fontWeight: 500,
              fontSize: 16,
              padding: "14px 26px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
