# App screens + engine test + Phase 3 research (design)

Date: 2026-11-07. Size: project, split across 3 agents working in parallel.

## Intent

Start the real Wrenn desktop app. Build every screen as a clickable app with fake data (no real rendering yet), and at the same time test the render engine and answer the Phase 3 research questions, so Phase 4 can connect the real engine without redoing anything.

## Decisions (from Lian)

- Two ways to start: **Make from a template** and **Edit my video** (upload your own video).
- Edit my video is **automatic by default** (Wrenn decides subtitles, cuts, zooms and color). A **Customize** option lets people pick: subtitle style, cuts on/off, zoom punches on/off, auto color on/off, and the screen size (9:16, 4:5, 1:1, 16:9). Edit features are planned for v3 in CLAUDE.md; the screens are designed now so the app has room for them.
- UI first with fake data, in the real `desktop/` app (Electron + Vite + React + TypeScript + Tailwind).
- Approved packages: Electron, Vite, React, Tailwind, GSAP, ffmpeg-static (plus Playwright, already in the stack).

## Agent 1: app screens (`desktop/`, except `desktop/engine/`)

- Set up Electron + Vite + React + TypeScript + Tailwind v4 (using the standard electron-vite React TS starter).
- Use the shared brand: `brand/tokens.css` (including dark mode) and copies of `brand/fonts/`. Follow `DESIGN.md`.
- Screens, all with fake data and working navigation:
  1. **First run setup:** "Claude Code found" check (faked), optional ElevenLabs key.
  2. **Home:** choose Make from a template or Edit my video.
  3. **Template path:** template picker (1 template, the rest "coming soon"), options (size, length, vibe), upload photos/videos + brand name and CTA.
  4. **Edit path:** upload a video, Customize panel (closed by default).
  5. **Generating:** progress screen with fake progress.
  6. **Done:** video preview (sample) + "Open folder".
  7. **Settings:** ElevenLabs key, output folder, light/dark.
- No real backend: buttons that would render, detect or save just fake it.

## Agent 2: engine test (`desktop/engine/` only, its own package)

- A 5 second 1080x1920 HTML + GSAP scene that supports `seek(time)`, captured frame by frame and encoded to MP4 with ffmpeg-static.
- Try capture with Playwright first; note what Electron capture would need.
- Result: a working MP4, plus a short note recommending the render method for Phase 3.

## Agent 3: Phase 3 research (report only, no code)

- Do Anthropic's terms allow an app to run the user's own Claude Code? If not, the fallback (user's own API key).
- HyperFrames: license, and whether it fits as Wrenn's engine (vs Electron or Playwright capture).
- How to detect an installed, signed-in Claude Code on Windows.
- Result: `docs/research/2026-11-07-phase-3.md`.

## Not in this round

- Real Generate (running Claude Code), real subtitles (Whisper), real cuts and color grading, packaging, auto updates.

## Rules for all agents

- Work on a new branch `app-screens` (from `hero-gallery`). Don't commit or push.
- Stay in your own folder. No other new packages without asking.
- Don't run lint, tests or builds unless needed to make the engine test produce its MP4; Lian checks when she says she's done.
- Plain, human copy. No em dashes.
