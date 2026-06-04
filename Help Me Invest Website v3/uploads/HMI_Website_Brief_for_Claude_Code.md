# Brief: Help Me Invest — MVP Website Mockup

**For:** Claude Code
**Deliverable:** A multi-page, high-fidelity website mockup for Help Me Invest (HMI) — built as a static site (React + Tailwind, single repo, navigable between pages) that visualises every page listed in scope, fully styled to the HMI brand guidelines.
**Fidelity:** Design mockup, not a greyscale wireframe. The two-greens conversation between Emerald and Mint, the Mint phrase highlight, and the rounded-corner system are part of the brand's signature — a colour-stripped wireframe would obscure them. Build it as if it were going live, with real copy.

---

## Step 0 — Required reading before you write any code

Before touching the file system, read both source documents in full. They are the source of truth. This brief tells you *what* to build; those documents tell you *how* the brand actually behaves.

1. `HMI_Brand_Narrative_Bible.md` — the strategic spine (one-liner, origin story, the chain, the customer, voice rules, vocabulary, content pillars, anti-brand).
2. `HMI_Brand_Guidelines.md` — the visual identity system (design principles, logo, typography, colour, photography, diagrams, layout, voice-in-design, applications).

If any decision in this brief contradicts those documents, the documents win. Flag the contradiction and ask before proceeding.

After reading, internalise these non-negotiables:

- **Plus Jakarta Sans only.** Loaded via Google Fonts. SemiBold for headlines, Regular for body, Medium for UI, Bold only inside the wordmark.
- **Five colours, five roles** — Soft Paper (`#F6F7F4`) ground; Emerald (`#0A4B34`) wordmark/headlines/primary UI; Mint (`#A8D5B4`) soft sections + the phrase highlight; Warm Charcoal (`#1A2B22`) body copy; Warm Mid-Grey (`#8B8881`) structure only. No white, no black, no gradients, no tints, no opacities, no expansions.
- **The wordmark** is "help me invest" lowercase, single line — "help me" in Bold, "invest" in Medium, both Emerald. Compact mark "hmi" is reserved for favicons only; never use it inside a page.
- **The Mint phrase highlight** is one-per-surface, on hero/display headlines only, on Soft Paper grounds only (never on Emerald grounds), and only on locked strategic vocabulary — *"on your own terms"*, *"stand alongside, not in front"*, *"show every fee"*, *"back in the hands of"*. Visual treatment: Mint background, Emerald text, ~6px radius, comfortable padding for descenders (~0.25× cap height below baseline, ~0.15× above cap line, ~0.3-0.4× cap height horizontal), line-height bumped to 1.2 on the affected line.
- **The chain-as-vertical-stack diagram** is the brand's signature visual motif. It must appear on the homepage and on the "Understanding wholesale property" education page. Built from labelled Emerald rectangles stacked vertically, knowledge at top, the everyday investor at bottom, small filled Emerald circles positioned *outside* the layers that take a clip. Use a parallel diagram beside it (single direct line, no layers, no clips) to show the alternative.
- **Body column max 720px** even on wide screens. Hero headlines up to ~1000px. Generous breathing room. Pages should require scrolling.
- **Rounded corners** at the scale specified — 6px small UI, 10px buttons/inputs, 14px cards, 20px large containers/photography, 0px full-bleed coloured sections.
- **Voice-in-design.** Buttons say verbs that complete "I want to ___". Forms ask plain questions. No "Get Started", no "Learn More", no asterisks on required fields. Read Section 8 of the guidelines.
- **What HMI never says or does.** No "financial freedom," "passive income," "savvy investor," "exclusive opportunity," "unlock your potential." No drone shots, no suited handshakes, no glass towers, no keys-in-hand imagery. No countdown timers, no urgency banners, no exit popups, no carousels, no "as seen in" logos. No emoji in interface copy. No exclamation marks.
- **Critique the structure, never the players.** Wherever the chain is referenced, the language describes the *pattern*, never a profession or company. "The chain" is the named villain. Specific professions are never.

---

## Step 1 — Technical setup

