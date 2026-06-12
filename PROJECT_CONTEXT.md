# Help Me Invest — Build Context & Progress Log

A running summary of the build so far: what the project is, the decisions that
govern it, what's been built, and what's next. Written as a handoff/context doc.

---

## 1. What this is

**Help Me Invest (HMI)** — a platform that helps everyday Australians invest in
property **on their own terms**. It does two things:

1. **Education** — teaches how property investing works (video modules, learning hub).
2. **Introductions** — connects people to vetted experts when they want help.

It is a **learning-and-introductions platform**, _not_ a listings site, marketplace,
or place to transact, and it does not give advice. Audience is defined by mindset,
not life-stage, and is **mobile-first** (a hard requirement).

We are in **Phase 1 — front end**: every MVP page built as a fast, responsive,
brand-accurate Next.js site with working nav and placeholder content, no CMS/back-end
wiring yet. Phase 2 wires CMS, auth, the assessment funnel, CRM, email/SMS, consent,
and analytics behind the finished front end.

---

## 2. Tech stack

| Layer       | Choice                                   |
| ----------- | ---------------------------------------- |
| Framework   | Next.js 16 (App Router) + React 19       |
| Language    | TypeScript                               |
| Styling     | Tailwind CSS v4 (tokens in `@theme`)     |
| Tooling     | ESLint 9 (flat config) + Prettier        |
| Fonts       | `next/font` — Newsreader + Plus Jakarta Sans |
| Hosting     | Railway.com (planned — Phase 2)          |
| Package mgr | **npm**                                  |

**Phase 2 services — finalised architecture.** The stack was decided in a dev-expert
meeting and **supersedes the original brief's plan** (which had Vercel hosting, Supabase
for DB/auth/storage, Payload CMS, and Bunny Stream/Mux for video — all now dropped):

| Concern                        | Service                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------- |
| Hosting + database + storage   | **Railway.com** — direct GitHub deploy, with integrated database and storage     |
| Auth                           | **Clerk** — managed service providing Google SSO + email verification            |
| CMS                            | **Sanity** — also drives non-dev marketing landing pages via templates           |
| Video                          | **Cloudflare Stream** — with DRM (Widevine / FairPlay) for gated content         |

Carried over from the brief: GoHighLevel CRM, a transactional email service, an SMS
provider, and privacy-respecting analytics (e.g. PostHog).

Notes on this architecture:

- **All of it is Phase 2 — none of it is built yet.**
- The **current front-end build has no dependency on any of these services**, so nothing
  needs re-architecting when they're wired in behind the finished front end.
- **Karan (dev expert) owns the security review** and will audit the first full-stack
  build, with a focus on API security and protecting client data.

---

## 3. Source-of-truth & ratified decisions

- **The delivered HTML/CSS (`Help Me Invest Website v3/`) is the source of truth** for
  layout/styling. The brand guidelines govern intent; **where they disagree, the HTML
  wins.** The `README.md` inside that folder is outdated and is reference-only.
- Ratified "HTML over guidelines" calls (confirmed by the client):
  - **Two-typeface system:** Newsreader (serif, weight 400) for D1–H4; Plus Jakarta Sans for body/UI/wordmark.
  - **Buttons are 10px rounded rectangles** (`--radius-md`), _not_ 999px pills.
  - **Headline `<em>` emphasis is rolled back** — renders plain (markup keeps `<em>` so it can be re-enabled).
  - **Spacing `2xl` = 96px** (CSS value), not the guidelines' 128px.
- **Phrase highlighting has been retired** from the brand entirely (no `PhraseHighlight`
  component/CSS). **Mint and Lighter Mint remain** as surface colours.
- **Card hover lift** was re-added per the brand motion spec (the HTML had removed it):
  scale ~1.02 + ~6px rise + soft shadow on filled cards, ~1.2s easeOutQuart.
- **Text-colour contrast split (Stage 8, ratified by the client):** Warm Mid-Grey
  `#8B8881` on Soft Paper measures ~3.3:1 — below WCAG AA (4.5:1) for small text. The
  **grey token is unchanged.** Grey is reserved for **structural/decorative** labels
  (eyebrows, in-diagram annotations, placeholder/portrait labels, figure labels like
  `.fee-card-label`, ordinals, dividers); **functional small text that must be read**
  uses **Warm Charcoal** — form help (`.field-help`), explanatory captions
  (`.chain-caption`), and meaningful content metadata (`.topic-meta`). Field
  labels/legends were already Charcoal. The split is documented in the `/styleguide`
  "Text colour" panel.

---

## 4. Design system (from `src/app/globals.css`)

**Colours (6 roles):** Soft Paper `#F6F7F4` · Lighter Mint `#D4E8B5` · Mint `#A8D5B4` ·
Emerald `#0A4B34` · Warm Charcoal `#1A2B22` · Warm Mid-Grey `#8B8881`. On Emerald
grounds, body/headlines reverse to Soft Paper (`.on-emerald`).

**Type scale:** `.d1` (Newsreader 400, clamp 56–104px, opsz 72), `.h1` (clamp 36–56),
`.h2` (clamp 34–50), `.h3` (30px, opsz 36), `.h4` (26px), `.body-large` (21), `.body`
(17/1.6), `.body-small` (14), `.fine-print` (13), `.eyebrow` (13, grey, 0.02em).

**Spacing (8px scale):** 2xs 4 · xs 8 · sm 16 · md 24 · lg 40 · xl 64 · 2xl 96.
**Radii:** sm 6 · md 10 · lg 14 · xl 20 (buttons 10px). **Columns:** reading 680 ·
body 720 · display 1000 · shell 1200.

