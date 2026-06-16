"use client";

import { useState } from "react";
import { Arrow } from "@/components/Arrow";
import { Button } from "@/components/Button";

/**
 * Resend control for the verify-email screen. There is no form here — the action
 * is a single button — so the fix (vs. an inert button) is a real click handler
 * plus an aria-live confirmation. Phase 2 swaps the handler body for the Clerk
 * resend call.
 */
export function VerifyEmailActions() {
  const [sent, setSent] = useState(false);

  const resend = () => {
    // No backend yet — Phase 2 triggers the Clerk resend here.
    setSent(true);
  };

  return (
    <div style={{ marginTop: 32 }}>
      <Button variant="primary" type="button" onClick={resend}>
        Resend verification email <Arrow />
      </Button>
      <p className="field-help" style={{ marginTop: 14 }} role="status" aria-live="polite">
        {sent ? "Sent — a fresh verification link is on its way." : ""}
      </p>
    </div>
  );
}
