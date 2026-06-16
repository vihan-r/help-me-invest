import Link from "next/link";
import { Arrow } from "@/components";
import { pageMeta } from "@/lib/seo";
import { VerifyEmailActions } from "./VerifyEmailActions";

export const metadata = pageMeta({
  title: "Verify your email",
  description: "Confirm your email address to finish setting up your Help Me Invest account.",
  path: "/verify-email",
  noindex: true,
});

export default function VerifyEmail() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="account-shell" style={{ paddingTop: 64, paddingBottom: 120 }}>
        <div className="account-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="account-form">
            <p className="eyebrow">One last step</p>
            <h1 className="d1" style={{ marginTop: 14 }}>
              Check your <em>inbox.</em>
            </h1>
            <p className="body-large" style={{ marginTop: 24, maxWidth: 520 }}>
              We&rsquo;ve sent a verification link to your email. Open it to confirm your address and
              unlock the full library. It can take a minute to arrive.
            </p>

            <div
              className="bg-lighter-mint"
              style={{ borderRadius: 14, padding: "20px 22px", marginTop: 32 }}
            >
              <p className="body-small">
                Can&rsquo;t find it? Check your spam folder, or resend the link below. The link
                expires in 24 hours.
              </p>
            </div>

            <VerifyEmailActions />

            <p style={{ marginTop: 28, textAlign: "center" }}>
              <Link className="tertiary-link" href="/sign-in">
                Already verified? Sign in <Arrow />
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
