# Wrenn

Tagline: "No prompts. Just render."
Secondary line (e.g. how it works section): "Tap. Render. Post."
Name: Wrenn, from the wren bird (small, loud singer, fits music sync) and sounds like "ren-der". Brand colors and logo: TBD.

Free, open-source desktop app that makes showreel-style motion graphics videos with Claude. Built for non-techy users: no prompts, no terminal, just buttons.

## How it works (user flow)

1. User visits the landing page, downloads the app.
2. First open: setup screen. Detect the user's installed Claude Code (they log in to Claude Code themselves). Optional ElevenLabs API key.
3. User picks a template, platform/size, length, vibe, uploads assets (logo, screenshots, screen recording), types a few details (brand name, CTA).
4. Click Generate. The app runs the user's Claude Code in the background to build the video.
5. Output: MP4 saved on the user's computer.

## Tech stack

- `desktop/`: Electron + React + TypeScript + Vite + Tailwind. Packaged with electron-builder.
- Video engine: HTML/CSS/JS scenes + GSAP. Capture frames with Electron's Chromium (or Playwright). Encode to MP4 with FFmpeg (`ffmpeg-static`).
- Audio: Web Audio `OfflineAudioContext` for local music and SFX. ElevenLabs optional (user's own key). Local TTS (Kokoro) later.
- AI: the user's own installed Claude Code, run by the app. Never ship or share an Anthropic or ElevenLabs key.
- Storage: no database. Local files only (settings as JSON, keys in local config).
- `web/`: landing page, Next.js, deployed on Vercel.

## Repo structure

```
motion-app/
├── CLAUDE.md
├── web/        # landing page (Next.js)
└── desktop/    # the app (Electron + Vite + React)
    └── engine/ # HTML to MP4 render engine
```

## Roadmap

`ROADMAP.md` is the step by step plan from brand to launch. At the start of every session, read it, find the first unchecked step, and remind Lian what's next before starting work. When a step is done, check it off.

## Rules for agents

- Lian generates brand images herself (mascot, logo, app icon). Do NOT generate or draw these. If a task needs them and they're missing, ask her for the files and use a clearly marked placeholder meanwhile.

- Stay inside the folder your task is about. Do not edit `web/` when working on `desktop/`, and vice versa.
- One task per session. If the task grows, stop and say so.
- Local-first: no servers, no hosted database, no telemetry.
- Ask before adding a new dependency. Prefer small, well-known packages.
- TypeScript everywhere. Keep code simple and readable over clever.
- Lian is the developer and is learning. After each change, explain what you did in a few short lines, plain words.
- Do not commit secrets. `.env` stays in `.gitignore`.
- If unsure about something, say so instead of guessing.

## Engineering workflow (Superpowers)

- Use the Superpowers workflow for features: brainstorm, write a plan, work in a worktree, test first (TDD), then review.
- Keep plans short and in plain words. Lian is learning, so explain the why behind each step, not just the what.
- Ask Lian to approve the plan before writing code.
- Do not use Ponytail in this repo.

## Design skills and tools

- `DESIGN.md` (repo root, once written) is the source of truth for colors, fonts, spacing. Always follow it.
- Inspo lives in `inspo/INSPO.md` (gitignored, so worktrees don't have it). Read it from the main checkout: `C:\Users\Leyanne\Desktop\Projects\wrenn\inspo\INSPO.md`. Use it for direction, never copy another brand's design.
- Impeccable: design rules and audits. Use `/impeccable audit` and `/impeccable critique` before calling UI work done.
- Taste skill: overall design direction for UI and landing page.
- Emil Kowalski skills: any animation or micro-interaction work, plus animation review.
- If skills disagree, `DESIGN.md` wins, then Lian decides.
- Playwright: tests for app and landing page.
- Landing page: React Bits for animated components, img2threejs for the interactive 3D logo/mascot. Purposeful motion only.

## Video rules (anti-slop)

- Every scene must support `seek(time)` so rendering is deterministic, frame by frame.
- No text or frames in the corners. No generic stock transitions.
- Use the user's real brand fonts and colors.
- Text big and readable on mute.
- Motion with purpose: easing, overshoot, secondary motion, continuity between scenes.
- Music and SFX synced to cuts and taps.

## Size presets

- TikTok / Reels / Stories: 1080x1920
- FB / IG feed: 1080x1350
- Square: 1080x1080
- YouTube / website: 1920x1080

## Phases

- v1: one template (feature walkthrough) + size picker + local audio + render to MP4
- v2: more templates, export all sizes at once, ElevenLabs
- v3: edit mode (user's own video, Whisper transcription), local TTS

## Open questions

- Confirm Anthropic's terms allow an app to run the user's Claude Code subscription. Fallback: user's own Anthropic API key.
- Electron Chromium capture vs Playwright vs HyperFrames for rendering (check HyperFrames license).

## License

MIT. Credit all prompt sources in the README.
