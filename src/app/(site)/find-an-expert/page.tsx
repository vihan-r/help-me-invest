import { ExpertForm } from "@/components";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Talk to an expert",
  description:
    "Tell us what you're trying to do and we'll introduce you to a partner we vouch for — chosen on merit, paid transparently.",
  path: "/find-an-expert",
});

export default function FindAnExpert() {
  return (
    <main id="main-content" tabIndex={-1}>
      {/* Header */}
      <section className="shell" style={{ paddingTop: 64, paddingBottom: 56 }}>
        <p className="eyebrow">Talk to an expert</p>
        <h1 className="d1 col-display" style={{ marginTop: 16 }}>
          Get matched with the <em>right expert.</em>
        </h1>
        <p className="body-large col-body" style={{ marginTop: 32 }}>
          Tell us, in a few short answers, what you&rsquo;re trying to do. One of our team will read
          it, then call you back to introduce you to a partner we vouch for — chosen on merit, paid
          transparently, held to the outcome.
        </p>
      </section>

      {/* Video */}
      <section className="shell" style={{ paddingTop: 0, paddingBottom: 56 }}>
        <div className="col-body">
          <div className="video-placeholder" aria-label="Play video">
            <div className="video-play" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2.5v11l10-5.5z" />
              </svg>
            </div>
            <span className="video-duration">02:00</span>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="shell" style={{ paddingBottom: 64 }}>
        <div className="col-body">
          <ExpertForm />
        </div>
      </section>

      {/* What happens next */}
      <section className="bg-lighter-mint" style={{ padding: "80px 0" }}>
        <div className="shell">
          <h2 className="h2 col-display">
            What happens <em>after you send this.</em>
          </h2>
          <div className="grid-3" style={{ marginTop: 48 }}>
            <div>
              <h3 className="h4">1 · We read it.</h3>
              <p className="body" style={{ marginTop: 12 }}>
                One of our team — not a script, not a triage bot — reads what you&rsquo;ve written
                and works out who&rsquo;s the right partner for it.
              </p>
            </div>
            <div>
              <h3 className="h4">2 · We call you back.</h3>
              <p className="body" style={{ marginTop: 12 }}>
                To confirm what you&rsquo;re after, suggest the partner we think fits, and check
                that you&rsquo;re comfortable proceeding.
              </p>
            </div>
            <div>
              <h3 className="h4">3 · You decide.</h3>
              <p className="body" style={{ marginTop: 12 }}>
                The introduction only happens if you want it. You see the partner&rsquo;s payment
                arrangement before you commit. Help is offered, never imposed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
