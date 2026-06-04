# HMI Nest Egg Trajectory — Plug-and-Play Guide

A single React component (`HMI_NestEggTrajectory.jsx`) you drop into the Next.js site. Responsive across mobile / iPad / desktop, with built-in save/resume support that wires to Supabase via callbacks.

---

## Quick start

**1. Drop the file in**

```
/components/NestEggTrajectory.jsx        ← copy HMI_NestEggTrajectory.jsx here
```

That's the only file you need from this delivery for the tool itself.

**2. Use it in a page**

```tsx
import NestEggTrajectory from "@/components/NestEggTrajectory";

export default function Page() {
  return <NestEggTrajectory />;
}
```

That renders the tool in standalone mode — works immediately for a demo. No props required.

**3. For production: wire up auth + persistence**

See `INTEGRATION.md` for the full Next.js + Supabase wiring. The short version:

```tsx
<NestEggTrajectory
  user={{ id, email, firstName, lastName }}    // from your auth
  initialState={loadedFromDb}                  // null on first visit
  onStateChange={async (env) => { await saveToDb(env); }}
  onComplete={async (env) => { await logEvent("completed", env); }}
  onPurchaseReport={(env) => { router.push("/checkout/report"); }}
  onBookCall={(env) => { router.push("/book/strategy-call"); }}
  saveStatus="saved"                           // shows the header pill
/>
```

---

## What's in this delivery

```
HMI_NestEggTrajectory.jsx    The component (3,500+ lines, single file).
INTEGRATION.md                Technical guide for Supabase wiring, SQL, CRM hooks.
README.md                     This file — quick start.
```

---

## What you don't need to do

- **No installs.** Pure React. No external libraries (charts, dates, math) — everything is hand-rolled SVG and vanilla JS so there's nothing to add to `package.json` beyond React itself.
- **No CSS file.** Styles are inline + a small `<style>` block at the top of the component. Fonts (Newsreader, Plus Jakarta Sans) load from Google Fonts via `@import`.
- **No config.** Brand colours, formulas, ABS data — all baked in. Change the constants at the top of the file if needed.
- **No build step.** Standard Next.js JSX. Works with TypeScript too — just rename to `.tsx` if you prefer.

---

## What it looks like at different sizes

The tool uses fluid CSS `clamp()` everywhere — fonts and paddings scale smoothly between mobile and desktop without breakpoint jumps. Two-column layouts stack on mobile. The save indicator hides the phase label at very narrow widths to keep the header tidy.

| Viewport | Behaviour |
|---|---|
| **Mobile** (320–640 px) | Single column, fonts scale down (e.g. 80 px hero → ~44 px), padding tightens (~55% of desktop), tap targets ≥ 44 px |
| **Tablet** (641–1024 px) | Fluid between mobile and desktop values |
| **Desktop** (1025 px+) | Full design as built |

The component itself never exceeds 760 px wide — that's the comfortable reading width baked in.

---

## Props at a glance

Every prop is **optional**. Standalone mode works with zero props.

```ts
interface Props {
  // Authenticated user. Pre-fills firstName/email, personalises greeting.
  user?: { id?: string; email?: string; firstName?: string; lastName?: string } | null;

  // Previously saved envelope. Tool resumes on the exact screen they left.
  initialState?: Envelope | null;

  // Fires debounced ~800 ms after any input change. Save to your DB.
  onStateChange?: (envelope: Envelope) => Promise<void>;

  // Fires once when user reaches the terms screen. Log as a CRM event.
  onComplete?: (envelope: Envelope) => Promise<void>;

  // Fires when user clicks the $49 plan CTA. If omitted, falls back to
  // window.open("https://helpmeinvest.com.au/report", "_blank").
  onPurchaseReport?: (envelope: { data: object; calc: object }) => void;

  // Fires when user clicks the free 15-min call CTA. Same fallback pattern.
  onBookCall?: (envelope: { data: object; calc: object }) => void;

  // External save status — shows the header pill.
  // "idle" | "saving" | "saved" | "error"
  saveStatus?: string | null;
}

interface Envelope {
  version: 1;
  data: object;            // All user inputs (age, income, assets, ...)
  screenKey: string;       // e.g. "cost", "reality"
  screenIdx: number;
  updatedAt: string;       // ISO timestamp
  completedAt: string | null;
}
```

---

## Save/resume in 30 seconds

1. **First visit**: tool loads with defaults. User starts typing.
2. **Every change**: after 800 ms of inactivity, `onStateChange(envelope)` fires. You upsert that into a `nest_egg_progress` table keyed by `user_id`.
3. **Bounce / close tab**: their data is already saved.
4. **Return**: load their row, pass it as `initialState`. Tool resumes on the same screen with the same inputs.
5. **Complete**: when they reach the final screen, `onComplete(envelope)` fires. Log the event for the CRM.
6. **Convert**: $49 CTA click → `onPurchaseReport`, free-call CTA → `onBookCall`. Both pass the envelope so you can pre-fill checkout forms with the user's data.

