import Image from "next/image";
import Link from "next/link";
import heroBanner from "../../../public/images/hero-banner.png";
import aishaPortrait from "../../../public/images/aisha.png";
import marcusPortrait from "../../../public/images/marcus.png";
import chrisPortrait from "../../../public/images/chris.png";
import {
  Arrow,
  Button,
  ChainDiagram,
  InvestorCard,
  Pillar,
  Pillars,
  Placeholder,
  PlatformDiagram,
  SectionEyebrow,
  TertiaryLink,
} from "@/components";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  description:
    "A platform for Australians investing on their own terms. Learn how property investing works, get direct access to deals, and call on trusted experts when you're ready.",
  path: "/",
});

// Structural placeholders for the chain motif — interim "Layer N" labels until
// the real chain-layer copy is supplied (outstanding content item).
const chainLayers = [
  { label: "Layer 1", clip: true },
  { label: "Layer 2", clip: false },
  { label: "Layer 3", clip: true },
  { label: "Layer 4", clip: true },
  { label: "Layer 5", clip: false },
];

export default function Home() {
  return (
    <>
      {/* Hero — contained photographic card with a dark-green content panel */}
      <section className="hero-card-wrap">
        <div className="hero-card">
          <div className="hero-card-img">
            <Image
              src={heroBanner}
              alt="An Australian property investor reviewing learning material at home — quiet, considered, on their own terms."
              fill
              priority
              placeholder="blur"
              quality={90}
              sizes="(max-width: 880px) 100vw, 50vw"
              style={{ objectFit: "cover", objectPosition: "82% center" }}
            />
          </div>
          <div className="hero-card-content">
            <h1 className="hero-card-headline">Property investing on your own terms</h1>
            <p className="hero-card-lede">
              A platform for Australians investing on their own terms. Learn how property investing
              actually works, get direct access to the deals that used to flow only through closed
              channels, and call on the experts you can trust, when you&rsquo;re ready.
            </p>
            <div className="hero-card-ctas">
              <Link className="hero-card-cta hero-card-cta--primary" href="/self-assessment">
                Start building my property strategy <Arrow />
              </Link>
              <Link className="hero-card-cta hero-card-cta--ghost" href="/how-it-works">
                How it works <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The problem — chain vs platform */}
      <section className="shell section">
        <SectionEyebrow>The problem</SectionEyebrow>
        <h2 className="h1 col-display">
          There&rsquo;s a chain between you and the property you&rsquo;re trying to buy.{" "}
          <em>Each layer takes a clip.</em>
        </h2>
        <div className="grid-2 mt-16 items-start">
          <ChainDiagram
            title="The chain you can’t see."
            topLabel="The property"
            layers={chainLayers}
            caption="A structural sketch. Each circle marks a layer where a clip is taken."
          />
          <PlatformDiagram
            title="The way Help Me Invest works."
            topLabel="The property"
            caption="Knowledge moves directly. The customer leads the decision."
          />
        </div>
        <div className="col-body mt-24">
          <div className="stack-md">
            <p className="body">
              Australian property investing has evolved into a layered system. The property sits at
              one end of it. The everyday investor sits at the other. Between them sit the layers,
              each one claiming to bring the buyer closer to the deal, each one taking a fee for
              doing so.
            </p>
            <p className="body">
              The architecture quietly rewards keeping the buyer in the dark. The more confused the
              buyer, the more valuable the intermediary. The more complex the process, the more fees
              can be charged for navigating it.
            </p>
          </div>
          <p className="mt-8">
            <TertiaryLink href="/how-it-works">
              Learn more about the chain <Arrow />
            </TertiaryLink>
          </p>
        </div>
      </section>

      {/* What we do — pillars */}
      <section className="shell section">
        <SectionEyebrow>What we do</SectionEyebrow>
        <h2 className="h1 col-display">
          Three things, <em>delivered directly,</em> at a fraction of what the chain has charged.
        </h2>
        <p className="body-large col-body mt-8">
          The platform gives everyday Australians the knowledge, the access, and the trusted experts
          to invest in property themselves. Each one was previously gated. None of them needs to be.
        </p>
        <div className="mt-20">
          <Pillars>
            <Pillar
              number="01"
              headline={
                <>
                  The teaching is <em>open.</em>
                </>
              }
              body="Every part of the property investing journey, from first principles to finance, structure, selection, and execution, taught openly. No paywall on the fundamentals."
              linkLabel="See the modules"
              href="/education"
            />
            <Pillar
              number="02"
              headline={
                <>
                  The access is <em>direct.</em>
                </>
              }
              body="Wholesale stock, off-market deals, and insider opportunities that have historically flowed only through closed channels, available without paying for layers in between."
              linkLabel="How the access works"
              href="/education"
            />
            <Pillar
              number="03"
              headline={
                <>
                  The help is <em>yours to call.</em>
                </>
              }
              body="Trusted partners chosen on merit, aligned with your outcome. Always there in your corner if you need them."
              linkLabel="Meet the partners"
              href="/partners"
            />
          </Pillars>
        </div>
        <p className="mt-12">
          <TertiaryLink href="/how-it-works">
            Learn how it works <Arrow />
          </TertiaryLink>
        </p>
      </section>

      {/* Your starting point — self-assessment (Lighter Mint ground) */}
      <section className="bg-lighter-mint py-24">
        <div className="shell">
          <div className="grid-2 gap-18 items-center">
            <div>
              <SectionEyebrow>Your starting point</SectionEyebrow>
              <h2 className="h1">
                Now, see where you <em>really stand.</em>
              </h2>
              <p className="body-large mt-8">
                You can see the whole chain now, and how much of it ran on keeping you in the dark
                about your own position. This is where that ends. The self-assessment is a
                predictive model that shows you where you stand today, where you want to be by the
                time you retire, and the strategy it takes to close the gap. The first move on a
                property plan that&rsquo;s genuinely your own.
              </p>
              <div className="mt-12 flex items-center gap-8 flex-wrap">
                <Button variant="primary" href="/self-assessment">
                  Start my self assessment <Arrow />
                </Button>
                <TertiaryLink href="/how-it-works">
                  See how it works <Arrow />
                </TertiaryLink>
              </div>
            </div>
            <Placeholder ratio="1x1" label="[ Self-assessment preview ]" />
          </div>
        </div>
      </section>

      {/* Investor stories */}
      <section className="shell section">
        <SectionEyebrow>Investor stories</SectionEyebrow>
        <div className="col-display">
          <h2 className="h1">
            Australians investing on their own terms, <em>in their own words.</em>
          </h2>
          <p className="body-large col-body mt-8">
            What unites them isn&rsquo;t the stage they&rsquo;re at, it&rsquo;s their values. They
            want to understand a decision before they make it. They expect transparency by default.
            They treat property as a decision, not as a dream.
          </p>
        </div>
        <div className="investor-triptych mt-20">
          <InvestorCard
            name="Aisha"
            age={26}
            city="outer Melbourne"
            decision="Bought her first investment property directly through the platform."
            href="/success-stories"
            image={aishaPortrait}
          />
          <InvestorCard
            name="Marcus"
            age={38}
            city="Newcastle"
            decision="Refinanced, then bought a second property, with every fee on the page."
            href="/success-stories"
            image={marcusPortrait}
            focus="80% 50%"
          />
          <InvestorCard
            name="Chris"
            age={51}
            city="regional Queensland"
            decision="Fourth property, stress-tested with a platform partner before signing."
            href="/success-stories"
            image={chrisPortrait}
            focus="50% 40%"
            zoom={1.2}
          />
        </div>
        <p className="mt-16">
          <TertiaryLink href="/success-stories">
            See all investor stories <Arrow />
          </TertiaryLink>
        </p>
      </section>

      {/* Closing CTA */}
      <section className="shell pt-30 pb-40 text-center">
        <h2 className="d1 max-w-[900px] mx-auto">
          Property investing <em>back in the hands</em> of everyday Australians.
        </h2>
        <p className="body-large max-w-[520px] mt-8 mx-auto">
          The education is free. The access is open. The choice is yours.
        </p>
        <div className="mt-12 flex justify-center items-center gap-8 flex-wrap">
          <Button variant="primary" href="/self-assessment">
            Start building my property strategy <Arrow />
          </Button>
          <TertiaryLink href="/how-it-works">
            How it works <Arrow />
          </TertiaryLink>
        </div>
      </section>
    </>
  );
}
