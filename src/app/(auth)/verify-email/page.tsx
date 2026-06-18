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
    <>
      <section className="account-shell pt-16 pb-30">
        <div className="account-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="account-form">
            <p className="eyebrow">One last step</p>
            <h1 className="d1 mt-3.5">
              Check your <em>inbox.</em>
            </h1>
            <p className="body-large mt-6 max-w-[520px]">
              We&rsquo;ve sent a verification link to your email. Open it to confirm your address
              and unlock the full library. It can take a minute to arrive.
            </p>

            <div className="bg-lighter-mint rounded-lg py-5 px-[22px] mt-8">
              <p className="body-small">
                Can&rsquo;t find it? Check your spam folder, or resend the link below. The link
                expires in 24 hours.
              </p>
            </div>

            <VerifyEmailActions />

            <p className="mt-7 text-center">
              <Link className="tertiary-link" href="/sign-in">
                Already verified? Sign in <Arrow />
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
