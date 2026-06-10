import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, Button } from "@/components";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your free Help Me Invest account.",
};

export default function SignUp() {
  return (
    <main>
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

            <form className="stack-md" style={{ marginTop: 40 }}>
              <div className="field">
                <label htmlFor="first-name">What&rsquo;s your first name?</label>
                <input id="first-name" name="first-name" type="text" autoComplete="given-name" />
              </div>

              <div className="field">
                <label htmlFor="email">What email should we use?</label>
                <input id="email" name="email" type="email" autoComplete="email" />
              </div>

              <div className="field">
                <label htmlFor="password">Choose a password</label>
                <input id="password" name="password" type="password" autoComplete="new-password" />
                <p className="field-help">
                  At least 8 characters. We&rsquo;ll never email it to you.
                </p>
              </div>

              <div className="field">
                <label>Where are you in your investing journey?</label>
                <div className="field-radio-group">
                  <label className="field-radio">
                    <input type="radio" name="stage" defaultChecked />
                    <span>Just exploring, I want to understand how property investing works.</span>
                  </label>
                  <label className="field-radio">
                    <input type="radio" name="stage" />
                    <span>Saving for my first investment property.</span>
                  </label>
                  <label className="field-radio">
                    <input type="radio" name="stage" />
                    <span>Ready to buy my first investment property.</span>
                  </label>
                  <label className="field-radio">
                    <input type="radio" name="stage" />
                    <span>I already own one or more investment properties.</span>
                  </label>
                </div>
              </div>

              <div style={{ marginTop: 32 }}>
                <Button variant="primary" type="button">
                  Create my account <Arrow />
                </Button>
                <p className="terms-line">
                  By creating an account, you agree to our <Link href="/terms">terms</Link> and{" "}
                  <Link href="/privacy">privacy notice</Link>.
                </p>
              </div>
            </form>

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
