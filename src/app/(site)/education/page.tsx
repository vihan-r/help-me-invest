import Link from "next/link";
import type { ReactNode } from "react";
import { Arrow, Button, TertiaryLink } from "@/components";
import { pageMeta } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { TOPICS_QUERY, type TopicCard } from "@/sanity/lib/queries";

export const metadata = pageMeta({
  title: "Education",
  description:
    "Everything you need to invest in property yourself — taught openly, no paywall on the knowledge. You decide what you need, when you need it.",
  path: "/education",
});

// ISR fallback; publish webhook (/api/revalidate) gives instant updates.
export const revalidate = 3600;

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
        <p className="body-large mt-5 max-w-[720px]">{blurb}</p>
        <p className="mt-6">
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

export default async function Education() {
  const topics = await sanityFetch<TopicCard[]>(TOPICS_QUERY);

  return (
    <>
      {/* Header */}
      <section className="shell pt-16 pb-24">
        <h1 className="d1 col-display">
          Everything you need to invest in <em>property yourself.</em>
        </h1>
        <p className="body-large col-body mt-8">
          Taught openly. No paywall on the knowledge itself. You decide what you need, when you need
          it.
        </p>
      </section>

      {/* Topics */}
      <section className="shell pb-24">
        {topics.map((topic) => (
          <Topic
            key={topic._id}
            title={topic.title}
            blurb={topic.hubBlurb}
            href={`/education/${topic.slug}`}
            meta={topic.moduleCountLine ?? ""}
            thumbDuration={topic.thumbnailDuration ?? ""}
          />
        ))}
      </section>

      {/* How the education works */}
      <section className="shell section">
        <p className="section-eyebrow">How it works</p>
        <h2 className="h1 col-display">
          How the education <em>works.</em>
        </h2>
        <p className="body-large col-body mt-8">
          The library isn&rsquo;t a course. There&rsquo;s no required sequence and no progress bar.
          You decide what you need, when you need it.
        </p>
        <div className="whatwedo-grid whatwedo-grid--carded mt-12">
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
      <section className="shell pb-40">
        <div className="expert-cta">
          <div className="expert-cta-body">
            <p className="section-eyebrow">Need a steer?</p>
            <h2 className="h2">
              Not sure where to start?
              <br />
              Talk to an expert.
            </h2>
            <p className="body-large mt-6 max-w-[560px]">
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
    </>
  );
}