The header shows a small *"✓ All saved"* pill briefly after each successful save so the user knows their progress is safe.

---

## CTA URLs

When `onPurchaseReport` / `onBookCall` aren't wired, the buttons fall back to:
- $49 plan: `https://helpmeinvest.com.au/report`
- Free call: `https://helpmeinvest.com.au/call`

Change these in `ScreenOpportunities` (search for `helpmeinvest.com.au` in the file) if the fallbacks should point elsewhere. **In production, wire the callbacks** — that's how you log conversion events.

---

## Maths and constants

Every formula and assumption sits at the top of the file as a named constant. Change one number, the whole tool re-models.

| Constant | Where | Purpose |
|---|---|---|
| `EQUITY_PER_BUY = 0.19` | Top of file | 19% upfront cost per property (deposit + stamps + LMI) |
| `IO_YEARS = 5` | Top of file | Years a new IP runs interest-only before flipping to P&I |
| `INCOME_GROWTH = 0.035` | Top of file | Assumed wage growth p.a. |
| `RENT_GROWTH = 0.04` | Top of file | Assumed rent growth p.a. for renter projections |
| `RENT_GROWTH_HISTORICAL_5Y = 0.076` | Top of file | Cotality Feb 2026 actual figure (cited) |
| `WAGE_GROWTH_HISTORICAL_5Y = 0.033` | Top of file | Cotality Feb 2026 actual figure (cited) |
| `MEDIAN_CAPITAL_CITY_HOUSE = 1150000` | Inside calc | 8-capital median (Cotality early 2026) |
| `ABS_CPI_UPLIFT = 1.26` | Top of file | ABS 2019-20 → 2026 dollar adjustment (~26% cumulative CPI) |
| `MIN_BUYING_POWER = 700000` | ScreenAcquire | Floor for showing the buying-power panel |

ABS tables (`ABS_NATIONAL_PERCENTILES_2019_20`, `ABS_AGE_MEDIANS_2019_20`) are also at the top of the file with source URLs. When a fresh ABS release lands, drop the new figures in.

---

## Brand colours

Defined in the `C` object near the top of the file:

```js
const C = {
  paper: "#F6F7F4",       // Soft Paper — background
  emerald: "#0A4B34",     // Emerald — headlines, buttons
  charcoal: "#1A2B22",    // Warm Charcoal — body text
  lighterMint: "#D4E8B5", // Lighter Mint — cards
  mint: "#A8D5B4",        // Mint — soft sections
  grey: "#8B8881",        // Warm Mid-Grey — structural
  negative: "#A33A2B",    // Functional negative red
  paper90: "#F6F7F4E6",
};
```

Change a colour, the whole tool reflows in the new palette.

---

## Testing checklist (already done)

- ✅ **1,000+ render scenarios** — 25 user profiles × 15 screens × multiple prop combinations
- ✅ **Math invariants** — score in [0,100], percentile in [0,100], all monetary fields finite
- ✅ **SSR-safe** — renders cleanly server-side, no `window` references without guards
- ✅ **Backwards compatible** — works with zero props (standalone) and with full integration props
- ✅ **Responsive** — tested at 320 px, 414 px, 768 px (iPad), 1024 px (iPad landscape), 1280 px+ (desktop)
- ✅ **Save/resume cycle** — initialState round-trips correctly, corrupted state falls back gracefully

---

## Common questions

**"Do I need to install anything?"**
React only. The component imports from `react` and that's it. No npm installs.

**"Can I use it in plain React, not Next.js?"**
Yes. The component is framework-agnostic — works in any React 17+ host.

**"Can I change the copy?"**
Yes. Every string is plain text in the file. Search and replace.

**"Can I add more screens?"**
Yes. Add a new entry to the `SCREENS` array at the top and a new `function Screen...` component. The router will pick it up.

**"What if a user is on the Free tier of Supabase and the DB pauses?"**
The `onStateChange` will throw. The component catches that and shows the "Save failed — will retry" pill. The user sees a clear status indicator. Upgrade to Supabase Pro before launch (per the Phase 1 infra doc).

**"Is the $700k buying-power floor configurable?"**
Yes — search for `MIN_BUYING_POWER` in `ScreenAcquire`. One number to change.

---

## Need to change something?

Most edits land in obvious places:
- **Copy on a specific screen** → search for a phrase in the file, edit the JSX
- **A formula** → search for the named constant at the top of the file
- **A colour** → edit the `C` object
- **A font size** → either edit the inline `clamp()` value, or edit the `.hmi-display-xl` / `.hmi-h1` / etc. CSS classes in the `<style>` block at the top
- **Add a screen** → push an entry into `SCREENS`, write the component, register it in the router switch

If something looks bigger than a 10-minute edit, ping back — there's likely a cleaner refactor than the obvious one.