- **Framework:** React with Vite, or Next.js if you prefer the file-based routing. Either works; pick the one that gets to a navigable multi-page site fastest.
- **Styling:** Tailwind CSS, configured with the HMI palette and Plus Jakarta Sans as the default font. Extend Tailwind's config rather than relying on arbitrary values for the brand colours — designers shouldn't have to remember hex codes.
- **Routing:** Real pages, real URLs. The user should be able to click between Home, Partners, Success Stories, Education (with three sub-pages), and Contact Us. Education should have a landing page that links to the three topic pages.
- **No backend.** This is a mockup. Forms render but do not submit. Education pages do not gate behind an account (the user explicitly said this is out of scope for MVP).
- **Responsive.** Desktop is the primary target. Mobile should degrade cleanly — single column, tap targets sized correctly, the chain diagrams stack vertically and remain readable. Tablet sits between the two.
- **Imagery.** Do not invent or generate photography. Where a hero image, customer portrait, or partner portrait would appear, use a styled placeholder: a Mint or Emerald block at the correct aspect ratio with rounded corners (20px) and a small Warm Mid-Grey label saying e.g. `[ Editorial portrait — customer ]` or `[ Partner photograph ]`. The label is for the reviewer; in production these placeholders get replaced with commissioned photography per Section 5 of the guidelines.
- **Diagrams.** Build the chain-as-vertical-stack diagram in SVG or as styled HTML. It needs to render crisply at any size and be the brand's most recognisable visual asset.
- **Configure Tailwind** with the five brand colours as named tokens (e.g. `bg-paper`, `bg-emerald`, `bg-mint`, `text-charcoal`, `text-grey`). Configure the type scale from Section 3c-d of the guidelines (D1, H1–H4, Body Large, Body, Body Small, Fine Print) as utility classes or semantic component classes.

---

## Step 2 — Global elements (used on every page)

### Header

- Wordmark left-aligned, small. Navigation right-aligned, plain text links in Warm Charcoal (Medium weight, 14–16px), no decoration.
- Nav items: `Home · Partners · Success Stories · Education · Contact`. Active state: Emerald text. Hover: underline appears.
- No "Login / Sign Up" buttons in the header. MVP scope doesn't include accounts; performing the presence of an account system would be misleading.
- Sits at the top of the page with generous margin around it. No background colour — sits on Soft Paper. Optionally a thin Warm Mid-Grey underline below the header to separate it from page content, only if needed for visual clarity.

### Footer

- Soft Paper ground. Generous top padding.
- Three columns on desktop, single column on mobile:
  - **Column 1 — wordmark + a single line of plain copy:** "A platform for the new generation of Australian investors."
  - **Column 2 — Site:** Home, Partners, Success Stories, Education, Contact.
  - **Column 3 — About:** Our beliefs, Our partners, Our standards, Press.
- Thin Warm Mid-Grey rule above the footer.
- Beneath the columns: ABN, registered address, year, in Plus Jakarta Sans Regular Body Small in Warm Charcoal (NOT lightened to grey — fine print is fine in size, not in importance).
- No social media icons cluttering the footer. If included at all, plain text links: "LinkedIn · Instagram", same styling as nav.

---

## Step 3 — Page-by-page specification

The page-by-page sections below describe **structure and content intent**. Use the brand voice for the copy — do not paste in lifestyle-marketing placeholders. Where a section needs filler body copy, write something on-voice. When in doubt, audit each sentence against the voice rules in Section 8 of the narrative bible.

---

### Page 1 — Home

The single most important page in the MVP. The homepage carries three jobs: state the brand's one-liner clearly, make the chain visible, and route the user to the parts of the platform they came for. It does not sell. It does not perform urgency. It reads like the opening of a calm editorial article.

**Sections, top to bottom:**

