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
  - [x] Logo draft: `brand/logo/logo-draft.png` (tail + "wrenn" + sound lines), used in the navbar. Still to trace as SVG. Plan was: [colorful tail feathers only, no bird body] + "wrenn" in navy Bubblegum Sans + [music note or the beak sound lines] after the word. Lian makes the tail-only asset (cut it from the traced mascot SVG). Until then, crop the tail from the PNG as a placeholder in the navbar
- [x] Pick brand colors: **Navy** `#023047` (text, headlines, buttons, navbar, footer). Blob colors: red `#D62828`, orange `#F77F00`, lemon `#F3DA2E`, lime `#82B51F`, sky `#8ECAE6`, teal `#219EBC`. Background: cream `#FFF8EC` or white, **decide when building**. Draft brand guide: `inspo/mocks/brand-guide.html` (gitignored)
- [x] Pick fonts (display + body): **Bubblegum Sans** (logo, headlines, blob words) + **Figtree** (descriptions, paragraphs, app UI). Self-hosted WOFF2 in `brand/fonts/` (from Fontsource, OFL license files included). No Google Fonts CDN
- [x] Write Wrenn's own `DESIGN.md` at the repo root (colors, fonts, spacing, components, do's and don'ts) so agents use exact values instead of guessing
  Optional format reference: VoltAgent/awesome-design-md (read only, no install). Do not copy another brand's design

## Phase 2: Design

- [x] Design tokens in code (Tailwind theme: colors, fonts, spacing, radius): `brand/tokens.css`, shared by web/ and desktop/
- [x] Install Playwright in `web/` (once `web/` is set up): `npm i -D @playwright/test` then `npx playwright install chromium`
- [x] Landing page layout: hero, how it works ("Tap. Render. Post."), demo video, download, footer. Done for now: hero, How it works, From photos to video, Made for every feed, FAQ, Download, cloud footer, Privacy and Credits pages, dark mode draft. Visuals that need real app output are placeholders (see Phase 5)
- [ ] Later (after the mascot SVG): install Python + img2threejs (needs the finished mascot). Repo: hoainho/img2threejs (Apache-2.0). Check its README for a project-only install so worktrees get it. Note: result is an approximation, best on clear, simple shapes
- [x] Landing page motion: hero entrance, blob pops, grouped scroll reveals, nav circle draw (CSS + one small component, no React Bits needed so far). The interactive 3D mascot (img2threejs) waits for the mascot SVG
- [x] Run `/impeccable critique` and Emil's animation review on the landing page (fixes committed on the `hero-gallery` branch)
- [x] App screens (real Electron app in `desktop/`, fake data, checked with a code and design review):
  - [x] Setup screen (Claude Code found / not installed / not signed in, optional voiceover key)
  - [x] Home: two ways to start (Make from a template, Edit my video) + "Your videos" list
  - [x] Template picker
  - [x] Options: platform/size, length, vibe
  - [x] Upload assets + details (brand name, ending text), one column
  - [x] Edit my video: upload + Customize (subtitles, cuts, zooms, color, size), automatic by default
  - [x] Generating / progress screen
  - [x] Done screen (preview + open folder)
- [x] Settings screen
- [x] Easier setup screens: "Install Claude Code" and "Sign in" buttons so users never see a terminal (fake for now; real in Phase 4, after Anthropic answers)

## Phase 3: Research (before building the AI part)

- [x] Research report: `docs/research/2026-11-07-phase-3.md` (answer: grey area, ask Anthropic)
- [x] Decision (Lian, 2026-11-07, final): stick with the original concept. Wrenn runs the user's own Claude Code in the background (`claude -p`), the user only clicks ("No prompts. Just render."). Wrenn is Lian's personal side project; if Anthropic ever objects, switch to the user's own API key
- [x] Pick render method: Electron's own Chromium capture + ffmpeg-static (no extra browser to download). Playwright for dev and tests. HyperFrames maybe later (Apache 2.0, not stable yet)

## Phase 4: Build v1

