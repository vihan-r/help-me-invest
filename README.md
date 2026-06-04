# Help Me Invest

The production website for **Help Me Invest (HMI)** — a platform that helps everyday
Australians invest in property on their own terms by (1) teaching how property investing
works and (2) introducing people to vetted experts when they want help. It is a
learning-and-introductions platform, **not** a listings site, marketplace, or place to
transact.

Built mobile-first. See [`Website Development Brief — Help Me Invest.md`](./Website%20Development%20Brief%20%E2%80%94%20Help%20Me%20Invest.md)
for full scope, MVP, and roadmap.

## Tech stack

| Layer     | Choice                             |
| --------- | ---------------------------------- |
| Framework | Next.js 16 (App Router) + React 19 |
| Language  | TypeScript                         |
| Styling   | Tailwind CSS v4                    |
| Linting   | ESLint 9 (flat config) + Prettier  |
| Hosting   | Vercel (planned)                   |

Back-end services (Supabase, Payload CMS, GoHighLevel, email/SMS, analytics, Bunny Stream
video) are wired in during Phase 2 — see the brief.

## Prerequisites

- **Node.js** ≥ 20.9 (see [`.nvmrc`](./.nvmrc); run `nvm use` if you use nvm)
- **npm** (the project standardises on npm)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables (optional for the Phase 1 front end)
cp .env.example .env.local   # then fill in values as needed

# 3. Run the dev server
npm run dev                  # http://localhost:3000
```

## Scripts

| Command                | What it does                      |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Start the local dev server        |
| `npm run build`        | Production build                  |
| `npm run start`        | Serve the production build        |
| `npm run lint`         | Lint with ESLint                  |
| `npm run lint:fix`     | Lint and auto-fix                 |
| `npm run format`       | Format the codebase with Prettier |
| `npm run format:check` | Check formatting without writing  |
| `npm run typecheck`    | Type-check with `tsc --noEmit`    |

## Project structure

```
help-me-invest/
├── src/
│   └── app/                 # Next.js App Router (routes, layout, global CSS)
├── public/                  # Static assets
├── Help Me Invest Website v3/   # Design reference — HTML source of truth (not built; not linted)
├── HMI_Brand_Guidelines.md      # Brand/visual identity reference
├── Website Development Brief — Help Me Invest.md
├── .env.example             # Environment variable template (no secrets)
└── ...config (eslint, prettier, tailwind/postcss, tsconfig)
```

### Design reference is the source of truth

`Help Me Invest Website v3/` contains the delivered HTML/CSS design files. **These are the
source of truth for layout and styling** — the production components are built to match
them. The brand guidelines govern design/copy decisions; where the two disagree, the HTML
wins. These reference files are excluded from the build, ESLint, and Prettier.

## Secrets

`.env*` files are gitignored (except `.env.example`). Never commit real credentials.

## Working conventions

Work is tracked on the Notion **Product Backlog** with stable `FEAT-` IDs. Branches and PRs
reference the relevant card, e.g. `feat-22/project-scaffold`.

## Build status

The site is being built **front-end-first**, one reviewable stage at a time:

- **Stage 0 — Project scaffold (FEAT-22, partial)** ✅ — this commit.
- Stage 1 — Design system as code (FEAT-21)
- Stage 2 — Site shell (FEAT-36)
- …then page shells, per the agreed plan.
