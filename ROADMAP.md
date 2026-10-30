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
- [ ] Taste skill (premium, adjustable design direction, motion-first)
  `npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend`
- [ ] Emil Kowalski skills (animation and micro-interaction craft, animation review)
  `npx skills add emilkowalski/skill --skill emil-design-eng` (verify repo name on GitHub)
- [ ] Playwright (testing the app and landing page; also usable by the render engine)
  `npm i -D @playwright/test` then `npx playwright install chromium`
- [ ] img2threejs (turn the logo/mascot image into an interactive Three.js model for the landing page hero). Repo: hoainho/img2threejs (MIT, Python). Note: result is an approximation, best on clear, simple shapes
- [ ] React Bits (animated React components for the landing page) from reactbits.dev, copy only the ones you use
- [ ] Optional: awesome-design-md, as a FORMAT reference only to write Wrenn's own `DESIGN.md`. Do not copy another brand's design

## Phase 1: Brand

- [ ] Check availability: domain (wrenn.app, getwrenn.com), GitHub org/name, TikTok, IG, X handles
- [ ] Grab a "wren" domain variation too (optional, for redirect)
- [ ] Collect inspo (logos, colors, motion brands you like)
- [ ] **Lian generates the images herself** (Claude does NOT generate these):
  - [ ] Wren mascot (the bird)
  - [ ] App icon (works small: 16px, 32px, 512px)
  - [ ] Logo / wordmark "Wrenn"
- [ ] Pick brand colors (primary, accent, neutrals, dark mode)
- [ ] Pick fonts (display + body)
- [ ] Write Wrenn's own `DESIGN.md` at the repo root (colors, fonts, spacing, components, do's and don'ts) so agents use exact values instead of guessing

## Phase 2: Design

- [ ] Design tokens in code (Tailwind theme: colors, fonts, spacing, radius)
- [ ] Landing page layout: hero, how it works ("Tap. Render. Post."), demo video, download, footer
- [ ] Landing page motion: React Bits components + interactive 3D logo/mascot (img2threejs) in the hero. Keep it purposeful, not everything moving
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
