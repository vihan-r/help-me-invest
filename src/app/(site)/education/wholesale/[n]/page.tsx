import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { TOPIC_BY_SLUG_QUERY, type TopicPage } from "@/sanity/lib/queries";
import { getWholesaleSeries, WHOLESALE_SLUG } from "@/sanity/lib/series";

// Gated content — keep module pages out of search indexes.
export const metadata = pageMeta({
  title: "Module — Understanding wholesale property",
  description: "A module in the Understanding wholesale property series.",
  noindex: true,
});

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default async function ModulePage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const moduleNumber = Number(n);

  if (!Number.isInteger(moduleNumber) || moduleNumber < 1) notFound();
  // Module 01 is the topic-page hero; it has no standalone page.
  if (moduleNumber === 1) redirect("/education/wholesale");

  // Modules sit behind the free account — send signed-out visitors to sign in.
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/education/wholesale/${moduleNumber}`)}`);
  }

  const [topic, series] = await Promise.all([
    sanityFetch<TopicPage | null>(TOPIC_BY_SLUG_QUERY, { slug: WHOLESALE_SLUG }),
    getWholesaleSeries(),
  ]);
  if (!topic) notFound();

  const row = series.rest.find((m) => m.index === moduleNumber);
  if (!row) notFound();

  const num = pad(moduleNumber);
  const indices = series.rest.map((m) => m.index);
  const firstIndex = Math.min(...indices);
  const lastIndex = Math.max(...indices);
  const hasPrevVideo = moduleNumber > firstIndex;
  const hasNextVideo = moduleNumber < lastIndex;

  return (
    <>
      {/* Header */}
      <section className="shell pt-16 pb-8">
        {topic.eyebrow ? <p className="eyebrow">{topic.eyebrow}</p> : null}
        <p className="video-module-eyebrow mt-4">
          Module {num} · {row.duration}
        </p>
        <h1 className="d1 col-display mt-3">{row.title}</h1>
      </section>

      {/* The video */}
      <section className="shell pt-4 pb-10">
        <div className="max-w-[900px]">
          <button
            type="button"
            className="hero-video"
            aria-label={`Play Module ${num}, ${row.title}`}
          >
            <span className="video-play" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2.5v11l10-5.5z" />
              </svg>
            </span>
            <span className="hero-video-badge">
              Module {num} · {row.duration}
            </span>
          </button>
        </div>
      </section>

      {/* About this module */}
      <section className="shell pb-16">
        <div className="col-body">
          <p className="eyebrow">About this module</p>
          {row.isPlaceholder ? (
            <>
              <p className="body-large mt-5">
                A short description of the module goes here. This is placeholder copy that will be
                replaced with the real summary once the module is recorded.
              </p>
              <p className="body mt-5">
                A longer placeholder paragraph can sit here for the fuller description, the key
                takeaways, and what the module sets you up to do next.
              </p>
            </>
          ) : row.blurb ? (
            <p className="body-large mt-5">{row.blurb}</p>
          ) : null}
        </div>
      </section>

      {/* Footer nav */}
      <section className="shell pt-4 pb-30">
        <div className="max-w-[900px]">
          <nav className="article-nav">
            {hasPrevVideo ? (
              <Link href={`/education/wholesale/${moduleNumber - 1}`}>← Previous video</Link>
            ) : (
              <Link href="/education/wholesale">← Back to the series</Link>
            )}
            <Link href="/education/wholesale">All modules</Link>
            {hasNextVideo ? (
              <Link href={`/education/wholesale/${moduleNumber + 1}`}>Next video →</Link>
            ) : (
              <span aria-hidden="true" />
            )}
          </nav>
        </div>
      </section>
    </>
  );
}
