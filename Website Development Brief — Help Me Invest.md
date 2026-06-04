# Website Development Brief — Help Me Invest

## 1. Project overview

**What we're building.** Help Me Invest (HMI) is a platform that helps everyday Australians invest in property on their own terms. It does two things: teaches how property investing works (education) and introduces people to vetted experts when they want help (partner introductions).

**What it is not — and this constrains the build.** HMI is a learning-and-introductions platform. It is **not** a property listings site, a marketplace, or a place to transact. Customers learn, then choose how they want help. 

**Who it's for.** Everyday Australians who want to invest in property themselves - defined by values, not stage. A 26-year-old buying their first place and a 46-year-old on their fourth are the same audience if they share the mindset. The audience is **mobile-first**, which is why responsive web is a hard MVP requirement, not a nice-to-have.

---

## 2. How we'll work together

**Daily standups.** A short daily sync - what moved yesterday, what's planned today, what's blocked. Keep it to blockers and movement; detail lives in Notion.

**Notion Kanban is the single source of truth.** All work is tracked on the **Product Backlog** database. The board you'll live in day-to-day is the **"Kanban" view**, grouped by **Status** and sorted by Priority. 

**Ground rules for the board:**

- One card = one feature (the `FEAT-` IDs are stable references; use them in standups, branches, and PRs, e.g. `FEAT-21`).
- Move your own cards as state changes. The board should reflect reality at standup time, not after.
- If scope on a card is unclear, comment on the card rather than guessing. Ambiguity gets resolved in writing, on the card.
- New work that emerges mid-build gets a new card in the backlog with a tier and priority — not absorbed silently into an existing one.

**Communication.** Standup for daily rhythm; Notion card comments for anything that needs a written trail or a decision. Tag scope questions early - the cheapest time to catch a misunderstanding is before the card moves to In progress.

---

## 3. Design (to be finalised)

**How designs are delivered.** All designs will be provided as **HTML files** - not Figma, not flat mockups. Each HTML file is the reference implementation for the page or component it covers: it shows the intended structure, layout, spacing, and styling, and you build the production Next.js version to match it. 

**Assets.** Brand assets (the wordmark and compact mark artwork, the type files, the photography library, diagram templates, and any icons) will be provided when we start the relevant work. Don't recreate brand assets from scratch - the wordmark in particular is always used as a supplied artwork file, never re-typed. If an asset you need isn't available yet, flag it on the card; don't improvise a stand-in that then has to be unwound.

**PROJECT FILES:** 

V2:

https://drive.google.com/drive/folders/17niWMvZ8Oub2Bu7hbF_PRUhyFiDgyDAn?usp=sharing

V1:

