import Link from "next/link";
import { Arrow, Button } from "@/components";
import { pageMeta } from "@/lib/seo";
import { SignUpForm } from "./SignUpForm";

export const metadata = pageMeta({
  title: "Create account",
  description: "Create your free Help Me Invest account.",
  path: "/sign-up",
  noindex: true,
});

export default function SignUp() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="account-shell" style={{ paddingTop: 64, paddingBottom: 120 }}>
        <div className="account-grid">
          {/* The form */}
          <div className="account-form">
            <p className="eyebrow">Free account · 30 seconds</p>
            <h1 className="d1" style={{ marginTop: 14 }}>
              Create your <em>account.</em>
            </h1>
            <p className="body-large" style={{ marginTop: 24, maxWidth: 520 }}>
              A free account so you can keep going through the library and, when you&rsquo;re ready,
              talk to the partners we vouch for. We&rsquo;ll never share your details.
            </p>

            <SignUpForm />

            <div className="divider-or">
              <span>or</span>
            </div>

            <Button variant="secondary" type="button">
              Continue with Google
            </Button>

            <p style={{ marginTop: 28, textAlign: "center" }}>
              <Link className="tertiary-link" href="/sign-in">
                Already have an account? Sign in <Arrow />
              </Link>
            </p>
          </div>

          {/* Context panel */}
          <aside className="account-context">
            <p className="eyebrow">What the account does</p>
            <ul className="context-list">
              <li>
                Unlocks access to insider knowledge through the Help Me Invest educational library.
              </li>
              <li>Connects you to partners when you&rsquo;re ready, never before.</li>
              <li>Start building your property strategy through our self-assessment tool.</li>
            </ul>
            <hr />
            <p className="context-foot">
              The account is free. It always will be. We make money when you choose to work with a
              partner, and we show you exactly how much, before you decide.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
