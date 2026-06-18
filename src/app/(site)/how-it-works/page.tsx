import { Arrow, Button, Placeholder } from "@/components";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "How it works",
  description:
    "How Help Me Invest works — self-assess, learn, decide whether you need help, and execute. Every fee named on the page; walking away costs nothing.",
  path: "/how-it-works",
});

export default function HowItWorks() {
  return (
    <>
      {/* Hero */}
      <section className="shell pt-20 pb-24">
        <p className="eyebrow mb-6">How it works</p>
        <h1 className="d1 col-display">A platform built around the investor.</h1>
        <p className="body-large col-body mt-10">
          Learn what property investing actually involves, decide whether you need help with any of
          it, and only pay if you do. Every fee is named on this page. Walking away costs nothing at
          any point.
        </p>
        <Placeholder ratio="16x9" label="[ Cover image ]" style={{ marginTop: 56 }} />
      </section>

      {/* High-level journey diagram */}
      <section className="shell pt-2 pb-8">
        <p className="eyebrow mb-6">The journey, end to end</p>
        <div className="journey">
          <div className="journey-step">
            <p className="journey-label">Self assess</p>
            <p className="journey-sub">See where you stand, and where you want to be.</p>
          </div>
          <div className="journey-arrow" aria-hidden="true">
            →
          </div>
          <div className="journey-step">
            <p className="journey-label">Learn</p>
            <p className="journey-sub">How property investing actually works.</p>
          </div>
          <div className="journey-arrow" aria-hidden="true">
            →
          </div>
          <div className="journey-step journey-step--optional">
            <p className="journey-eyebrow">Optional, in between</p>
            <p className="journey-label">Seek help</p>
            <p className="journey-sub">Bring in an expert for a specific decision.</p>
          </div>
          <div className="journey-arrow" aria-hidden="true">
            →
          </div>
          <div className="journey-step">
            <p className="journey-label">Execute</p>
            <p className="journey-sub">Move on the property, with or without help.</p>
          </div>
        </div>
      </section>

      {/* The path — the four phases */}
      <section className="shell">
        <header className="mb-2">
          <p className="eyebrow mb-6">The path</p>
          <h2 className="h1">How it works.</h2>
        </header>

        {/* Phase 1 — Self assess */}
        <article className="phase">
          <div className="phase-grid">
            <div className="phase-meta">
              <p className="phase-numeral">01</p>
              <p className="phase-tag">Self assess</p>
              <hr className="phase-divider" />
              <p className="phase-cost">Free. No sign-up fee.</p>
              <p className="phase-cost-sub">Create a free account. Takes under five minutes.</p>
            </div>
            <div className="phase-body">
              <h3 className="phase-headline">Start with where you stand.</h3>
              <p className="phase-lede">
                Before anything else, take the self-assessment. It&rsquo;s not just a set of
                questions, it&rsquo;s a predictive model we&rsquo;ve built, giving you clarity on
                where you are today, where you want to be by the time you retire, and what it takes
                to close the gap.
              </p>
              <ol className="phase-steps">
                <li>
                  <p>
                    Map where you stand today, income, equity, borrowing position, and what you
                    already own.
                  </p>
                </li>
                <li>
                  <p>
                    Picture where you want to be at retirement, the income you&rsquo;ll want, and
                    the assets it takes to fund it.
                  </p>
                </li>
                <li>
                  <p>
                    See the gap between the two, and the broad shape of what it takes to close it.
                    That becomes the backdrop for everything you learn next.
                  </p>
                </li>
              </ol>
              <div className="mt-10">
                <Button variant="primary" href="/self-assessment">
                  Start self assessment <Arrow />
                </Button>
              </div>
            </div>
          </div>
        </article>

        {/* Phase 2 — Learn */}
        <article className="phase">
          <div className="phase-grid">
            <div className="phase-meta">
              <p className="phase-numeral">02</p>
              <p className="phase-tag">Learn</p>
              <hr className="phase-divider" />
              <p className="phase-cost">Free. No paywall.</p>
              <p className="phase-cost-sub">No credit card. No qualifying call.</p>
            </div>
            <div className="phase-body">
              <h3 className="phase-headline">Learn how property investing actually works.</h3>
              <p className="phase-lede">
                Sign up with an email and a password. The whole library opens, lessons, frameworks,
                calculators, and the parts of the market that the chain has kept quiet about. Read
                what you need, when you need it.
              </p>
              <ol className="phase-steps">
                <li>
                  <p>
                    Create a free account. Email and password, that&rsquo;s the whole form. No
                    qualifying call, no &ldquo;tell us about yourself&rdquo;, no credit card to hold
                    against the trial.
                  </p>
                </li>
                <li>
                  <p>
                    The full library is yours. Wholesale property, finance structure, area analysis,
                    depreciation, where developers hide their margins, what each partner is actually
                    worth paying for, all of it taught openly, in plain English.
                  </p>
                </li>
                <li>
                  <p>
                    No paywall. No &ldquo;premium tier.&rdquo; No nudge toward a paid product. Most
                    customers won&rsquo;t need help with most things, and the platform&rsquo;s job
                    is to make sure of that.
                  </p>
                </li>
                <li>
                  <p>
                    If you hit something that needs an expert, you can request a call. That moves
                    you into Seek help, and it&rsquo;s still free.
                  </p>
                </li>
              </ol>
              <div className="mt-10">
                <Button variant="primary" href="/education">
                  Start learning <Arrow />
                </Button>
              </div>
            </div>
          </div>
        </article>

        {/* Phase 3 — Seek help */}
        <article className="phase">
          <div className="phase-grid">
            <div className="phase-meta">
              <p className="phase-numeral">03</p>
              <p className="phase-tag">Seek help</p>
              <hr className="phase-divider" />
              <p className="phase-cost">Free. No commitment.</p>
              <p className="phase-cost-sub">A call with our team, not a sales rep.</p>
            </div>
            <div className="phase-body">
              <h3 className="phase-headline">Decide whether you actually need help.</h3>
              <p className="phase-lede">
                When a decision needs specific help, request a call. One of our team rings you back
                within a day. The job of the call is to work out whether we&rsquo;re the right fit,
                not to sign you up.
              </p>
              <ol className="phase-steps">
                <li>
                  <p>
                    You request a call from inside the library. We ring back within 24 hours. One of
                    our team picks up the phone, not a sales rep, not a triage bot.
                  </p>
                </li>
                <li>
                  <p>
                    The call is to understand where you&rsquo;re at: what you&rsquo;ve read, what
                    you&rsquo;ve worked out, and what kind of help would actually move you forward.
                  </p>
                </li>
                <li>
                  <p>
                    If we&rsquo;re not the right fit, you don&rsquo;t need help, or the work
                    isn&rsquo;t work we do, we tell you. We&rsquo;d rather lose the engagement than
                    waste your money.
                  </p>
                </li>
                <li>
                  <p>
                    If we are the right fit, we walk you through Phase 4 in plain English. Every
                    fee, every step, what changes when you commit, what stays the same. You decide
                    whether to proceed at the end of the call, not on it.
                  </p>
                </li>
              </ol>
              <div className="mt-10">
                <Button variant="primary" href="/find-an-expert">
                  Get help from an expert <Arrow />
                </Button>
              </div>
            </div>
          </div>
        </article>

        {/* Phase 4 — Execute */}
        <article className="phase">
          <div className="phase-grid">
            <div className="phase-meta">
              <p className="phase-numeral">04</p>
              <p className="phase-tag">Execute</p>
              <hr className="phase-divider" />
              <p className="phase-cost">Service fee</p>
              <p className="phase-cost-sub">
                A flat fee for the work, only if you choose to get our help.
              </p>
            </div>
            <div className="phase-body">
              <h3 className="phase-headline">Execute with confidence.</h3>
              <p className="phase-lede">
                If you chose to get help from our experts our process is simple. We always execute
                alongside you, never in front of you. We build the finance strategy first, then the
                property strategy if you want it. Two fees, both visible.
              </p>
              <div className="fee-card">
                <p className="fee-card-figure">$2,000</p>
                <p className="fee-card-label">Service fee</p>
                <p className="fee-card-body">
                  Paid once, only if you decide you&rsquo;d like our help. A flat service fee for
                  the work we do, the finance strategy and, if you want it, sourcing your property.
                </p>
              </div>
              <ol className="phase-steps">
                <li>
                  <p>
                    We build the finance strategy first. How much you can borrow, how the loan
                    should be structured, which lenders fit your circumstances. Covered by the
                    service fee.
                  </p>
                </li>
                <li>
                  <p>
                    If you want to proceed to property strategy, area analysis, property selection,
                    acquisition planning, we do that next. Also covered by the service fee.
                  </p>
                </li>
                <li>
                  <p>
                    You choose where the property comes from. Source it yourself using what
                    you&rsquo;ve learned, or have us source from the wholesale network. Both are
                    valid paths. Neither is the &ldquo;real&rdquo; one.
                  </p>
                </li>
                <li>
                  <p>
                    If we source the property, Help Me Invest charges the developer a fixed
                    marketing fee. You don&rsquo;t pay it directly.
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </article>
      </section>

      {/* Closing */}
      <section className="shell pt-30 pb-40">
        <div className="col-body stack-md">
          <h2 className="h1">Start where you are.</h2>
          <p className="body-large">
            The self-assessment and the whole library are free, forever. You don&rsquo;t need to
            know what you&rsquo;re looking for before you start, they&rsquo;re built so you can find
            out.
          </p>
        </div>
        <div className="mt-12">
          <Button variant="primary" href="/self-assessment">
            Take the self-assessment <Arrow />
          </Button>
        </div>
      </section>
    </>
  );
}