**Motion:** calm reveal-on-scroll (`data-reveal` 1400ms, `data-reveal-chain` 1100ms
staggered, easeOutQuart) via `RevealObserver`; button hover lift (fast); card hover
lift (slow). All honour `prefers-reduced-motion`.

**Key components (`src/components/`):** `Wordmark`, `Button` + `TertiaryLink`, `Arrow`,
`Container`, `SectionEyebrow`, `SiteHeader`, `SiteFooter`, `RevealObserver`,
`ChainDiagram` + `PlatformDiagram`, `Placeholder` + `EditorialPortrait`, `InvestorCard`,
`PartnerCard`, `Pillars`/`Pillar`, `VideoModule`, `SelfAssessmentShell`, `ContactForm`,
`ExpertForm`, `LegalPage`, `PagePlaceholder`. A `/styleguide` page documents tokens +
components.

---

## 5. Architecture notes

- **Route groups for chrome:**
  - `src/app/(site)/` → full header + footer (all public/content pages, incl. self-assessment).
  - `src/app/(auth)/` → **minimal chrome** (wordmark only, no nav/footer) for `sign-in`, `sign-up`, `reset-password`, `verify-email`.
  - Root `layout.tsx` holds `<html>/<body>`, fonts, metadata defaults (title template, OpenGraph), and `RevealObserver`. `not-found.tsx` / `error.tsx` render their own header/footer.
- **Hero (Home):** content-driven `min-height: max(560px, 80svh)` (never clips; `svh`
  avoids mobile address-bar jump); subject-centred `object-position: 82%` so the
  photo subject stays in frame across sizes.
- **Design reference files** (`Help Me Invest Website v3/`, brand guidelines, brief)
  live in the repo and are excluded from build/lint/format/tsconfig.

---

## 6. Working conventions

- One stage at a time: **build → stop → user reviews → commit + push + open PR → user
  merges**. Never start the next stage without explicit go-ahead.
- **Branches/PRs map to FEAT-IDs** (e.g. `feat-36/site-shell`).
- Commits end with `Co-Authored-By: Claude Opus 4.8`; PR bodies end with the Claude Code line.
- **`.claude/launch.json`** (preview-tool config) is deliberately kept **out of every commit**.
- Each stage verified with `lint` / `typecheck` / `format:check` / `build` (all green)
  plus live computed-style + screenshot checks before committing.

---

## 7. Stages completed (all merged to `main`)

| Stage | FEAT | What | PR |
| --- | --- | --- | --- |
| 0 | FEAT-22 | Project scaffold (Next.js + TS + Tailwind + ESLint/Prettier, `.env.example`, README) | #1 |
| 1 | FEAT-21 | Design system as code + `/styleguide` | #2 |
| 2 | FEAT-36 | Global site shell (header/footer, routing skeleton, 404/error, SEO defaults) | #3 |
| 3 | FEAT-39 | Signature components — chain/platform diagram, cards, pillars, reveal motion + hover states | #4 |
| 4 | FEAT-37/39 | Home (banner hero) + How it works (journey + 4 phases); responsive fixes | #5 |
| 5 | FEAT-41/42 | Education hub + gated module index (`/education/wholesale`, gating UI only) + Investor Stories | #6 |
| 6 | FEAT-38/43 | Self-assessment survey shell + account screens (sign-in/up/reset/verify) + auth route group | #7 |
| 7 | FEAT-40/44/45/46 | Contact + talk-to-expert forms (non-submitting), Partners shell, Terms/Privacy placeholder layouts | #8 |

All MVP routes are navigable, brand-accurate, responsive, and form-complete as UI
shells. Repo: `vihan-r/help-me-invest` (private).

---

## 8. Outstanding / owed / deferred

- **Wordmark "h" mark asset (owed by client):** a transparent SVG using `currentColor`.
  Currently the mark is swapped by ground using PNGs — `hmi-mark-on-light.png` (green-on-paper)
  on light grounds; the **white-on-green PNG for Emerald grounds is still missing**, so
  Emerald grounds show a labelled placeholder. There's a `TODO(FEAT-21)` in `Wordmark.tsx`.
  The eventual fix is the single transparent SVG (drops in via `currentColor`).
- **Real legal copy** for Terms/Privacy — current pages are clearly-marked placeholder
  layouts; client to supply final wording.
- **Story/partner portraits** are placeholders (reference uses placeholders, not photos).
- `education/finance` and `education/strategy` are intentionally **stubs**.
- **All forms and auth are UI-only** (no backend) — Phase 2.
- **Self-assessment** is a UI shell — the predictive model + PDF report are Phase 2.
- **`hero-banner.png`** is a plain `<img>` (~2.7MB) — candidate for `next/image` in polish.

---

## 9. Known gotchas

- The local **dev server stops when the session goes idle** — restart with `npm run dev`
  (or ask). "localhost doesn't work" almost always means it just needs restarting.
- **Tailwind `@layer` CSS changes** sometimes aren't picked up by the running dev server
  via HMR — a dev restart (clear `.next`) fixes stale CSS.
- The preview screenshot tool **resets scroll on capture**, so below-the-fold content
  comes back blank — below-fold verification is done via computed styles instead.

---

## 10. What's next

**Stage 8 — Phase-1 polish (not started; awaiting go-ahead):** full responsive sweep
across every surface, accessibility + reduced-motion pass, per-route OpenGraph/meta,
and deploy to staging (Railway) for stakeholder click-through. This closes Phase 1.

Then **Phase 2** layers in CMS, accounts/auth/gating, the assessment funnel + PDF,
CRM/email/SMS, consent handling, and analytics — behind the finished front end.
