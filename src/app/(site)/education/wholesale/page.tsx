import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, Button, VideoModule } from "@/components";

export const metadata: Metadata = {
  title: "Understanding wholesale property",
  description:
    "Start here — one short module on what wholesale property actually is in the Australian market, and what changes when an everyday investor gets direct access.",
};

// Locked modules — generic placeholders; the cards are blurred and
// non-interactive until the user has an account (gating UI only, no auth yet).
const lockedModules = [
  { duration: "11:02" },
  { duration: "09:48" },
  { duration: "14:15" },
  { duration: "10:30" },
  { duration: "12:50" },
  { duration: "07:20" },
  { duration: "15:40" },
];

export default function Wholesale() {
  return (
    <main>
      {/* Header */}
      <section className="shell" style={{ paddingTop: 64, paddingBottom: 32 }}>
        <p className="eyebrow">Education · Understanding wholesale property</p>
        <h1 className="d1 col-display" style={{ marginTop: 16 }}>
          What wholesale <em>actually means.</em>
        </h1>
        <p className="body-large col-body" style={{ marginTop: 32 }}>
          Start here. One short module that lays out what wholesale property actually is in the
          Australian market, why it has historically been reserved for insiders, and what changes
          when an everyday investor gets direct access to it. The rest of the series builds on this
          one.
        </p>
      </section>

      {/* Module 01 hero video */}
      <section className="shell" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div style={{ maxWidth: 900 }}>
          <div className="hero-video" aria-label="Play Module 01, what wholesale actually means">
            <div className="video-play" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2.5v11l10-5.5z" />
              </svg>
            </div>
            <span className="hero-video-badge">Module 01 · 08:24</span>
          </div>
          <div className="hero-video-row">
            <Button variant="secondary" href="/sign-up">
              Watch next module <Arrow />
            </Button>
          </div>
        </div>
      </section>

      {/* Divider */}
      <section className="shell" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <hr className="rule" style={{ maxWidth: 900 }} />
      </section>

      {/* The rest of the series — gated */}
      <section className="shell" style={{ paddingBottom: 96 }}>
        <p className="eyebrow">The rest of the series</p>
        <h2 className="h2 col-display" style={{ marginTop: 12 }}>
          Free to watch. <em>Create an account to continue.</em>
        </h2>
        <p className="body col-body" style={{ marginTop: 20 }}>
          The account is free and exists to serve you, a place to keep what you&rsquo;re learning,
          and to introduce you to the partners you can call on when you&rsquo;re ready. The teaching
          itself was never the thing we were going to charge for.
        </p>

        <div className="locked-zone" style={{ marginTop: 40 }}>
          <div className="locked-modules" aria-hidden="true">
            {lockedModules.map((m, i) => (
              <VideoModule
                key={i}
                index={i + 2}
                title="Module title placeholder."
                duration={m.duration}
                blurb="A short description of the module goes here."
              />
            ))}
          </div>

          <div className="locked-cta">
            <p className="eyebrow">Free account · 30 seconds</p>
            <h3 className="h3">
              Create your account <em>to keep going.</em>
            </h3>
            <p className="locked-cta-body">
              We&rsquo;ll save where you are. You can stop any time.
            </p>
            <Button variant="primary" href="/sign-up">
              Create my account <Arrow />
            </Button>
            <Link className="locked-cta-signin" href="/sign-in">
              Already have an account? Sign in <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* Article footer nav */}
      <section className="shell" style={{ paddingTop: 40, paddingBottom: 120 }}>
        <div style={{ maxWidth: 900 }}>
          <nav className="article-nav">
            <Link href="/education">← Back to Education</Link>
            <Link href="/education/finance">Next: Finance →</Link>
          </nav>
        </div>
      </section>
    </main>
  );
}
