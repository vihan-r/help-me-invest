import Link from "next/link";
import { Arrow } from "@/components";
import { pageMeta } from "@/lib/seo";
import { safeInternalPath } from "@/lib/safe-redirect";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = pageMeta({
  title: "Reset password",
  description: "Reset the password for your Help Me Invest account.",
  path: "/reset-password",
  noindex: true,
});

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const redirectUrl = safeInternalPath((await searchParams).redirect_url);
  return (
    <>
      <section className="account-shell pt-16 pb-30">
        <div className="account-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="account-form">
            <p className="eyebrow">Account</p>
            <h1 className="d1 mt-3.5">
              Reset your <em>password.</em>
            </h1>
            <p className="body-large mt-6 max-w-[520px]">
              Enter the email you use for Help Me Invest and we&rsquo;ll send you a 6-digit code to
              set a new password. The code expires in an hour.
            </p>

            <ResetPasswordForm redirectUrl={redirectUrl} />

            <p className="mt-7 text-center">
              <Link className="tertiary-link" href="/sign-in">
                Remembered it? Back to sign in <Arrow />
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
