import Link from "next/link";
import { Arrow, Button, VideoModule } from "@/components";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Understanding wholesale property",
  description:
    "Start here — one short module on what wholesale property actually is in the Australian market, and what changes when an everyday investor gets direct access.",
  path: "/education/wholesale",
});

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
    <>
      {/* Header */}
      <section className="shell pt-16 pb-8">
        <p className="eyebrow">Education · Understanding wholesale property</p>
        <h1 className="d1 col-display mt-4">
          What wholesale <em>actually means.</em>
        </h1>
        <p className="body-large col-body mt-8">
          Start here. One short module that lays out what wholesale property actually is in the
          Australian market, why it has historically been reserved for insiders, and what changes
          when an everyday investor gets direct access to it. The rest of the series builds on this
          one.
        </p>
      </section>

      {/* Module 01 hero video */}
      <section className="shell pt-8 pb-8">
        <div className="max-w-[900px]">
          <button
            type="button"
            className="hero-video"
            aria-label="Play Module 01, what wholesale actually means"
          >
            <span className="video-play" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2.5v11l10-5.5z" />
              </svg>
            </span>
            <span className="hero-video-badge">Module 01 · 08:24</span>
          </button>
          <div className="hero-video-row">
            <Button variant="secondary" href="/sign-up">
              Watch next module <Arrow />
            </Button>
          </div>
        </div>
      </section>

      {/* Divider */}
      <section className="shell pt-16 pb-16">
        <hr className="rule max-w-[900px]" />
      </section>

      {/* The rest of the series — gated */}
      <section className="shell pb-24">
        <p className="eyebrow">The rest of the series</p>
        <h2 className="h2 col-display mt-3">
          Free to watch. <em>Create an account to continue.</em>
        </h2>
        <p className="body col-body mt-5">
          The account is free and exists to serve you, a place to keep what you&rsquo;re learning,
          and to introduce you to the partners you can call on when you&rsquo;re ready. The teaching
          itself was never the thing we were going to charge for.
        </p>

        <div className="locked-zone mt-10">
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
      <section className="shell pt-10 pb-30">
        <div className="max-w-[900px]">
          <nav className="article-nav">
            <Link href="/education">← Back to Education</Link>
            <Link href="/education/finance">Next: Finance →</Link>
          </nav>
        </div>
      </section>
    </>
  );
}
