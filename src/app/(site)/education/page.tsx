import Link from "next/link";
import type { ReactNode } from "react";
import { Arrow, Button, TertiaryLink } from "@/components";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Education",
  description:
    "Everything you need to invest in property yourself — taught openly, no paywall on the knowledge. You decide what you need, when you need it.",
  path: "/education",
});

function Topic({
  title,
  blurb,
  href,
  meta,
  thumbDuration,
}: {
  title: string;
  blurb: ReactNode;
  href: string;
  meta: string;
  thumbDuration: string;
}) {
  return (
    <article className="topic">
      <div>
        <h2 className="h2">{title}</h2>
        <p className="body-large" style={{ marginTop: 20, maxWidth: 720 }}>
          {blurb}
        </p>
        <p style={{ marginTop: 24 }}>
          <TertiaryLink href={href}>
            Start with this <Arrow />
          </TertiaryLink>
        </p>
      </div>
      <div className="topic-right">
        <Link
          className="hero-video topic-thumb"
          href={href}
          aria-label={`Watch Module 01 of ${title}`}
        >
          <div className="video-play" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2.5v11l10-5.5z" />
            </svg>
          </div>
          <span className="hero-video-badge">Module 01 · {thumbDuration}</span>
        </Link>
        <div className="topic-meta">{meta}</div>
      </div>
    </article>
  );
}

export default function Education() {
  return (
    <main id="main-content" tabIndex={-1}>
      {/* Header */}
      <section className="shell" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <h1 className="d1 col-display">
          Everything you need to invest in <em>property yourself.</em>
        </h1>
        <p className="body-large col-body" style={{ marginTop: 32 }}>
          Taught openly. No paywall on the knowledge itself. You decide what you need, when you need
          it.
        </p>
      </section>

      {/* Three topics */}
      <section className="shell" style={{ paddingBottom: 96 }}>
        <Topic
          title="Understanding wholesale property."
          blurb="The category of property that has historically flowed only through closed channels, and how the platform opens those channels directly to you."
          href="/education/wholesale"
          meta="8 modules · ~90 minutes of video."
          thumbDuration="08:24"
        />
        <Topic
          title="Finance."
          blurb={
            <>
              How property is actually financed in Australia. The decisions that compound. What your
              broker is, and isn&rsquo;t, paid to tell you.
            </>
          }
          href="/education/finance"
          meta="10 modules · ~110 minutes of video."
          thumbDuration="09:10"
        />
        <Topic
          title="Property strategy."
          blurb="What to buy, where, why, and when. The frameworks the platform uses, taught from first principles."
          href="/education/strategy"
          meta="12 modules · ~140 minutes of video."
          thumbDuration="10:24"
        />
      </section>

      {/* How the education works */}
      <section className="shell section">
        <p className="section-eyebrow">How it works</p>
        <h2 className="h1 col-display">
          How the education <em>works.</em>
        </h2>
        <p className="body-large col-body" style={{ marginTop: 32 }}>
          The library isn&rsquo;t a course. There&rsquo;s no required sequence and no progress bar.
          You decide what you need, when you need it.
        </p>
        <div className="whatwedo-grid whatwedo-grid--carded" style={{ marginTop: 48 }}>
          <div className="whatwedo-card whatwedo-card--filled">
            <h3 className="whatwedo-card-headline">
              Watch in <em>any order.</em>
            </h3>
            <p className="whatwedo-card-body">
              No required sequence. No progress bar. You start where your question is, and you stop
              when the question&rsquo;s answered.
            </p>
          </div>
          <div className="whatwedo-card whatwedo-card--filled">
            <h3 className="whatwedo-card-headline">
              No paywall on the <em>fundamentals.</em>
            </h3>
            <p className="whatwedo-card-body">
              Every lesson on the platform is open. The work is the work; we don&rsquo;t put it
              behind a sign-up wall to harvest your email.
            </p>
          </div>
          <div className="whatwedo-card whatwedo-card--filled">
            <h3 className="whatwedo-card-headline">
              Ask a partner <em>when you&rsquo;re ready.</em>
            </h3>
            <p className="whatwedo-card-body">
              When a decision needs specific help, the platform introduces you to a partner we vouch
              for. You decide when, and whether.
            </p>
          </div>
        </div>
      </section>

      {/* Talk to an expert CTA */}
      <section className="shell" style={{ paddingBottom: 160 }}>
        <div className="expert-cta">
          <div className="expert-cta-body">
            <p className="section-eyebrow">Need a steer?</p>
            <h2 className="h2">
              Not sure where to start?
              <br />
              Talk to an expert.
            </h2>
            <p className="body-large" style={{ marginTop: 24, maxWidth: 560 }}>
              Tell us, in a few short answers, what you&rsquo;re trying to figure out. One of our
              team will read it and call you back within a day.
            </p>
          </div>
          <div className="expert-cta-action">
            <Button variant="primary" href="/find-an-expert">
              Talk to an expert <Arrow />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
