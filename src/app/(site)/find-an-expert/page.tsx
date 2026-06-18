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
    <>
      {/* Header */}
      <section className="shell pt-16 pb-14">
        <p className="eyebrow">Talk to an expert</p>
        <h1 className="d1 col-display mt-4">
          Get matched with the <em>right expert.</em>
        </h1>
        <p className="body-large col-body mt-8">
          Tell us, in a few short answers, what you&rsquo;re trying to do. One of our team will read
          it, then call you back to introduce you to a partner we vouch for — chosen on merit, paid
          transparently, held to the outcome.
        </p>
      </section>

      {/* Video */}
      <section className="shell pt-0 pb-14">
        <div className="col-body">
          <button type="button" className="video-placeholder" aria-label="Play the intro video">
            <span className="video-play" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2.5v11l10-5.5z" />
              </svg>
            </span>
            <span className="video-duration">02:00</span>
          </button>
        </div>
      </section>

      {/* Form */}
      <section className="shell pb-16">
        <div className="col-body">
          <ExpertForm />
        </div>
      </section>

      {/* What happens next */}
      <section className="bg-lighter-mint py-20">
        <div className="shell">
          <h2 className="h2 col-display">
            What happens <em>after you send this.</em>
          </h2>
          <div className="grid-3 mt-12">
            <div>
              <h3 className="h4">1 · We read it.</h3>
              <p className="body mt-3">
                One of our team — not a script, not a triage bot — reads what you&rsquo;ve written
                and works out who&rsquo;s the right partner for it.
              </p>
            </div>
            <div>
              <h3 className="h4">2 · We call you back.</h3>
              <p className="body mt-3">
                To confirm what you&rsquo;re after, suggest the partner we think fits, and check
                that you&rsquo;re comfortable proceeding.
              </p>
            </div>
            <div>
              <h3 className="h4">3 · You decide.</h3>
              <p className="body mt-3">
                The introduction only happens if you want it. You see the partner&rsquo;s payment
                arrangement before you commit. Help is offered, never imposed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
