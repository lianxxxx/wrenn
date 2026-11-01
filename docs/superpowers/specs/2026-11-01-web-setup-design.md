# Web setup + shared tokens (design)

Date: 2026-11-01. Size: small change.

## Intent

Start Phase 2. Set up the landing page project in `web/` so it's ready to build on, and show a simple test page tonight with Wrenn's real colors, fonts, blobs and buttons, to confirm the brand works in code.

## Goals

- `web/` is a working Next.js + TypeScript + Tailwind v4 project (`npm run dev` shows a page).
- Design tokens from `DESIGN.md` live in one shared file, `brand/tokens.css`, used by `web/` now and `desktop/` later.
- Bubblegum Sans and Figtree load from local files (no Google Fonts CDN).
- A test page at `/` shows: color swatches, both fonts at their sizes, blob words (light and dark background rules), primary / on-dark / ghost buttons, a pill label.
- Playwright is installed with one test: the page loads and both fonts are applied.

## Non-goals (tonight)

- The real landing page layout (navbar, hero, cards, footer). That's the next session.
- Anything in `desktop/`.
- Deploying to Vercel.

## Approaches

- **A. Shared `brand/tokens.css` (picked by Lian).** One source of truth for web and desktop. If a color or the background changes, both update. Costs a one-line import from outside `web/`.
- B. Tokens only inside `web/`. Simpler tonight, but desktop would need a copy that can drift.

## Decisions

- Scaffold with the official `create-next-app` (App Router, TypeScript, Tailwind, ESLint, `src/` folder). Lian approved Next.js as part of the stack.
- `brand/tokens.css` uses Tailwind v4 `@theme` syntax so tokens become classes like `bg-navy`, `text-lemon`, `font-display`, `rounded-pill`.
- Background token `--color-bg` defaults to cream `#FFF8EC` (still undecided, one-line change).
- Fonts copied from `brand/fonts/` into `web/` and loaded with `next/font/local`.
- New dev dependency: `@playwright/test` (already in the roadmap). No other new packages.

## Left to the builder (Claude's calls)

- Exact file names inside `web/src/`.
- Test page layout (simple stacked sections, it's throwaway until the real landing page).
