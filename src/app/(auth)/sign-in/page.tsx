import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, Button } from "@/components";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Help Me Invest account.",
};

export default function SignIn() {
  return (
    <main>
      <section className="account-shell" style={{ paddingTop: 64, paddingBottom: 120 }}>
        <div className="account-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="account-form">
            <p className="eyebrow">Welcome back</p>
            <h1 className="d1" style={{ marginTop: 14 }}>
              Sign in to your <em>account.</em>
            </h1>
            <p className="body-large" style={{ marginTop: 24, maxWidth: 520 }}>
              Pick up where you left off in the library. Your saved progress and notes are here
              waiting.
            </p>

            <form className="stack-md" style={{ marginTop: 40 }}>
              <div className="field">
                <label htmlFor="email">What email do you use?</label>
                <input id="email" name="email" type="email" autoComplete="email" />
              </div>

              <div className="field">
                <label htmlFor="password">Your password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                />
                <p className="field-help">
                  <Link className="inline-link" href="/reset-password">
                    Forgot your password?
                  </Link>
                </p>
              </div>

              <div style={{ marginTop: 16 }}>
                <Button variant="primary" type="button">
                  Sign in <Arrow />
                </Button>
              </div>
            </form>

            <div className="divider-or">
              <span>or</span>
            </div>

            <Button variant="secondary" type="button">
              Continue with Google
            </Button>

            <p style={{ marginTop: 28, textAlign: "center" }}>
              <Link className="tertiary-link" href="/sign-up">
                Don&rsquo;t have an account yet? Create one <Arrow />
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