1. **Hero.**
   - Generous top margin (~160–200px on desktop).
   - One headline at Display scale (D1): **"Property investing _on your own terms_."** The phrase "on your own terms" is the Mint phrase highlight — Mint background, Emerald text, rounded ~6px corners, padded for descenders. Line-height bumped to 1.2 on the highlighted line.
   - One supporting paragraph at Body Large beneath the headline, ~32px gap. Pull copy from the one-paragraph version of the narrative (Section 10b of the narrative bible) but trim to 2 sentences.
   - One primary button: **"Start here →"** (Emerald fill, Soft Paper text, 10px radius). Routes to `/education` for MVP.
   - 120–160px of vertical space before the next section.

2. **The thesis section — "The chain isn't the only way."**
   - Headline H1: *"The chain isn't the only way. It was just the only way you could see."* — Emerald, left-aligned.
   - Body Large beneath, ~2 short paragraphs explaining the chain in plain language. Voice rule: critique the structure, never the players.
   - **The signature diagram.** Two parallel chain-as-vertical-stack diagrams, side by side on desktop (stacked vertically on mobile):
     - **Left diagram:** Labelled "The chain you can't see." Six Emerald rectangles stacked top to bottom — top label *"Knowledge"*, bottom label *"The everyday investor"*, four intermediating layers between (use generic structural labels — *"Layer 1"*, *"Layer 2"*, etc., or descriptive labels like *"Wholesale access"*, *"Information"*, *"Negotiation"* — but NEVER name professions). Thin Warm Mid-Grey lines between each layer. A small filled Emerald circle positioned outside each layer that takes a clip — three to four of them.
     - **Right diagram:** Labelled "The way Help Me Invest works." Two boxes only — *"Knowledge"* at top, *"The everyday investor"* at bottom — connected by a single direct Warm Mid-Grey line. No layers. No clip-markers.
   - Caption beneath each diagram in Body Small, Warm Mid-Grey, naming the source if numbers are shown (for MVP, no numbers are shown — this is a structural diagram).
   - 120px before the next section.

3. **What HMI delivers — three pillars of the promise.**
   - Headline H2: *"Three things the industry has historically kept apart."*
   - Three columns on desktop, stacked on mobile. Each column has:
     - A short Emerald headline (H4): *"Knowledge"*, *"Access"*, *"Trusted experts"*.
     - 2-3 sentences of Body in Warm Charcoal, drawn from Section 6b of the narrative bible.
     - A plain underlined inline link in Warm Charcoal: *"Read how it works →"* — links to the relevant education page or partners page.
   - No icons. No cards. No background colour change. The three columns sit directly on Soft Paper, separated by space.

4. **For the new generation of Australian investors.**
   - Soft Mint section background (full-bleed Mint, no rounded corners on the section itself — this is a full-bleed coloured ground, per Section 7f).
   - Inside, content sits in the 720px column.
   - Headline H2 in Emerald: *"Built for the new generation of Australian investors."*
   - 1–2 paragraphs of Body in Warm Charcoal, drawn from Section 7a of the narrative bible — define the customer by posture, not demographics.
   - Plain underlined link: *"Read the success stories →"* → `/success-stories`.

5. **Confidence rather than trust — the transparency commitment.**
   - Back on Soft Paper ground.
   - Headline H2: *"Every fee. Every source. Every decision. Visible."* (Note: a phrase highlight could go on *"show every fee"* if rewritten — designer's call, but only if it's the cleanest construction. If not, no highlight on this section, since the hero already used it.)
   - 2 sentences of Body explaining HMI's transparency model.
   - Plain underlined link: *"See how our partners get paid →"* → `/partners`.

6. **Closing CTA.**
   - Centred? No — left-aligned, like the rest of the brand.
   - One Display headline: *"Help Me Invest is what property investing should have looked like all along."*
   - One button: *"Start here →"*
   - Generous bottom margin (~160px) before the footer.

---

### Page 2 — Partners

This page does one job: explain who HMI's partners are, what HMI demands of them, and how they get paid. The page exists to make Principle 4 (show every fee, every source, every decision) visible. Reading it should leave the customer thinking *"I can see exactly how this works."*

**Sections:**

1. **Header.**
   - H1: *"The partners HMI vouches for."*
   - Body Large beneath, 2-3 sentences from Section 6b of the narrative bible — partners are recommended on merit, paid transparently, aligned with the investor's outcome.

