# First real template: Feature walkthrough (design)

Date: 2026-11-07. Phase 4, step "First template". Size: big feature.

## Intent

Make the first template that turns a user's screenshots, logo and brand name into a real, good-looking video. This step makes the template work end to end by hand (folder in, MP4 out). Connecting it to the app's buttons is the next step ("Real Generate").

## How it works (Option B)

1. Wrenn makes a **job folder** with everything Claude Code needs:
   - `assets/`: the user's screenshots, recordings and logo (copies)
   - `brief.json`: brand name, ending text, size, length, vibe
   - `CLAUDE.md`: the template's instructions (scenes, timing, motion rules, anti-slop rules from our CLAUDE.md)
   - `scene/`: a starter page with GSAP, the brand fonts, and `seek(time)` already set up
2. The user opens Claude Code in that folder and types one line: **make my video**.
3. Claude Code writes the scenes into `scene/` and a `done.json` file when it's finished.
4. Wrenn renders `scene/` to MP4 with the engine.

## The template (what the video looks like)

A 15, 30 or 60 second walkthrough, in 4 parts:
1. **Hook:** the brand name or one bold line, big and readable on mute
2. **Features:** each screenshot in a device frame, one at a time, with a short label (zoom or pan to the important part)
3. **Logo:** the user's logo with the brand colors
4. **Ending:** the ending text (for example "Download it free")

Rules: the user's real fonts and colors, nothing in the corners, motion with easing and overshoot, every scene supports `seek(time)`.

Inspiration: motion-graphics.org and TikTok prompts Lian saves (we write our own instructions and credit the creators in the README and /credits).

## Work (2 agents in parallel, then me)

- **Agent 1, template kit** (`desktop/templates/feature-walkthrough/`): the `CLAUDE.md` instructions, the starter `scene/`, a small helper script (device frame, text reveal, brand colors), and a sample job (Wrenn's own app screenshots as test assets).
- **Agent 2, render in Electron** (`desktop/src/main/render/`): move the engine from Playwright to Electron's own hidden window (research pick), so users don't need an extra browser. Same `seek`, screenshot, ffmpeg idea.
- **Me, test:** run Claude Code on the sample job for 2 sizes (Reels and YouTube), render both, check them, and show Lian the 2 MP4s.

## Not in this step

- The app's "Make my video" button making the job folder and waiting for Claude Code (next step: Real Generate)
- Music and sound effects (later step)

## Done when

Two real MP4s (9:16 and 16:9) made from the sample job look good to Lian. Type check and build pass.
