import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Arrow, Button, VideoModule } from "@/components";
import { pageMeta } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  MODULES_BY_TOPIC_QUERY,
  TOPIC_BY_SLUG_QUERY,
  type Module,
  type TopicPage,
} from "@/sanity/lib/queries";

export const metadata = pageMeta({
  title: "Understanding wholesale property",
  description:
    "Start here — one short module on what wholesale property actually is in the Australian market, and what changes when an everyday investor gets direct access.",
  path: "/education/wholesale",
});

const SLUG = "wholesale";

// Placeholder rows for the gated "rest of the series" — shown until the team
// adds real account-gated modules to the CMS, so the sign-up wall stays live.
// (Real video lands with Cloudflare Stream in P4.)
const PLACEHOLDER_REST = ["11:02", "09:48", "14:15", "10:30", "12:50", "07:20", "15:40"].map(
  (duration, i) => ({
    index: i + 2,
    title: "Module title placeholder.",
    duration,
    blurb: "A short description of the module goes here.",
  }),
);

interface RestRow {
  index: number;
  title: string;
  duration?: string;
  blurb: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default async function Wholesale() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);

  const [topic, modules] = await Promise.all([
    sanityFetch<TopicPage | null>(TOPIC_BY_SLUG_QUERY, { slug: SLUG }),
    sanityFetch<Module[]>(MODULES_BY_TOPIC_QUERY, { slug: SLUG }),
  ]);

  if (!topic) notFound();

  const hero = modules.find((m) => m.accessLevel === "free") ?? null;
  const gated = modules.filter((m) => m.accessLevel === "account");

  // accessLevel drives the split; fall back to placeholders when no real gated
  // modules exist yet so the "rest of the series" section + sign-up wall persist.
  const rest: RestRow[] = gated.length
    ? gated.map((m) => ({
        index: m.moduleNumber,
        title: m.title,
        duration: m.duration,
        blurb: m.blurb ?? "",
      }))
    : PLACEHOLDER_REST;

  return (
    <>
      {/* Header */}
      <section className="shell pt-16 pb-8">
        {topic.eyebrow ? <p className="eyebrow">{topic.eyebrow}</p> : null}
        <h1 className="d1 col-display mt-4">{topic.pageHeadline ?? topic.title}</h1>
        {topic.intro ? <p className="body-large col-body mt-8">{topic.intro}</p> : null}
      </section>

      {/* Module 01 hero video */}
      {hero ? (
        <section className="shell pt-8 pb-8">
          <div className="max-w-[900px]">
            <button
              type="button"
              className="hero-video"
              aria-label={`Play Module ${pad(hero.moduleNumber)}, ${hero.title}`}
            >
              <span className="video-play" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 2.5v11l10-5.5z" />
                </svg>
              </span>
              <span className="hero-video-badge">
                Module {pad(hero.moduleNumber)} · {hero.duration}
              </span>
            </button>
            <div className="hero-video-row">
              <Button variant="secondary" href="/sign-up?redirect_url=%2Feducation%2Fwholesale">
                Watch next module <Arrow />
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {/* Divider */}
      <section className="shell pt-16 pb-16">
        <hr className="rule max-w-[900px]" />
      </section>

      {/* The rest of the series — gated on real auth (FEAT-5) */}
      <section className="shell pb-24">
        <p className="eyebrow">The rest of the series</p>
        {isSignedIn ? (
          <>
            <h2 className="h2 col-display mt-3">
              The rest of the <em>series.</em>
            </h2>
            <p className="body col-body mt-5">
              You&rsquo;re signed in — here&rsquo;s the full set. Pick up wherever you like.
            </p>
            <div className="mt-10">
              {rest.map((m) => (
                <VideoModule
                  key={m.index}
                  index={m.index}
                  title={m.title}
                  duration={m.duration}
                  blurb={m.blurb}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="h2 col-display mt-3">
              Free to watch. <em>Create an account to continue.</em>
            </h2>
            <p className="body col-body mt-5">
              The account is free and exists to serve you, a place to keep what you&rsquo;re
              learning, and to introduce you to the partners you can call on when you&rsquo;re
              ready. The teaching itself was never the thing we were going to charge for.
            </p>

            <div className="locked-zone mt-10">
              <div className="locked-modules" aria-hidden="true">
                {rest.map((m) => (
                  <VideoModule
                    key={m.index}
                    index={m.index}
                    title={m.title}
                    duration={m.duration}
                    blurb={m.blurb}
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
                <Button variant="primary" href="/sign-up?redirect_url=%2Feducation%2Fwholesale">
                  Create my account <Arrow />
                </Button>
                <Link
                  className="locked-cta-signin"
                  href="/sign-in?redirect_url=%2Feducation%2Fwholesale"
                >
                  Already have an account? Sign in <Arrow />
                </Link>
              </div>
            </div>
          </>
        )}
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
