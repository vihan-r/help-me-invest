import type { ReactNode } from "react";
import {
  Button,
  ChainDiagram,
  Container,
  InvestorCard,
  PartnerCard,
  Pillar,
  Pillars,
  PlatformDiagram,
  TertiaryLink,
  Wordmark,
} from "@/components";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Design system — Help Me Invest",
  description: "Token and component reference for the HMI design system (FEAT-21).",
  noindex: true,
});

/* —— Token data (values pulled verbatim from the design source of truth) —— */

const COLOURS = [
  {
    name: "Soft Paper",
    token: "paper",
    hex: "#F6F7F4",
    role: "Ground — every background",
    swatch: "bg-paper",
  },
  {
    name: "Lighter Mint",
    token: "lighter-mint",
    hex: "#D4E8B5",
    role: "Gentle surface, secondary buttons",
    swatch: "bg-lighter-mint",
  },
  {
    name: "Mint",
    token: "mint",
    hex: "#A8D5B4",
    role: "Full soft sections, soft surfaces",
    swatch: "bg-mint",
  },
  {
    name: "Emerald",
    token: "emerald",
    hex: "#0A4B34",
    role: "Wordmark, headlines, primary UI",
    swatch: "bg-emerald",
  },
  {
    name: "Warm Charcoal",
    token: "charcoal",
    hex: "#1A2B22",
    role: "Body ink",
    swatch: "bg-charcoal",
  },
  {
    name: "Warm Mid-Grey",
    token: "grey",
    hex: "#8B8881",
    role: "Dividers, eyebrows, metadata",
    swatch: "bg-grey",
  },
];

const TYPE_SCALE = [
  {
    cls: "d1",
    label: "Display / D1",
    spec: "Newsreader 400 · clamp(56–104px) · lh 0.98 · −0.03em · opsz 72",
    sample: "Property investing, on your own terms",
  },
  {
    cls: "h1",
    label: "H1",
    spec: "Newsreader 400 · clamp(36–56px) · lh 1.08 · −0.025em · opsz 72",
    sample: "A calmer way to learn property",
  },
  {
    cls: "h2",
    label: "H2",
    spec: "Newsreader 400 · clamp(34–50px) · lh 1.08 · −0.022em · opsz 72",
    sample: "Stand alongside, not in front",
  },
  {
    cls: "h3",
    label: "H3",
    spec: "Newsreader 400 · 30px · lh 1.15 · −0.02em · opsz 36",
    sample: "Show every fee, every source",
  },
  {
    cls: "h4",
    label: "H4",
    spec: "Newsreader 400 · 26px · lh 1.2 · −0.02em · opsz 36",
    sample: "Back in the hands of everyday investors",
  },
];

const BODY_SCALE = [
  { cls: "body-large", label: "Body large", spec: "Plus Jakarta Sans 400 · 21px · lh 1.5" },
  { cls: "body", label: "Body", spec: "Plus Jakarta Sans 400 · 17px · lh 1.6" },
  { cls: "body-small", label: "Body small", spec: "Plus Jakarta Sans 400 · 14px · lh 1.5" },
  {
    cls: "fine-print",
    label: "Fine print",
    spec: "Plus Jakarta Sans 400 · 13px · lh 1.5 (kept Charcoal, not greyed)",
  },
];

const SPACING = [
  { token: "2xs", px: 4 },
  { token: "xs", px: 8 },
  { token: "sm", px: 16 },
  { token: "md", px: 24 },
  { token: "lg", px: 40 },
  { token: "xl", px: 64 },
  { token: "2xl", px: 96 },
];

const RADII = [
  { token: "sm", px: 6, use: "Tags, badges, small UI", cls: "rounded-sm" },
  { token: "md", px: 10, use: "Buttons, inputs", cls: "rounded-md" },
  { token: "lg", px: 14, use: "Cards", cls: "rounded-lg" },
  { token: "xl", px: 20, use: "Large containers, photography", cls: "rounded-xl" },
];

const COLUMNS = [
  { token: "reading", px: 680, use: "Long-form essays" },
  { token: "body", px: 720, use: "General body column" },
  { token: "display", px: 1000, use: "Display headlines" },
  { token: "shell", px: 1200, use: "Outer page shell" },
];

