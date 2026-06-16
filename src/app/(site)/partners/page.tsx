import { Arrow, PartnerCard, Placeholder, TertiaryLink } from "@/components";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Partners",
  description:
    "The partners we vouch for — introduced on merit, paid transparently, held to the outcome. They stand alongside, not in front.",
  path: "/partners",
});

export default function Partners() {
  return (
    <>
      {/* Header */}
      <section className="shell pt-16 pb-24">
        <h1 className="d1 col-display">
          The partners we <em>vouch for.</em>
        </h1>
        <p className="body-large col-body mt-8">
          Our partners are introduced to you on merit, paid in arrangements that are documented
          openly, and held to the outcome you&rsquo;re working toward. They stand alongside, not in
          front. You lead the engagement; the partner brings the specific help.
        </p>
        <Placeholder ratio="16x9" label="[ Cover image ]" style={{ marginTop: 56 }} />
      </section>

      {/* Standards */}
      <section className="shell section">
        <p className="section-eyebrow">What we ask</p>
        <h2 className="h1 col-display">
          What we ask of <em>every partner.</em>
        </h2>
        <p className="body-large col-body mt-8">
          Three standards. Every partner meets all of them, or they don&rsquo;t carry the vouch.
        </p>
        <div className="whatwedo-grid whatwedo-grid--carded mt-12">
          <div className="whatwedo-card whatwedo-card--filled">
            <h3 className="whatwedo-card-headline">
              They <em>earn</em> the introduction.
            </h3>
            <p className="whatwedo-card-body">
              Every partner is vetted on the substance of the work, not on what they&rsquo;re
              willing to pay for placement. The criteria we use to vouch for them are published, and
              the same criteria apply to every partner.
            </p>
          </div>
          <div className="whatwedo-card whatwedo-card--filled">
            <h3 className="whatwedo-card-headline">
              They stand <em>alongside,</em> not in front.
            </h3>
            <p className="whatwedo-card-body">
              The customer leads the engagement. The partner brings the specific help and the
              technical work. They do not gatekeep information, they do not steer toward outcomes
              that suit them.
            </p>
          </div>
          <div className="whatwedo-card whatwedo-card--filled">
            <h3 className="whatwedo-card-headline">
              They are <em>accountable</em> to the outcome.
            </h3>
            <p className="whatwedo-card-body">
              If a partner falls short, you can raise it with us in writing. We investigate, we
              resolve, and where the criteria are no longer met, the partner stops being a partner.
              We are not a directory.
            </p>
          </div>
        </div>
      </section>

      {/* The partners (placeholder cards) */}
      <section className="shell section">
        <h2 className="h2 col-display">
          Who we <em>vouch for.</em>
        </h2>
        <p className="body col-body mt-5">
          Placeholder copy. Replace with a short editorial intro once the partner roster is
          confirmed.
        </p>
        <div className="grid-3 mt-14">
          {[1, 2, 3].map((i) => (
            <PartnerCard
              key={i}
              name="Partner name placeholder."
              role="What this partner does for the customer, placeholder line."
              bio="Placeholder editorial bio. Two or three sentences about the partner, written in the same register as the rest of the page. Replace with real copy once the partner is confirmed and onboarded."
              href="#"
            />
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="shell pt-24 pb-40">
        <div className="col-body stack-md">
          <h2 className="h2">
            Our partners are here <em>when you&rsquo;re ready.</em>
          </h2>
          <p className="body">
            Learn at your own pace. Decide in your own time. When you&rsquo;d like specific help
            with a decision, tell us what you&rsquo;re working on and we&rsquo;ll introduce you to
            the right expert.
          </p>
          <p className="mt-7">
            <TertiaryLink href="/find-an-expert">
              Talk to an expert <Arrow />
            </TertiaryLink>
          </p>
        </div>
      </section>
    </>
  );
}
