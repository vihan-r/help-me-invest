import { Arrow, Button, Placeholder, TertiaryLink } from "@/components";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Investor Stories",
  description:
    "Australians investing on their own terms — customers defined by posture, not stage. A small set of their stories.",
  path: "/success-stories",
});

function StoryCard({
  name,
  structural,
  summary,
  href = "/stories/investor-story",
}: {
  name: string;
  structural: string;
  summary: string;
  href?: string;
}) {
  return (
    <article className="stack-md">
      <Placeholder ratio="5x6" label="[ Editorial portrait, customer ]" />
      <div className="stack-sm">
        <h2 className="h4">{name}</h2>
        <p className="body-small text-grey">{structural}</p>
        <p className="body mt-2">{summary}</p>
        <p className="mt-3">
          <TertiaryLink href={href}>
            Read {name.split(",")[0]}&rsquo;s story <Arrow />
          </TertiaryLink>
        </p>
      </div>
    </article>
  );
}

const STORIES = [
  {
    name: "Sarah, 31, Newcastle.",
    structural: "First investment property · 2025.",
    summary:
      "Sarah spent six months reading the fundamentals on the platform before she bought. She made the call on the suburb herself, then used the platform to introduce her to a partner for the property selection and the legal review.",
  },
  {
    name: "Marcus, 38, Western Sydney.",
    structural: "Second investment · 2024.",
    summary:
      "Marcus had bought one property the conventional way and had felt for years that he had no idea what had actually happened. The second time he used the platform to walk through the financing structure first, line by line, before he looked at properties.",
  },
  {
    name: "Aisha, 26, Outer Melbourne.",
    structural: "First investment property · 2026.",
    summary:
      "Aisha came to the platform with a clear plan and very little appetite for being sold to. She used the education library to test her thinking, then took the platform’s wholesale access for the property itself.",
  },
  {
    name: "Peter, 47, Regional Queensland.",
    structural: "Third property · 2025.",
    summary:
      "Peter knew the market he wanted to buy in better than any partner could. He used the platform for the parts he didn’t want to do himself, the negotiation and the conveyancing, and kept the rest of the decision in his own hands.",
  },
  {
    name: "Linh, 34, Inner Brisbane.",
    structural: "Refinance · 2026.",
    summary:
      "Linh used the platform to walk through what her existing broker arrangement was actually costing her, in plain numbers. She ended up moving the loan, with the trail commission disclosed on the same page she chose the new product.",
  },
  {
    name: "Chris, 51, Perth.",
    structural: "Fourth property · 2024.",
    summary:
      "Chris came in already experienced. He used the platform mainly as a stress-test, running his plan past one of the partners we vouch for, before he committed. The plan held up. The exercise was worth it anyway.",
  },
];

export default function SuccessStories() {
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
          {STORIES.map((s) => (
            <StoryCard key={s.name} name={s.name} structural={s.structural} summary={s.summary} />
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
