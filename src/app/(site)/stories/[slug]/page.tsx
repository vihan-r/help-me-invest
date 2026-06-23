import { notFound } from "next/navigation";
import {
  Arrow,
  Button,
  EditorialPortrait,
  Placeholder,
  StoryBody,
  TertiaryLink,
} from "@/components";
import { pageMeta } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlForImage } from "@/sanity/lib/image";
import { STORY_BY_SLUG_QUERY, STORY_SLUGS_QUERY, type StoryDetail } from "@/sanity/lib/queries";

// ISR fallback; publish webhook (/api/revalidate) gives instant updates.
export const revalidate = 3600;

/** "Sarah, 31, Newcastle." — composed from the split name fields. */
function displayName({ firstName, age, location }: StoryDetail) {
  return `${[firstName, age, location].filter((v) => v !== undefined && v !== "").join(", ")}.`;
}

async function getStory(slug: string) {
  return sanityFetch<StoryDetail | null>(STORY_BY_SLUG_QUERY, { slug });
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<{ slug: string }[]>(STORY_SLUGS_QUERY);
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) return pageMeta({ title: "Investor story", description: "Investor story." });
  return pageMeta({
    title: `${story.firstName}’s story`,
    description: story.summary,
    path: `/stories/${story.slug}`,
  });
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) notFound();

  const { structuralLine, summary, body, portrait } = story;

  return (
    <>
      {/* Header */}
      <section className="shell pt-16 pb-8">
        <p className="eyebrow">Investor story</p>
        <h1 className="d1 col-display mt-4">{displayName(story)}</h1>
        <p className="body-small text-grey mt-4">{structuralLine}</p>
      </section>

      {/* Portrait + summary */}
      <section className="shell pb-8">
        <div className="grid-2">
          {portrait ? (
            <EditorialPortrait
              src={urlForImage(portrait).width(800).height(960).url()}
              alt={displayName(story)}
            />
          ) : (
            <Placeholder ratio="5x6" label="[ Editorial portrait, customer ]" />
          )}
          <p className="body-large col-reading">{summary}</p>
        </div>
      </section>

      {/* Full story (when written) */}
      {body && body.length > 0 ? (
        <section className="shell pb-16">
          <div className="max-w-[680px]">
            <StoryBody value={body} />
          </div>
        </section>
      ) : null}

      {/* Footer nav + CTA */}
      <section className="shell pt-10 pb-40">
        <div className="max-w-[900px]">
          <p className="mb-12">
            <TertiaryLink href="/success-stories">← Back to Investor Stories</TertiaryLink>
          </p>
          <h2 className="h2 col-display">
            Investing on <em>your own terms</em> starts with a conversation.
          </h2>
          <div className="mt-10">
            <Button variant="primary" href="/find-an-expert">
              Talk to an expert <Arrow />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