- [x] Render engine proof of concept: 5s HTML animation to MP4 (`desktop/engine/`, Playwright, about 29s to render)
- [ ] Sound: 3 music options for users (free CC0 songs in Wrenn as the default, ElevenLabs Music with their own key, or their own song) + sound effects on the cuts, merged into the MP4. No code-made music (Lian: sounds cheap). Plan: docs/superpowers/specs/2026-11-08-sound-design.md (Built 2026-11-08, waiting for Lian to listen.)
- [x] Check HyperFrames: does it help with sound or with the video editor later? (No for sound, we do the same with ffmpeg. Borrow its timeline ideas for the editor later. docs/research/2026-11-08-hyperframes.md)
- [x] Electron + Vite + React app shell (`desktop/`)
- [x] Playwright tests in `desktop/` (`npm test`: home, template path, music, settings, job checks, sound). See desktop/tests/README.md
- [x] Setup screen: detect Claude Code installed and signed in (real check, `desktop/src/main/claude.ts`)
- [x] First template: feature walkthrough (`desktop/templates/feature-walkthrough/`, examples Lian liked in `examples/`)
  - Source: https://motion-graphics.org/ (gallery + /prompts). Credit every creator and the site in the README and /credits. The site has no license and says prompts belong to their creators: use it for inspiration and write our own prompts, or get the creator's OK before copying a prompt word for word
- [x] Size picker + length picker
- [x] Make my video: Wrenn makes the job folder, runs Claude Code in the background, Wrenn renders the MP4 (Electron capture) into the Videos/Wrenn folder
- [x] Real "Your videos" list and saved settings (setup only once)
- [ ] Landing page (`web/`)

## Phase 5: Test

- [ ] Make 3 real videos with it (Trackr, Beavr, one more)
- [ ] Replace the landing page placeholders with real Wrenn output: hero visual (gallery idea, inspo 11), the sample video, the "your photos" frame, the 4 size frames, and the demo video
- [ ] Test on a fresh Windows laptop (no Node, no dev tools)
- [ ] Ask 2 to 3 non-techy friends to try it, watch where they get stuck
- [ ] Fix the top issues

## Phase 6: Package + Deploy

- [x] Package app with electron-builder (Windows `.exe` first, Mac later). `npm run dist`, see desktop/PACKAGING.md
- [ ] Note: unsigned apps show warnings (Windows SmartScreen, Mac blocks unsigned). Decide: ship unsigned with a "how to open" guide for v1, or pay for code signing later
- [x] Auto updates via GitHub Releases (electron-updater). Repo must be public for it to work
- [ ] Upload installer to GitHub Releases
- [ ] Deploy landing page to Vercel, connect domain
- [ ] Download button points to latest GitHub Release
- [x] README: setup guide, screenshots, credits to prompt sources, license (MIT), ElevenLabs terms note

## Phase 7: Launch

- [ ] Make the launch video WITH Wrenn (dogfooding)
- [ ] Make repo public
- [ ] Footer: point "GitHub" and "Report a problem" to the public repo and its Issues page (they are "#" until then, in `web/src/components/site-footer.tsx`)
- [ ] Review the Privacy page (`/privacy`) once Phase 3 confirms how Wrenn runs Claude Code, and the Credits page (`/credits`) so every font, library, prompt source and asset is listed
- [ ] Post on TikTok, X, Reddit, Product Hunt, Facebook dev groups (PH)
- [ ] Collect feedback, plan v2

## Plan after launch

Release v1 first, then improve with the features below (Lian, 2026-11-08).

## Later

- v2: more templates (promo, product showcase, testimonial, stats, tips), export all sizes at once, ElevenLabs
- v3: edit mode (user's own video + Whisper), local TTS (Kokoro)
- Lian's feature list (2026-11-07), after v1 is final:
  - macOS version: same Electron code, built by GitHub Actions on a Mac (can't build it on Windows). Shared on GitHub only, unsigned, so the README needs a 'how to open on Mac' guide (Privacy & Security, Open Anyway). Signing ($99/yr) not needed
  - Sidebar in the app: Home, templates, your videos, settings
  - Choose the AI: Claude Code or GPT (Codex CLI), plus a model picker (for example Opus). Same Option B flow: the user runs it themselves
  - Optional prompt box, hidden under 'Advanced' so 'No prompts. Just render.' stays true for most people
  - Video editor with a timeline (layout like CapCut, Wrenn's own design): cut and trim, music track, voiceover, volume. Start simple, no effects, masks or stickers at first
