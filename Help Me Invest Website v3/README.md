# Help Me Invest — MVP Website Mockup

A multi-page, high-fidelity website mockup for Help Me Invest. Real navigable pages, real copy, fully styled to the brand guidelines. Designed as if it were going live, not as a greyscale wireframe.

## How to run

This is a static site. Open any HTML file directly, or serve the project root with any static file server:

```bash
# from the project root
python3 -m http.server 8000
# then visit http://localhost:8000/
```

## Trade-off note vs. the brief

The brief specified React + Vite (or Next.js) + Tailwind. The delivery environment serves static HTML, so this build keeps the *architectural spirit* while substituting the tooling:

- **Real pages, real URLs.** Each route is its own HTML file, navigable via plain `<a>` tags. Education sub-pages live in `/education/` and behave like nested routes.
- **React for the view layer.** Each page renders React via `react@18.3.1` + Babel in-browser, sharing a single `js/components.jsx` for every reusable element (Header, Footer, Wordmark, PhraseHighlight, ChainDiagram, Buttons, Placeholder).
- **Tailwind replaced by hand-rolled CSS tokens.** `styles.css` defines the five brand colours, the type scale, the spacing scale, and the corner-radius scale as CSS custom properties &mdash; same job a `tailwind.config.js` would do, exposed as named utility classes (`.bg-paper`, `.bg-emerald`, `.h1`, `.body-large`, etc.) so designers don't have to remember hex codes.

If the project is ported to a real React + Vite setup later, the `js/components.jsx` file lifts directly into `src/components/`, and the token block at the top of `styles.css` lifts into `tailwind.config.js`. Nothing about the design system needs to change.

## File structure

```
help-me-invest/
├── index.html                  Home
├── partners.html               Partners
├── success-stories.html        Success Stories
├── education.html              Education landing
├── education/
│   ├── wholesale.html          Understanding wholesale property
│   ├── finance.html            Finance
│   └── strategy.html           Property strategy
├── contact.html                Contact
├── styles.css                  Tokens + base styles + utility classes
├── js/
│   └── components.jsx          Shared React components (loaded by every page)
└── README.md
```

## Design system reference

### Colours (five colours, six roles)

| Token              | Hex       | Role                                                       |
|--------------------|-----------|------------------------------------------------------------|
| `--paper`          | `#F6F7F4` | Ground (every background)                                  |
| `--lighter-mint`   | `#D4E8B5` | Gentle tonal surface, secondary buttons, hover states      |
| `--mint`           | `#A8D5B4` | Full soft sections, the phrase highlight                   |
| `--emerald`        | `#0A4B34` | Wordmark, headlines, primary UI, diagram fills             |
| `--charcoal`       | `#1A2B22` | Body ink (every paragraph)                                 |
| `--grey`           | `#8B8881` | Structural neutral (dividers, eyebrows, source citations)  |

Utility classes: `.bg-paper`, `.bg-mint`, `.bg-lighter-mint`, `.bg-emerald`, `.text-emerald`, `.text-charcoal`, `.text-grey`, `.text-paper`.

### Type scale (Plus Jakarta Sans only)

| Class         | Use                                        | Weight     | Size                     |
|---------------|--------------------------------------------|------------|--------------------------|
| `.d1`         | Display — hero statements                  | SemiBold   | 48–88px responsive       |
| `.h1`         | Primary page headline                      | SemiBold   | 36–52px responsive       |
| `.h2`         | Section headline                           | SemiBold   | 26–34px responsive       |
| `.h3`         | Subsection headline                        | SemiBold   | 22–26px responsive       |
| `.h4`         | Minor headline / card title                | SemiBold   | 19px                     |
| `.body-large` | Lede paragraph, supporting paragraph       | Regular    | 21px                     |
| `.body`       | Default body copy                          | Regular    | 17px                     |
| `.body-small` | Caption, footnote                          | Regular    | 14px                     |
| `.fine-print` | Footer fine print, legal                   | Regular    | 13px (NOT lightened)     |
| `.eyebrow`    | Structural metadata (page breadcrumbs)     | Medium     | 13px, Warm Mid-Grey      |

