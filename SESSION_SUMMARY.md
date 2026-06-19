# Session summary — Help Me Invest

_Date: 2026-06-19. A log of what was done in this working session: finishing Phase 1,
deploying to staging, and starting Phase 2 (Clerk auth). Companion to
`PROJECT_CONTEXT.md` (the authoritative running handoff)._

---

## TL;DR

- **Phase 1 (front end) completed and deployed** to Railway staging.
- **Phase 2 started:** Clerk authentication wired in (FEAT-1..5) and live on staging.
- **Live staging:** https://help-me-invest-production.up.railway.app (auto-deploys on merge to `main`).
- 10 PRs merged this session (#10–#19).

---

## What shipped (in order)

### Stage 8 — Phase-1 polish · PR #10 (FEAT-47)

- Full responsive sweep (360px → desktop). Fixed two real defects: the home hero
  clipped on small phones, and the header nav overflowed at 721–880px (hamburger
  breakpoint moved to 880px).
- Accessibility: `:focus-visible` rings, a "Skip to content" link, heading-order
  fixes, radio groups → `<fieldset>/<legend>`. Reduced-motion was already gated.
- Per-route OpenGraph/Twitter metadata via a `pageMeta()` helper + a build-time
  dynamic OG image.
- **Contrast decision (Option B, ratified):** kept Warm Mid-Grey `#8B8881` for
  structural/decorative labels; switched functional small text (form help, captions,
  content metadata) to Warm Charcoal. Documented in `/styleguide`.

### Architecture doc · PR #11

- Updated `PROJECT_CONTEXT.md` to the finalised Phase-2 stack, replacing the old plan.

### Pre-backend cleanup · PR #12 (FEAT-48) + hover fix · PR #13

Responding to Karan's front-end review:

- Forms wired with **react-hook-form + zod** (Contact, Expert, the four auth
  screens, self-assessment) with validation, `aria-required`/`aria-invalid`,
  `aria-live` success states.
- Correct error-boundary placement (`global-error.tsx` + per-group error files).
- `next/image` for hero + portraits; inline styles → Tailwind tokens; security
  headers; ES2022; mobile-nav close on route change; play-video `<div>`s → buttons;
  card `aria-label`s; single `<main>` lifted into layouts.
- PR #13: fixed a choppy card hover lift (reveal rule was overriding the transition;
  moved the shadow to a composited `::after` opacity fade).

### P1 — Railway staging deploy

- Deployed the front end to Railway (Nixpacks: `npm run build` → `npm run start`),
  set `NEXT_PUBLIC_SITE_URL`, verified live (200s, security headers, OG image).

### Housekeeping · PR #14

- Refreshed `.env.example` to the finalised stack (placeholders only) and recorded
  Phase 1 complete + deployed in `PROJECT_CONTEXT.md`.

### P2 — Clerk authentication · PR #15 (FEAT-1..5)

- Wired Clerk into the **existing** rhf account screens (headless/custom flows, brand
  UI kept): email/password + Google SSO, session + logout, password reset (code),
  email verification (code), and real auth-gating on `/education/wholesale`.
- `<ClerkProvider>` + `clerkMiddleware` (protects `/account`), `/sso-callback` route.
- Pinned **`@clerk/nextjs@^6`** (stable) — v7 defaults to an experimental API.

### Auth UX fixes · PR #16, #17, #18

- **#16:** return-to-origin after sign-in (sanitised `redirect_url`, threaded through
  verify + Google); form-level errors moved to a prominent block **above** the submit
  button; clearer password guidance + up-front requirements; fixed stale "link" copy
  (we use a 6-digit code).
- **#17:** added a single restrained **clay-red error colour** (Option C, signed off):
  `--color-error #B0432F` (+ text/surface/border tokens), used only for error states.
- **#18:** mapped Clerk's vague "verification strategy is not valid" to clear guidance
  ("use Continue with Google").

### Deferred-items doc · PR #19

- Logged production-hardening follow-ups in `PROJECT_CONTEXT.md` §8 (see below).

---

## Key decisions

- **Contrast split (ratified):** grey = structural/decorative; charcoal = functional
  small text.
- **Error colour (ratified):** added a 7th colour — clay red `#B0432F` — for
  validation/error states only. The palette was otherwise held at six.
- **Auth approach:** custom/headless Clerk flows on the existing brand screens rather
  than Clerk's prebuilt components.
- **Clerk version:** pinned to stable v6 (not the v7 that `@latest` installed).
- **Google consent-screen branding** ("Help Me Invest" + logo instead of "Clerk"):
  **deferred to production hardening** (needs our own Google OAuth credentials + Google
  verification; the dev Clerk instance uses Clerk's shared Google app).

---

## Current state

- **Stack:** Next.js 16 + React 19 + Tailwind v4 + TypeScript. Hosting: Railway.
  Phase-2 services: Clerk (auth, live), then Sanity (CMS) + Cloudflare Stream (video).
- **Staging:** https://help-me-invest-production.up.railway.app — auto-deploys on
  merge to `main`. Clerk runs on a **Development** instance.
- **Gates:** every change verified with lint / typecheck / format / build before merge.

---

## Outstanding / deferred (also in `PROJECT_CONTEXT.md` §8)

- **Auth production hardening:** stand up a production Clerk instance (own keys, custom
  domain) + our own Google OAuth credentials so the consent screen shows "Help Me
  Invest" + logo (requires Google's OAuth verification).
- **Railway build-env:** the build intermittently failed to see
  `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (it must be present at build — it's inlined into
  the client bundle). Pin down the env scoping **before** adding Sanity/Cloudflare keys.
- **Contact/expert forms** validate client-side but POST nowhere yet (no CRM/email).
- **FEAT-55:** account menu/profile.
- Owed assets/copy: `currentColor` logo SVG (Emerald-ground wordmark), real chain-
  diagram labels (currently "Layer 1–5"), real legal copy, story/partner portraits.
- `education/finance` and `education/strategy` remain stubs; self-assessment is a UI
  shell (predictive model + PDF are Phase 2).

---

## Gotchas learned this session

- **Clerk publishable key is required at build** (inlined into the client bundle), so
  it must be in Railway's build environment — no code workaround.
- **`@clerk/nextjs@latest` (v7)** ships an experimental "signals/future" API and omits
  `SignedIn`/`SignedOut`; use **v6**.
- **Tailwind `@layer` CSS edits** often need a dev-server restart (clear `.next`) to
  show via HMR.
- **Next 16** deprecates `middleware.ts` in favour of `proxy.ts` (warning only; kept as
  `middleware.ts` for Clerk v6 compatibility).
- The local production build needs Clerk keys to prerender; a gitignored `.env.local`
  with a format-valid **dummy** publishable key lets local builds pass (real keys live
  only in Railway).

---

## PR index

| PR  | What                                                                           |
| --- | ------------------------------------------------------------------------------ |
| #10 | Stage 8 — Phase-1 polish (responsive, a11y, per-route OG/meta, contrast split) |
| #11 | docs — finalised Phase-2 architecture                                          |
| #12 | Pre-backend cleanup (rhf+zod forms, error boundaries, next/image, headers)     |
| #13 | Fix choppy card hover lift                                                     |
| #14 | Housekeeping — `.env.example` refresh + Phase-1-deployed note                  |
| #15 | Clerk authentication (FEAT-1..5)                                               |
| #16 | Auth UX — return-to-origin, prominent error block, password guidance           |
| #17 | Restrained clay error colour (Option C)                                        |
| #18 | Clearer message for password sign-in on a Google account                       |
| #19 | docs — auth production-hardening + Railway build-env follow-ups                |