2. **The standards.**
   - H2: *"What we ask of every partner."*
   - 4 sub-blocks, each with an H4 headline and 2-3 sentences of body. Examples:
     - *"They earn the introduction."* — Vetted on merit, not on commercials.
     - *"They are paid transparently."* — One clear payment arrangement, documented.
     - *"They stand alongside, not in front."* — The customer leads the engagement.
     - *"They are accountable to the outcome."* — The customer can hold them to it.
   - No icons. Plain typography. Separated by space, not by cards.

3. **How partners get paid — the transparency table.**
   - H2: *"How our partners actually get paid."*
   - A clean fee/payment breakdown table built per Section 6c (Family 2 — Quantitative diagrams). Columns: *"Service area"*, *"What the customer pays"*, *"What HMI takes"*, *"What the partner is paid"*, *"Source"*.
   - For MVP, populate with 3-4 realistic example rows (e.g. "Property selection support", "Mortgage broking", "Legal review"). Right-align numbers. Plus Jakarta Sans Medium for column headers, Regular for body.
   - Below the table, a single Body Small line in Warm Mid-Grey: *"As at [Month] 2026. Updated quarterly."*

4. **The partners themselves.**
   - H2: *"Who we vouch for."*
   - For MVP, 3–4 placeholder partner cards. Each card:
     - Editorial portrait placeholder (rounded 20px, aspect ratio 4:5, Mint or Emerald block with `[ Partner portrait ]` label).
     - Plus Jakarta Sans SemiBold H4 — partner name.
     - Plus Jakarta Sans Medium body small — what they do for the customer (NOT what they are in the industry — voice rule). E.g. *"Helps you decide which property to buy, and runs the negotiation if you'd like."*
     - 1–2 sentences of Body — short bio, written in editorial register, not testimonial register.
     - At the bottom of the card, Body Small in Emerald (verifiable): ABN, licence number, year vouched-for.
   - Cards are spaced on a 2-column grid on desktop (1 column on mobile). Cards have 14px corner radius and a thin Warm Mid-Grey border, OR sit directly on Soft Paper with generous spacing between. Pick whichever reads cleaner — the brand prefers space over containers.

5. **Closing line.**
   - Single Body Large line in Warm Charcoal, left-aligned: *"Help is offered. Never imposed."*
   - One plain underlined link: *"See the customer journey →"* → `/education`.

---

### Page 3 — Success Stories

The customer is the hero of every story HMI tells. This page is the editorial home for the *belonging* pillar (Pillar 4 — The New Generation). It is not a testimonial wall. It is a small collection of editorial-quality profiles of real customers.

**Sections:**

1. **Header.**
   - H1: *"The new generation of Australian investors."*
   - Body Large beneath, 2-3 sentences. Drawn from Section 7a of the narrative bible. Reinforce: defined by posture, not by stage.

2. **The stories grid.**
   - For MVP, 4–6 placeholder story cards in a 2-column grid on desktop (1 column on mobile).
   - Each card:
     - Editorial portrait placeholder, 20px radius, 4:5 aspect ratio, `[ Editorial portrait — customer ]` label.
     - H4 headline — the customer's first name, age, location. E.g. *"Sarah, 31, Newcastle."*
     - Body Small in Warm Mid-Grey, single line — a structural label, e.g. *"First investment property · 2025."* Not a category tag styled as a badge — just plain typography.
     - 2-3 sentences of Body — a short editorial extract, not a quote with quotation marks. E.g. *"Sarah spent six months learning the fundamentals on the platform before she bought. She made the call on the suburb herself, and used the wholesale access for the property selection."*
     - Plain underlined link: *"Read Sarah's story →"* (links to a placeholder route — for MVP these are non-functional, but the route exists conceptually).
   - Critically: no star ratings, no testimonial quotation marks, no "trusted by 1,000+ investors" badges, no NPS scores. Editorial register only.

3. **Range section — three investors, one thing in common.**
   - H2: *"Three investors. Three portfolios. One thing in common."*
   - Three short profile vignettes in a row on desktop. Each one is 2 sentences. Use range deliberately: a 26-year-old just starting; a 38-year-old on their second property; a 51-year-old with four properties. What unites them is posture, not stage.
   - This section reinforces that HMI is structurally hard to outgrow.