[1Gu-xVO2E0eibr6nNQPtXRDnuzG2cWbgs?usp=sharing](https://drive.google.com/drive/folders/1Gu-xVO2E0eibr6nNQPtXRDnuzG2cWbgs?usp=sharing)

How to open:

```jsx
cd /path/to/the/project/folder
python3 -m http.server 8000
```

```jsx
http://localhost:8000/Downloads/Help%20Me%20Invest%20Website%20(3)/
```

---

## 4. Technical foundation

| Layer | Direction |
| --- | --- |
| **Front end** | Next.js + TypeScript + Tailwind CSS |
| **Content** | Headless CMS — Payload (per spec doc) |
| **Accounts & backend** | Supabase (free tier covers Phase 1 build/demo) |
| **Hosting & deploy** | Vercel (Hobby for build/demo; Pro for live — Hobby prohibits commercial use and the free DB pauses when idle) |
| **Video** | Dedicated streaming provider — Bunny Stream (spec doc); backlog also references Mux / Cloudflare Stream. **Never** serve video from Vercel/Supabase bandwidth. Lock the provider before FEAT-6. |
| **Images** | Supabase Storage |
| **Source control / CI** | GitHub |
| **CRM** | GoHighLevel |
| **Transactional email** | One service, many triggers — e.g. Postmark / SES / Resend (FEAT-18) |
| **SMS** | e.g. Twilio / MessageMedia, with consent + STOP handling (FEAT-19) |
| **Analytics** | Privacy-respecting tool (e.g. PostHog over GA) to fit decline-cookies-by-default (FEAT-16) |

**Architecture principle.** API-first and modular. Growth adds capacity, not re-platforming - the same foundation carries from the free tier through to 50,000 users. Security and compliance is built in, not bolted on.

**Phasing of the build (from the approach doc):**

1. **Phase 1 - Front end.** Every MVP page built as a fast, responsive, brand-accurate Next.js site with working navigation and placeholder content, so stakeholders experience the full product early. No CMS wiring yet.
2. **Phase 2 - Content & back end.** Connect the headless CMS so the team manages content directly; then accounts, forms, SEO, and expert routing behind the finished front end.
3. **Phase 3 - Expansion.** Layer longer-term features onto the same API-first foundation. No rebuilding.

---

## 5. MVP scope (the initial engagement)

Everything in this section is tagged **Tier = MVP** in the backlog. The MVP is sequenced **front-end-first**, matching the approach doc and the `FRONT-END FIRST` flags on the page cards: build the foundations and page shells first, then wire back-end logic and integrations behind them.

### 5.1 Foundations — build first, everything inherits these

| ID | Feature |
| --- | --- |
| FEAT-22 | Hosting, auth infrastructure & CI/CD (dev/staging/prod, deploy pipeline, monitoring) |
| FEAT-21 | Design system implementation (Plus Jakarta Sans, six-colour palette, button hierarchy, spacing, radii, components) — **brand compliance enforced at the component level** |
| FEAT-23 | Responsive mobile-web layout (all MVP surfaces responsive — audience is mobile-first) |
| FEAT-36 | Global site shell (nav, footer, routing, SEO/meta, 404/error with on-brand empty-state copy) |

### 5.2 Page shells — `FRONT-END FIRST`, content/logic wired in later

| ID | Feature |
| --- | --- |
| FEAT-37 | Home page (editorial hero: one headline, one paragraph, one CTA; section stubs) |
| FEAT-42 | Education (learning hub / gated module index shell) |
| FEAT-38 | Property self-assessment page (intro + survey UI shell) |
| FEAT-43 | Sign in & Sign up (signup, login, password-reset, email-verification screens) |
| FEAT-39 | How it works (explains education / introductions / transparency; home for chain-vs-platform diagram) |
| FEAT-41 | Investor Stories (ships with stories in place manually; editorial, not testimonials) |
| FEAT-46 | Talk to an expert & Contact (form UIs; CRM wiring separate) |
| FEAT-44 | Terms & Conditions (static legal page; copy from legal) |
| FEAT-45 | Privacy Policy (static legal page; copy from legal) |
| FEAT-40 | Partners (page shell only at MVP) |

### 5.3 Accounts & access

| ID | Feature |
| --- | --- |
| FEAT-1 | Account creation — email/password + Google SSO (one account, multiple entry points; user sets own password) |
| FEAT-2 | Login / logout / session management |
| FEAT-3 | Password reset (email-based) |
| FEAT-4 | Email verification (before full access / report send) |
| FEAT-5 | Gated content access — auth wall on modules (**gating is the core conversion mechanism**) |
| FEAT-55 | Account management — profile & account settings (logged-in account menu → name, email, View profile, Log out; user edits own details and consent/comms preferences). |

### 5.4 Content & learning

| ID | Feature |
| --- | --- |
| FEAT-6 | Video modules (module → lesson structure; modules fixed for now; hosted streaming provider) |
| FEAT-7 | CMS / admin to publish new videos into existing modules (stated day-one requirement) |

### 5.5 Assessment & report (the assessment funnel)

| ID | Feature |
| --- | --- |
| FEAT-12 | Self-assessment survey with dynamic logic |
| FEAT-13 | Custom PDF report  emailed to user |
| FEAT-14 | Sign up to receive report (email + SMS capture via normal account creation) |

### 5.6 Lead capture & CRM

| ID | Feature |
| --- | --- |
| FEAT-11 | CRM integration (single integration; leads from signup, contact, talk-to-expert; source-tagged) |
| FEAT-8 | Lead capture via sign up → CRM (the account is the lead) |
| FEAT-9 | Lead capture via contact-us form → CRM (source-tagged) |
| FEAT-10 | Lead capture via talk-to-expert form → CRM — **no urgency/scarcity copy** |

### 5.7 Comms, analytics & compliance

| ID | Feature |
| --- | --- |
| FEAT-18 | Transactional & triggered email service (verification, reset, welcome, report delivery, reminders) |
| FEAT-19 | SMS provider integration (report delivery + reminders; consent + STOP/unsubscribe) |
| FEAT-20 | Consent & privacy handling - **MVP legal requirement** (explicit opt-in, unsubscribe, cookie decline-by-default, terms acceptance; Privacy Act + Spam Act) |
| FEAT-15 | Assessment email & SMS reminders - **calm register, easy opt-out, hard frequency cap** |
| FEAT-16 | Analytics & event tracking |

---

## 6. Product roadmap (beyond MVP)

The same API-first foundation carries these - they add capacity and features, not a rebuild.

### Post-MVP (depth on the existing product)

| ID | Feature | Tier | Priority |
| --- | --- | --- | --- |
| FEAT-24 | Saved progress / resume video | Post-MVP | P1 |
| FEAT-25 | Module completion tracking & progress indicators | Post-MVP | P1 |
| FEAT-26 | Saved / bookmarked library | Post-MVP | P2 |
| FEAT-27 | Content search (as the library outgrows fixed modules) | Post-MVP | P2 |
| FEAT-28 | New module creation in CMS (extends the MVP CMS) | Post-MVP | P2 |
| FEAT-47 | Admin-managed investor stories (CMS) | Post-MVP | P2 |

### Future product (new capability)

| ID | Feature | Tier | Priority |
| --- | --- | --- | --- |
| FEAT-29 | Wholesale / off-market access (DealLaunch integration) | Nice-to-have | P1 |
| FEAT-31 | B2B expert / partner platform | Nice-to-have | P2 |
| FEAT-30 | Track property purchase journey | Nice-to-have | P2 |
| FEAT-32 | In-app notifications / alerts | Nice-to-have | P2 |
| FEAT-33 | Native mobile app (iOS/Android) | Nice-to-have | P3 |

Priority within a tier guides sequencing, but tier is the gate: we finish MVP before opening Phase 2, and we'll confirm Phase 3 sequencing (FEAT-29 first) when we get there.

---

## 7. Expectations & deliverables

### What we expect at each stage

**Phase 1 (front end).** A deployed, responsive, brand-accurate Next.js site: all MVP page shells, working navigation and routing, the design system implemented as real components, placeholder content. Stakeholders should be able to click through the whole product. CMS and back-end logic not yet wired.

**Phase 2 (content & back end).** CMS connected and content manageable by the team; accounts, auth, gating, the assessment funnel, lead capture → CRM, email/SMS, consent handling, and analytics all working behind the finished front end.

**Phase 3 (expansion).** Post-MVP and Future features layered on as agreed, on the same foundation.

### Definition of Done (per card)

A card moves to **Done** when:

1. The feature works as described in the card's title and Notes, including any stated dependencies being satisfied.
2. It's **responsive** and behaves correctly on mobile (the default, not an afterthought).
3. **Compliance** items hold where relevant - consent capture, opt-out, source-tagging, and the platform reading as education/introductions, not advice or transactions.
4. It's merged via GitHub through the normal pipeline and deployed to staging for review.
5. It's been reviewed against the card; the card comment trail reflects any decisions made along the way.

### Handoff expectations

- **Environments:** working dev / staging / prod, with prod on the commercial-use tiers (Vercel Pro, Supabase Pro) — not the free tiers, which prohibit commercial use and pause when idle.
- **Repo:** in GitHub, with enough README/setup notes that another developer could run it locally and deploy.
- **Integration credentials & config** documented (CRM, email, SMS, video, analytics) — never hard-coded; secrets handled properly.
- **CMS handover:** the team can publish videos into modules (FEAT-7) and edit content without a developer, with a short how-to.