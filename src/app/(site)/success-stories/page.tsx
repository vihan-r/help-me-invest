import { Arrow, Button, EditorialPortrait, Placeholder, TertiaryLink } from "@/components";
import { pageMeta } from "@/lib/seo";
import { urlForImage } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/fetch";
import { STORIES_QUERY, type StoryCard as StoryCardData } from "@/sanity/lib/queries";

export const metadata = pageMeta({
  title: "Investor Stories",
  description:
    "Australians investing on their own terms — customers defined by posture, not stage. A small set of their stories.",
  path: "/success-stories",
});

// ISR fallback; publish webhook (/api/revalidate) gives instant updates.
export const revalidate = 3600;

/** "Sarah, 31, Newcastle." — composed from the split name fields. */
function displayName({ firstName, age, location }: StoryCardData) {
  return `${[firstName, age, location].filter((v) => v !== undefined && v !== "").join(", ")}.`;
}

function StoryCard(story: StoryCardData) {
  const { firstName, structuralLine, summary, slug, portrait } = story;
  return (
    <article className="stack-md">
      {portrait ? (
        <EditorialPortrait
          src={urlForImage(portrait).width(800).height(960).url()}
          alt={displayName(story)}
        />
      ) : (
        <Placeholder ratio="5x6" label="[ Editorial portrait, customer ]" />
      )}
      <div className="stack-sm">
        <h2 className="h4">{displayName(story)}</h2>
        <p className="body-small text-grey">{structuralLine}</p>
        <p className="body mt-2">{summary}</p>
        <p className="mt-3">
          <TertiaryLink href={`/stories/${slug}`}>
            Read {firstName}&rsquo;s story <Arrow />
          </TertiaryLink>
        </p>
      </div>
    </article>
  );
}

export default async function SuccessStories() {
  const stories = await sanityFetch<StoryCardData[]>(STORIES_QUERY);

  return (
    <>
      {/* Header */}
      <section className="shell pt-16 pb-24">
        <h1 className="d1 col-display">
          Australians investing on <em>their own terms.</em>
        </h1>
        <p className="body-large col-body mt-8">
          The customers we&rsquo;re built for are defined by posture, not by stage. They read before
          they buy, they ask how the fee is calculated, and they treat the property as a decision
          rather than a dream. A small set of their stories follows.
        </p>
      </section>

      {/* Stories grid */}
      <section className="shell section">
        <div className="grid-2">
          {stories.map((s) => (
            <StoryCard key={s._id} {...s} />
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="shell pt-30 pb-40">
        <h2 className="h1 col-display">
          This is what property investing looks like when it&rsquo;s{" "}
          <em>back in the hands of everyday Australians.</em>
        </h2>
        <div className="mt-12">
          <Button variant="primary" href="/find-an-expert">
            Talk to an expert <Arrow />
          </Button>
        </div>
      </section>
    </>
  );
}