4. **Closing CTA.**
   - Single Display headline (smaller scale — D1 minimum size or H1 maximum): *"This is what property investing looks like when it's in the hands of everyday Australians."* (Could carry a Mint phrase highlight on *"back in the hands"* if rewritten — but only if the hero on this page didn't already use one. The hero on this page does not, so a highlight here is on the table.)
   - One button: *"See how the platform works →"* → `/education`.

---

### Page 4 — Education (landing page)

The education portal is HMI's core product. The landing page exists to orient the user — three doorways into the three topic areas listed in scope, plus a clear explanation of how the education works.

**Sections:**

1. **Header.**
   - H1: *"Everything you need to invest in property yourself."*
   - Body Large beneath: *"Taught openly. No paywall on the knowledge itself. You decide what you need, when you need it."*
   - Plain copy. No CTA at the hero — the three topic cards are the CTAs.

2. **The three topic areas.**
   - One large card per topic, full-width on desktop (or stacked in a vertical sequence), with generous space between. Each card has:
     - H2 headline in Emerald — the topic title.
     - Body Large beneath, 2-3 sentences explaining what the topic covers.
     - Plain underlined link: *"Start with this →"* — links to the topic page.
     - Body Small in Warm Mid-Grey on a single line — number of lessons, estimated time. E.g. *"8 lessons · ~3 hours of reading."*
   - Topic 1: **Understanding wholesale property.** *"The category of property that has historically flowed only through closed channels — and how the platform opens those channels directly to you."*
   - Topic 2: **Finance.** *"How property is actually financed in Australia. The decisions that compound. What your broker is — and isn't — paid to tell you."*
   - Topic 3: **Property strategy.** *"What to buy, where, why, and when. The frameworks the platform uses, taught from first principles."*

3. **How the education works.**
   - H2: *"How the education works."*
   - 3 short blocks describing the philosophy: *"Read in any order"*, *"No paywall on the fundamentals"*, *"Ask a partner when you're ready"*. Each block is an H4 + 2 sentences.

4. **Note on accounts.**
   - Small Body Small line in Warm Mid-Grey at the bottom of the section: *"Full access is currently open. An account-based system is coming."* This is honest, on-voice, and signals that the MVP is in beta without performing urgency.

---

### Page 5 — Understanding wholesale property

A full long-form education page. Editorial typography, 640–680px column for body, plenty of subheadings. This is the home for the chain-as-vertical-stack diagram in its full educational treatment.

**Sections:**

1. **Header.**
   - Body Small eyebrow, Warm Mid-Grey: *"Education · Understanding wholesale property"*.
   - H1: *"What wholesale actually means."*
   - Body Large beneath: 2 sentences setting up the chapter.

2. **Body sections.**
   - 4–6 H2-headed sections, each with 3–6 paragraphs of Body in Warm Charcoal, in a 640–680px column.
   - Section ideas:
     - *"How property at scale is actually transacted in Australia."*
     - *"What 'wholesale' means — and what it doesn't."*
     - *"Why the channels existed in the first place."*
     - *"What changed — and why the channels no longer need to remain closed."*
     - *"How to evaluate a wholesale opportunity."*
   - Each section is one idea. Voice rule: make the claim, then back it.

3. **The signature diagram, repeated.**
   - The chain-as-vertical-stack diagram appears mid-page, full-width, with a caption beneath it.
   - On this page the diagram is more detailed than the homepage version — labelled boxes can include longer descriptions (still in Plus Jakarta Sans, still no profession names). The diagram is the centrepiece of the chapter, not an aside.

4. **Pull-quote, halfway through.**
   - Set in Plus Jakarta Sans SemiBold at H3 size, Emerald, indented or visually distinguished by space. Drawn from the brand's locked phrases — e.g. *"The chain isn't the only way. It was just the only way you could see."*
   - No quotation marks. No author attribution.

5. **Footer of the page.**
   - Thin Warm Mid-Grey rule.
   - *"Next →"* link to *"Finance."*
   - *"Back to Education"* plain link to `/education`.

---

### Page 6 — Finance (education sub-page)

Same template as Page 5. Editorial long-form layout, body column 640–680px. No chain-stack diagram here unless it earns its place (e.g. a diagram showing how finance fees flow through a typical transaction). A quantitative table or two would belong on this page — e.g. a worked-example fee comparison.

**Sections:**

1. **Header.**
   - Eyebrow: *"Education · Finance."*
   - H1: *"The financing decisions that compound."*
   - Body Large lede.

2. **Body sections.**
   - 4–6 H2-headed sections. Section ideas:
     - *"How property finance actually works in Australia."*
     - *"What your broker is paid — and by whom."*
     - *"The decisions that compound (and the ones that don't)."*
     - *"Fixed, variable, offset: a working framework."*
     - *"Refinancing as strategy."*
   - 640–680px column.

3. **Quantitative diagram.**
   - One worked example: a clean Plus Jakarta Sans table comparing two financing approaches across 5–7 rows. Right-aligned numbers. Source line beneath in Warm Mid-Grey Body Small. Axes start at zero if any chart is added. Per Section 6c (Family 2).

4. **Pull-quote.**
   - One brand-anchored phrase, sized at H3, Emerald.

5. **Footer of the page.**
   - *"← Previous: Wholesale"* / *"Next: Property strategy →"* / *"Back to Education"*.

---

### Page 7 — Property strategy (education sub-page)

Same template again. Same constraints. The third leg of the education portal.

**Sections:**

1. **Header.**
   - Eyebrow: *"Education · Property strategy."*
   - H1: *"What to buy, where, why, and when."*
   - Body Large lede.

2. **Body sections.**
   - 4–6 H2-headed sections. Section ideas:
     - *"First principles: what makes a property work."*
     - *"Suburbs aren't strategies."*
     - *"Yield, growth, and the relationship between them."*
     - *"Timing — what's worth knowing, what isn't."*
     - *"Holding: the discipline most plans skip."*
   - 640–680px column.

3. **Structural diagram (Family 1).**
   - A simple decision-tree-style diagram showing how the platform approaches property selection. Labelled boxes, Warm Mid-Grey connecting lines, Emerald fill on the primary path. No icons.

4. **Pull-quote.**
   - One brand-anchored phrase.

5. **Footer of the page.**
   - *"← Previous: Finance"* / *"Back to Education"*.

---

### Page 8 — Contact Us

A genuinely useful contact page reads like a letter, not a form template. The user should leave it feeling they know exactly how to reach a real person and what to expect when they do.

**Sections:**

1. **Header.**
   - H1: *"Get in touch."*
   - Body Large beneath: *"One of us will read your message and reply within a day. If your question is urgent or specific to a property decision you're making this week, say so — we'll route it to the right partner."*

2. **The form.**
   - Sits in a single column, no card or container around it — directly on Soft Paper. Generous spacing between fields.
   - Fields, all phrased as plain questions (Section 8b of the guidelines):
     - *"What's your first name?"*
     - *"What email should we use?"*
     - *"What's on your mind?"* — a textarea, 5–6 lines tall.
   - One radio-group or dropdown asking *"What's this about?"* with options like *"I'm new — where do I start?"*, *"A question about a specific property or decision"*, *"Partner enquiry"*, *"Press / other"*. Plain options. No icons.
   - Single button: **"Send →"** (Emerald fill, Soft Paper text, 10px radius). The button does not submit for MVP — but the styling and label must be correct.
   - No required-field asterisks. No "please" repeated on every label. No reCAPTCHA placeholder (a real implementation would include one; the mockup doesn't need to perform it).

3. **Alternative routes.**
   - Beneath the form, a small section with two short paragraphs:
     - *"By email: hello@helpmeinvest.com.au"* (or similar placeholder address) — plain text, underlined inline link.
     - *"By post: [registered office address]"* — placeholder, plain text.

4. **Footer copy on the page itself (above the global footer).**
   - One sentence in Body Large, Warm Charcoal, left-aligned: *"Help is offered. Never imposed."*

---

## Step 4 — Things to actively avoid

A consolidated list of things I should be able to look at the finished mockup and confirm are absent. If any of these appear, the design is off-brand.

1. **Visual:** No gradients, no drop shadows on type or boxes, no glassmorphism, no gold or navy, no animated background blobs, no parallax scrolling, no full-bleed photography on every section, no carousel sliders, no logo strips ("As featured in: TechCrunch · The Guardian · ABC News").
2. **Copy:** No "Get Started," no "Learn More," no "Oops!" no "Welcome aboard!", no "Join 1,000+ savvy investors", no "Unlock your wealth potential", no exclamation marks, no emoji in interface copy.
3. **Structure:** No popup overlays, no exit-intent modals, no countdown timers, no cookie banners with pre-checked boxes, no "Only 3 spots left" urgency, no testimonial carousels with star ratings, no LinkedIn-style team-bio cards.
4. **Imagery:** No drone shots of suburbs, no glass-and-chrome offices, no suited handshakes, no keys-being-handed-over, no couples-gazing-out-windows, no stock photography, no AI-generated imagery. Use the placeholder convention specified in Step 1.
5. **Naming:** No specific professions named in any critical context. The chain is the named villain; specific professions never are.

---

## Step 5 — Deliverable structure

Build the site in a single repo with this structure (or equivalent if you're using Next.js):

```
hmi-mvp/
├── package.json
├── tailwind.config.js          ← brand tokens here
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx                 ← router
│   ├── styles/
│   │   └── index.css           ← Plus Jakarta Sans import, base styles
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Wordmark.jsx        ← reusable, parameterised by colour
│   │   ├── PhraseHighlight.jsx ← the Mint highlight component
│   │   ├── ChainDiagram.jsx    ← the signature diagram, parameterised
│   │   ├── Button.jsx
│   │   └── ... (others as needed)
│   └── pages/
│       ├── Home.jsx
│       ├── Partners.jsx
│       ├── SuccessStories.jsx
│       ├── Education.jsx
│       ├── education/
│       │   ├── Wholesale.jsx
│       │   ├── Finance.jsx
│       │   └── Strategy.jsx
│       └── Contact.jsx
└── README.md                   ← how to run, design system notes
```

The `README.md` should briefly document:
- How to run the project locally.
- The five brand colour tokens and their Tailwind class names.
- The type scale.
- Where the `PhraseHighlight` and `ChainDiagram` components live, and how to use them.
- Any deviations from the brief (if you made design judgement calls, document them).

---

## Step 6 — How to know you're done

Before you ship, audit the mockup against these checks:

1. **The five Design Principles (Section 1 of the guidelines).** Each page passes each principle.
2. **The voice rules (Section 8 of the narrative bible, Section 8 of the guidelines).** Every button, headline, paragraph, form label, and microcopy element passes the plain-language test: *"Would a thoughtful adult, asked to write this clearly and briefly, write what's here?"*
3. **The Anti-Brand list (Section 12 of the narrative bible).** Nothing in the mockup positions HMI as the hero, names specific professions, sells the dream, manufactures scarcity, or makes a promise it cannot audit.
4. **The five-colours discipline.** No surface uses a colour outside the palette. No tints, no opacities, no gradients.
5. **The Mint phrase highlight.** Used at most once per page. Only on locked vocabulary. Only on Soft Paper grounds. Never in body copy or UI.
6. **The chain diagram.** Appears on the homepage and on the "Understanding wholesale property" page. Built from labelled rectangles, structural lines, and Emerald clip-markers outside the layers. Recognisable across both uses.
7. **The 720px discipline.** Body copy on every page sits in a column no wider than ~720px, even on wide screens.

If a check fails, fix it before submitting.

---

## One final note

The brand's most distinctive quality is restraint. If you find yourself adding visual interest to fill space, stop. The empty space is the brand. The discipline of *not adding* is the work.

When in doubt — read Section 12 of the narrative bible, then Section 1 of the guidelines. Most off-brand drift gets caught at one of those two layers.
