# Wrenn Roadmap

"No prompts. Just render."

Check off each box as you go. Claude: read this file at the start of every session, find the first unchecked step, and remind Lian what's next.

---

## Phase 0: Setup

- [x] Create `motion-app` folder (rename to `wrenn` later if you want)
- [x] Add `CLAUDE.md` and `ROADMAP.md`
- [x] `git init` and first commit
- [x] Add project to Orca
- [x] Push to a new GitHub repo (can stay private until launch)

## Phase 0.5: Install skills and tools

Install at the repo root and COMMIT `.claude/skills` so every Orca worktree gets them. Check each repo's README for the latest install command before running.

- [x] Superpowers (senior engineer workflow: brainstorm, plan, worktrees, TDD, review). Install this FIRST
  `/plugin marketplace add obra/superpowers-marketplace`
  `/plugin install superpowers@superpowers-marketplace`
  Then restart Claude Code. Do NOT install Ponytail in this repo (it conflicts with Superpowers' tests and structure)

- [x] Impeccable (design rules, anti-slop, `/impeccable audit`, `/impeccable critique`)
  `npx -y skills add pbakaus/impeccable --skill impeccable --agent claude-code`
- [x] Taste skill (premium, adjustable design direction, motion-first)
  `npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend`
- [x] Emil Kowalski skills (animation and micro-interaction craft, animation review)
  `npx skills add emilkowalski/skills --skill emil-design-eng --skill review-animations --agent claude-code`
Playwright, img2threejs, React Bits and awesome-design-md can't be set up yet (they need the app, the mascot, or `DESIGN.md` first). They're moved to the step where they're used, so Claude will remind you there.

## Phase 1: Brand

- [x] Domain: no paid domain. Use a subdomain of Lian's portfolio, `wrenn.leyanne.com` (set up later in Phase 6)
- [ ] Optional: check GitHub org/name, TikTok, IG, X handles
- [x] Collect inspo (logos, colors, motion brands you like). Saved in `inspo/INSPO.md`. Lian explains her paper sketches during development
- [ ] **Mascot, app icon and logo** (Lian makes these; Claude does NOT draw or generate them):
  - [x] Mascot: a wren inspired by the **Ibong Adarna** (the Filipino bird whose song changes its colors). Navy body, golden beak and music note, tail of 6 feathers in the 6 blob colors. Draft: `brand/mascot/mascot-transparent-draft.png`
  - [x] App icon: the bird on a cream blob inside a navy squircle. Draft: `brand/mascot/app-icon-draft.png`
  - [ ] Trace both as clean SVGs (Figma or vectorizer.ai). Fixes the fringe specks around the note and tail, and gives the icon transparent corners (the draft has black corners)
  - [ ] Export the app icon sizes (16, 32, 256, 512px) + `.ico` for Windows (Claude can do this once the SVG exists)
  - [ ] Logo / wordmark: "wrenn" in Bubblegum Sans + the bird
- [x] Pick brand colors: **Navy** `#023047` (text, headlines, buttons, navbar, footer). Blob colors: red `#D62828`, orange `#F77F00`, lemon `#F3DA2E`, lime `#82B51F`, sky `#8ECAE6`, teal `#219EBC`. Background: cream `#FFF8EC` or white, **decide when building**. Draft brand guide: `inspo/mocks/brand-guide.html` (gitignored)
- [x] Pick fonts (display + body): **Bubblegum Sans** (logo, headlines, blob words) + **Figtree** (descriptions, paragraphs, app UI). Self-hosted WOFF2 in `brand/fonts/` (from Fontsource, OFL license files included). No Google Fonts CDN
- [x] Write Wrenn's own `DESIGN.md` at the repo root (colors, fonts, spacing, components, do's and don'ts) so agents use exact values instead of guessing
  Optional format reference: VoltAgent/awesome-design-md (read only, no install). Do not copy another brand's design

## Phase 2: Design

- [ ] Design tokens in code (Tailwind theme: colors, fonts, spacing, radius)
- [ ] Install Playwright in `web/` (once `web/` is set up): `npm i -D @playwright/test` then `npx playwright install chromium`
- [ ] Landing page layout: hero, how it works ("Tap. Render. Post."), demo video, download, footer
- [ ] Install Python + img2threejs (needs the finished mascot). Repo: hoainho/img2threejs (Apache-2.0). Check its README for a project-only install so worktrees get it. Note: result is an approximation, best on clear, simple shapes
- [ ] Landing page motion: React Bits components (no install: copy only the ones you use from reactbits.dev) + interactive 3D logo/mascot (img2threejs) in the hero. Keep it purposeful, not everything moving
- [ ] Run `/impeccable critique` and Emil's animation review on the landing page
- [ ] App screens:
  - [ ] Setup screen (detect Claude Code, optional ElevenLabs key)
  - [ ] Template picker
  - [ ] Options: platform/size, length, vibe
  - [ ] Upload assets + details (brand name, CTA)
  - [ ] Generating / progress screen
  - [ ] Done screen (preview + open MP4)
- [ ] Settings screen

## Phase 3: Research (before building the AI part)

- [ ] Confirm Anthropic's terms allow an app to run the user's own Claude Code. If not, fallback: user's own Anthropic API key
- [ ] Pick render method: Electron Chromium capture vs Playwright vs HyperFrames (check license)

## Phase 4: Build v1

- [ ] Render engine proof of concept: 5s HTML animation to MP4 (`desktop/engine/`)
- [ ] Local audio: Web Audio music + SFX, merged into MP4
- [ ] Electron + Vite + React app shell (`desktop/`)
- [ ] Install Playwright in `desktop/` (app tests, maybe the render engine too)
- [ ] Setup screen: detect Claude Code installed
- [ ] First template: feature walkthrough
- [ ] Size picker + length picker
- [ ] Generate button runs Claude Code, renders MP4, saves to user's folder
- [ ] Landing page (`web/`)

## Phase 5: Test

- [ ] Make 3 real videos with it (Trackr, Beavr, one more)
- [ ] Test on a fresh Windows laptop (no Node, no dev tools)
- [ ] Ask 2 to 3 non-techy friends to try it, watch where they get stuck
- [ ] Fix the top issues

## Phase 6: Package + Deploy

- [ ] Package app with electron-builder (Windows `.exe` first, Mac later)
- [ ] Note: unsigned apps show warnings (Windows SmartScreen, Mac blocks unsigned). Decide: ship unsigned with a "how to open" guide for v1, or pay for code signing later
- [ ] Auto updates via GitHub Releases (electron-updater)
- [ ] Upload installer to GitHub Releases
- [ ] Deploy landing page to Vercel, connect domain
- [ ] Download button points to latest GitHub Release
- [ ] README: setup guide, screenshots, credits to prompt sources, license (MIT), ElevenLabs terms note

## Phase 7: Launch

- [ ] Make the launch video WITH Wrenn (dogfooding)
- [ ] Make repo public
- [ ] Post on TikTok, X, Reddit, Product Hunt, Facebook dev groups (PH)
- [ ] Collect feedback, plan v2

## Later

- v2: more templates (promo, product showcase, testimonial, stats, tips), export all sizes at once, ElevenLabs
- v3: edit mode (user's own video + Whisper), local TTS (Kokoro)