All headlines are Emerald. All body copy is Warm Charcoal. The one exception to the "no colour-based hierarchy" rule is the phrase highlight (below).

### Signature components

- **`<PhraseHighlight>`** &mdash; the Mint phrase highlight. Pass the phrase as children. Only used once per surface, only on hero / display headlines, only on Soft Paper grounds, and only on locked strategic vocabulary (`"on your own terms"`, `"stand alongside, not in front"`, `"show every fee"`, `"back in the hands of"`). When used inside a `.d1` or `.h1`, add the `.has-highlight` class to bump line-height to 1.2.
- **`<ChainDiagram>`** &mdash; the brand's signature visual motif. Vertical stack of labelled Emerald rectangles with `Knowledge` at the top and `The everyday investor` at the bottom. Pass `layers={[{ label, sublabel?, clip? }, ...]}`. The `clip: true` flag positions a small filled Emerald circle outside that layer. Labels are always structural &mdash; never name a profession.
- **`<PlatformDiagram>`** &mdash; the parallel "the way HMI works" diagram. Two boxes, one direct line, no clip markers. Shown beside `<ChainDiagram>` as a comparison.
- **`<Wordmark>`** &mdash; "help me" in Bold + "invest" in Medium, lowercase, single line. Pass `colour="emerald" | "paper" | "grey"` and `size={px}`.
- **`<PrimaryButton>`** / **`<SecondaryButton>`** / **`<TertiaryLink>`** &mdash; the three-tier CTA system. Most calls on the platform are Secondary (Lighter Mint) by default; Primary (Emerald) is reserved for the single most-important action on a page.

### Layout discipline

- Body copy column: `.col-body` (720px max) for marketing surfaces, `.col-reading` (680px max) for long-form education pages. Display headlines may extend to `.col-display` (1000px).
- Spacing scale: `--space-2xs` (4px) through `--space-2xl` (128px), on multiples of 8.
- Corner radii: 6px / 10px / 14px / 20px, applied through the `--radius-*` tokens. Full-bleed coloured sections (Emerald, Mint) get 0px corners.

## Notable design judgement calls

1. **Two routes for the brief's "Soft Paper headline + phrase highlight" rule.** The hero of the home page carries the highlight on `"on your own terms"`. The Success Stories closing CTA carries one on `"back in the hands of"`. No other page uses the highlight &mdash; per the one-per-surface discipline.
2. **The chain diagram appears twice across the site**, both times paired with the `<PlatformDiagram>` alternative: on the homepage thesis section, and on the wholesale education page (where it gets a larger educational treatment with sublabels).
3. **Most CTAs are Secondary (Lighter Mint).** Primary Emerald buttons are reserved for the two homepage CTAs and the contact form. This matches the guidelines' guidance that loud CTAs are a brand pushing; HMI offers.
4. **The contact form is functional only to the extent of a non-submitting confirmation state** &mdash; per the brief, the form must render and look correct, but no backend is wired up.
5. **Footer fine print (ABN, address, year) is set in Warm Charcoal at 13px, not lightened to grey** &mdash; per the "fine print is fine in size, not in importance" rule (Section 3d).
6. **Decision-tree diagram on the strategy page** uses styled HTML rather than SVG, with the primary path in Emerald and supporting nodes in Soft Paper with a thin Warm Mid-Grey border &mdash; the Family 1 (structural) convention from the guidelines.

## What's deliberately not here

Per the brief's Step 4 and the guidelines' anti-brand list, the build contains no gradients, drop shadows on type, glassmorphism, gold or navy, parallax, carousels, popups, exit-intent modals, countdown timers, "As featured in" logo strips, star ratings, social-media icon rows, emoji in interface copy, exclamation marks, "Get Started", "Learn More", or required-field asterisks. The chain is the named villain; no profession is named in critical context.
