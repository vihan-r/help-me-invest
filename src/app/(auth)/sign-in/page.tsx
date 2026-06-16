import Link from "next/link";
import { Arrow, Button } from "@/components";
import { pageMeta } from "@/lib/seo";
import { SignInForm } from "./SignInForm";

export const metadata = pageMeta({
  title: "Sign in",
  description: "Sign in to your Help Me Invest account.",
  path: "/sign-in",
  noindex: true,
});

export default function SignIn() {
  return (
    <main id="main-content" tabIndex={-1}>
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

            <SignInForm />

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