/* —— Layout helpers —— */

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-grey/30 py-xl">
      <p className="eyebrow mb-xs">{eyebrow}</p>
      <h2 className="h3 mb-lg">{title}</h2>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <main className="bg-paper py-2xl">
      <Container width="display">
        <p className="eyebrow mb-sm">Help Me Invest · FEAT-21</p>
        <h1 className="d1">Design system</h1>
        <p className="body-large mt-md max-w-body">
          The token and component reference, extracted verbatim from the delivered design files.
          Where the brand guidelines and the HTML disagree, the HTML wins — points of difference are
          flagged below.
        </p>

        {/* —— Colour —— */}
        <Section eyebrow="Foundations" title="Colour — six roles, one job each">
          <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
            {COLOURS.map((c) => (
              <div key={c.token} className="overflow-hidden rounded-lg border border-grey/20">
                <div className={`${c.swatch} h-24 w-full`} />
                <div className="bg-paper p-md">
                  <p className="body font-medium">{c.name}</p>
                  <p className="body-small mt-2xs text-grey">
                    <code>--color-{c.token}</code> · {c.hex}
                  </p>
                  <p className="body-small mt-xs">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="body-small mt-md text-grey">
            On Emerald grounds, body and headlines reverse to Soft Paper (the{" "}
            <code>.on-emerald</code> rule).
          </p>
        </Section>

        {/* —— Typography —— */}
        <Section eyebrow="Foundations" title="Typography — two typefaces">
          <p className="body max-w-body">
            Newsreader (editorial serif, weight 400) announces — every headline D1–H4. Plus Jakarta
            Sans reads — all body, UI, and the wordmark. Headline <em>em</em> emphasis is currently
            rolled back in the source, so it renders plain (the markup keeps <code>&lt;em&gt;</code>{" "}
            so the italic accent can be re-enabled later).
          </p>
          <div className="mt-lg space-y-lg">
            {TYPE_SCALE.map((t) => (
              <div key={t.cls} className="border-t border-grey/20 pt-md">
                <p className="eyebrow mb-xs">
                  {t.label} · <code>.{t.cls}</code> — {t.spec}
                </p>
                <p className={t.cls}>{t.sample}</p>
              </div>
            ))}
            {BODY_SCALE.map((t) => (
              <div key={t.cls} className="border-t border-grey/20 pt-md">
                <p className="eyebrow mb-xs">
                  {t.label} · <code>.{t.cls}</code> — {t.spec}
                </p>
                <p className={`${t.cls} max-w-body`}>
                  Help Me Invest teaches how property investing works, then introduces people to
                  vetted experts when they want help — never a listings site, never advice.
                </p>
              </div>
            ))}
            <div className="border-t border-grey/20 pt-md">
              <p className="eyebrow mb-xs">
                Eyebrow · <code>.eyebrow</code> — Plus Jakarta Sans 500 · 13px · 0.02em · Warm
                Mid-Grey
              </p>
              <p className="eyebrow">Structural metadata</p>
            </div>
          </div>
        </Section>

        {/* —— Text colour roles (contrast) —— */}
        <Section eyebrow="Foundations" title="Text colour — structural vs functional small text">
          <p className="body max-w-body">
            Warm Mid-Grey (<code>#8B8881</code>) on Soft Paper measures ~3.3:1 — fine for large text
            and graphic elements, but below the 4.5:1 WCAG AA threshold for small body text. The
            grey token is unchanged; instead it is reserved for{" "}
            <strong>structural and decorative</strong> labels, while{" "}
            <strong>functional small text that needs to be read</strong> uses Warm Charcoal
            (&gt;12:1).
          </p>
          <div className="mt-lg grid grid-cols-1 gap-md lg:grid-cols-2">
            {/* Structural / decorative — stays grey */}
            <div className="rounded-lg border border-grey/25 p-md">
              <p className="eyebrow mb-md">Structural / decorative — Warm Mid-Grey (unchanged)</p>
              <ul className="space-y-md">
                <li>
                  <p className="eyebrow">Your starting point</p>
                  <p className="body-small mt-2xs">
                    <code>.eyebrow</code> · <code>.section-eyebrow</code> — section labels
                  </p>
                </li>
                <li>
                  <p className="chain-clip-label">Clip taken</p>
                  <p className="body-small mt-2xs">
                    <code>.chain-clip-label</code> · diagram annotations
                  </p>
                </li>
                <li>
                  <p className="editorial-portrait-label">[ Cover image ]</p>
                  <p className="body-small mt-2xs">
                    <code>.placeholder-label</code> · placeholder / portrait labels
                  </p>
                </li>
                <li>
                  <p className="fee-card-label">Service fee</p>
                  <p className="body-small mt-2xs">
                    <code>.fee-card-label</code> · <code>.video-module-eyebrow</code> — figure
                    labels
                  </p>
                </li>
              </ul>
            </div>
            {/* Functional / must-read — now charcoal */}
            <div className="rounded-lg border border-emerald/25 p-md">
              <p className="eyebrow mb-md">Functional / must-read — Warm Charcoal</p>
              <ul className="space-y-md">
                <li>
                  <p className="field-help">
                    At least 8 characters. We&rsquo;ll never email it to you.
                  </p>
                  <p className="body-small mt-2xs">
                    <code>.field-help</code> · form help &amp; instructions
                  </p>
                </li>
                <li>
                  <p className="chain-caption" style={{ margin: 0 }}>
                    A structural sketch. Each circle marks a layer where a clip is taken.
                  </p>
                  <p className="body-small mt-2xs">
                    <code>.chain-caption</code> · explanatory captions
                  </p>
                </li>
                <li>
                  <p className="topic-meta">8 modules · ~90 minutes of video.</p>
                  <p className="body-small mt-2xs">
                    <code>.topic-meta</code> · meaningful content metadata
                  </p>
                </li>
                <li>
                  <span style={{ fontWeight: 500, fontSize: 15, color: "var(--color-charcoal)" }}>
                    What email should we use?
                  </span>
                  <p className="body-small mt-2xs">
                    <code>.field label</code> · <code>legend</code> — already charcoal
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </Section>

        {/* —— Spacing —— */}
        <Section eyebrow="Foundations" title="Spacing — multiples of 8px">
          <div className="space-y-sm">
            {SPACING.map((s) => (
              <div key={s.token} className="flex items-center gap-md">
                <code className="body-small w-28 text-grey">--spacing-{s.token}</code>
                <div className="h-4 bg-emerald" style={{ width: `${s.px}px` }} />
                <span className="body-small">{s.px}px</span>
              </div>
            ))}
          </div>
        </Section>

        {/* —— Corner radii —— */}
        <Section eyebrow="Foundations" title="Corner radii">
          <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
            {RADII.map((r) => (
              <div key={r.token}>
                <div className={`${r.cls} h-24 w-full border border-emerald/30 bg-lighter-mint`} />
                <p className="body-small mt-xs font-medium">
                  <code>--radius-{r.token}</code> · {r.px}px
                </p>
                <p className="body-small text-grey">{r.use}</p>
              </div>
            ))}
          </div>
          <p className="body-small mt-md text-grey">
            Note: the brand guidelines specify 999px pill buttons, but the source HTML uses{" "}
            <code>--radius-md</code> (10px) for buttons — followed here.
          </p>
        </Section>

        {/* —— Columns —— */}
        <Section eyebrow="Foundations" title="Column widths">
          <div className="space-y-sm">
            {COLUMNS.map((c) => (
              <div key={c.token} className="flex items-center gap-md">
                <code className="body-small w-40 text-grey">--container-{c.token}</code>
                <div
                  className="h-3 rounded-sm bg-mint"
                  style={{ width: `${(c.px / 1200) * 100}%` }}
                />
                <span className="body-small whitespace-nowrap">
                  {c.px}px — {c.use}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* —— Buttons —— */}
        <Section eyebrow="Components" title="Buttons & links">
          <p className="body mb-lg max-w-body">
            Three-tier CTA system. Secondary (Lighter Mint) is the everyday default; Primary
            (Emerald) is reserved for the single most important action on a surface.
          </p>
          <div className="flex flex-wrap items-center gap-md">
            <Button variant="primary" href="#">
              Talk to an expert
            </Button>
            <Button variant="secondary" href="#">
              Explore education
            </Button>
            <Button variant="primary" size="sm" href="#">
              Primary small
            </Button>
            <Button variant="secondary" size="sm" href="#">
              Secondary small
            </Button>
          </div>
          <div className="mt-lg flex flex-wrap items-center gap-lg">
            <TertiaryLink href="#">Read Aisha&rsquo;s story →</TertiaryLink>
            <p className="body">
              An{" "}
              <a className="inline-link" href="#">
                inline link
              </a>{" "}
              inside body copy.
            </p>
          </div>
        </Section>

        {/* —— Wordmark —— */}
        <Section eyebrow="Components" title="Wordmark">
          <div className="flex flex-wrap items-center gap-xl">
            <Wordmark colour="emerald" size={20} href="#" />
            <Wordmark colour="grey" size={20} href="#" />
            <Wordmark colour="emerald" size={32} href="#" />
          </div>
          <div className="mt-lg rounded-lg bg-emerald p-lg">
            <Wordmark colour="paper" size={24} href="#" />
          </div>
          <p className="body-small mt-md text-grey">
            &ldquo;help me&rdquo; Bold 700 + &ldquo;invest&rdquo; Medium 500, lowercase. Interim:
            the &ldquo;h&rdquo; mark is swapped by ground using PNGs — the green-on-paper mark on
            light grounds (above); the Emerald panel below shows the <strong>placeholder</strong>{" "}
            until the white-on-green PNG is supplied. The transparent <code>currentColor</code> SVG
            remains the eventual fix.
          </p>
        </Section>

        {/* —— Chain vs platform —— */}
        <Section eyebrow="Signature" title="Chain vs platform diagram">
          <p className="body mb-lg max-w-body">
            The brand&rsquo;s signature motif, shown beside its platform alternative. Labels are
            always structural — never a profession. The Emerald circle marks a layer where a clip is
            taken. Both reveal on scroll, calm and slow.
          </p>
          <div className="grid-2" style={{ alignItems: "start" }}>
            <ChainDiagram
              title="The chain you can’t see."
              topLabel="The property"
              layers={[
                { label: "Placeholder.", clip: true },
                { label: "Placeholder.", clip: false },
                { label: "Placeholder.", clip: true },
                { label: "Placeholder.", clip: true },
                { label: "Placeholder.", clip: false },
              ]}
              caption="A structural sketch. Each circle marks a layer where a clip is taken."
            />
            <PlatformDiagram
              title="The way Help Me Invest works."
              topLabel="The property"
              caption="Knowledge moves directly. The customer leads the decision."
            />
          </div>
        </Section>

        {/* —— Investor story cards —— */}
        <Section eyebrow="Signature" title="Investor story cards">
          <div className="investor-triptych">
            <InvestorCard
              name="Aisha"
              age={26}
              city="outer Melbourne"
              decision="Bought her first place after learning what the fees really were."
              href="#"
            />
            <InvestorCard
              name="Marcus"
              age={41}
              city="Brisbane"
              decision="Restructured before his fourth purchase, on his own terms."
              href="#"
            />
            <InvestorCard
              name="Chris"
              age={34}
              city="Perth"
              decision="Walked into the deal already knowing every number."
              href="#"
            />
          </div>
        </Section>

        {/* —— Partner cards —— */}
        <Section eyebrow="Signature" title="Partner cards">
          <div className="grid-3">
            <PartnerCard
              name="Partner name placeholder."
              role="What this partner does for the customer, placeholder line."
              bio="Placeholder editorial bio. Two or three sentences about the partner, in the same register as the rest of the page."
              href="#"
            />
            <PartnerCard
              name="Partner name placeholder."
              role="What this partner does for the customer, placeholder line."
              bio="Placeholder editorial bio. Two or three sentences about the partner, in the same register as the rest of the page."
              href="#"
            />
            <PartnerCard
              name="Partner name placeholder."
              role="What this partner does for the customer, placeholder line."
              bio="Placeholder editorial bio. Two or three sentences about the partner, in the same register as the rest of the page."
              href="#"
            />
          </div>
        </Section>

        {/* —— Pillars —— */}
        <Section eyebrow="Signature" title="Pillars (what we do)">
          <Pillars>
            <Pillar
              number="01"
              headline={<>The teaching is open.</>}
              body="Every part of the property investing journey, taught openly. No paywall on the fundamentals."
              linkLabel="See the modules"
              href="#"
            />
            <Pillar
              number="02"
              headline={<>The access is direct.</>}
              body="Wholesale stock and off-market opportunities that historically flowed only through closed channels."
              linkLabel="How the access works"
              href="#"
            />
            <Pillar
              number="03"
              headline={<>The help is yours to call.</>}
              body="Trusted partners chosen on merit, aligned with your outcome. There if you need them."
              linkLabel="Meet the partners"
              href="#"
            />
          </Pillars>
        </Section>
      </Container>
    </main>
  );
}
