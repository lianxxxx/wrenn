# HyperFrames check: sound and editing

Date: 2026-11-08. Follow-up to `2026-11-07-phase-3.md` (section 2). Read from the repo and its docs folder on GitHub (the docs site timed out, so I read the same `.mdx` files from `docs/` in the repo).

## Short answer

- **Sound:** borrow ideas, don't use it. Its audio model is great, but it's built for its own render pipeline. Wrenn's plan (ffmpeg mix after frames) already matches the core of what HyperFrames does.
- **Editor:** borrow ideas, maybe reuse later. Its browser editor has a real timeline (move, trim, split, snapping, beats, ripple, audio meters). The React parts are published, but the docs say they are "building blocks, not a drop-in embedded editor". Too big and too fast-moving to drop into Wrenn now.

## Version and license

- Latest: **v0.9.23**, released 2026-11-08 (today). Still pre-1.0. Four tags since my last check two days ago (v0.9.19 then). Expect breaking changes.
- About 80.7k GitHub stars, pushed to every day.
- License: **Apache-2.0** for the whole repo (root `LICENSE`). Package `package.json` files don't list their own license, so I'm assuming the root license covers them (normal for a monorepo, but not stated per package).
- The **Studio app** (the desktop app) is a separate download from hyperframes.studio and needs a free HeyGen sign-in. I could not find its source in the repo, so I'm treating it as **not open source**. Unsure.

## How it handles sound

- Sound lives in the HTML. Each sound is an `<audio>` (or `<video>` with sound) with `data-start`, `data-duration`, `data-volume`, optional `data-media-start` (in-point) and `loop`.
- No separate session file: "A composition carries its whole mix in the HTML."
- Extra attributes for the mix:
  - `data-automation`: volume (or effect) envelopes over time, as JSON keyframes.
  - `data-fx-chain`: effects in order (EQ, compressor, limiter, delay, chorus, pitch shift, and more).
  - `data-audio-group` + `<hf-audio-group>`: buses like "Voiceover" or "Music", each with its own volume and effects.
  - A master chain on the root (for example a limiter on the whole mix).
  - `data-fx-carve`: "voiceover carve", the music dips only where the voice is.
- Mixing: tracks are summed at unity (nothing averages them). Export keeps the file under -1 dBTP; if the mix is too hot it lowers the whole mix by one flat amount.
- Under the hood: the engine (`packages/engine/src/services/audioMixer.ts`) builds an **ffmpeg filter graph** (atrim, volume envelopes as segments, then mix) and writes `audio.m4a`, which is muxed with the frames. Same idea as Wrenn's plan.
- Free sound sources in their tool: "a bundled set" of SFX plus Openverse, local Kokoro voices, music you add. Music catalog and better voices need HeyGen.
- Audio analysis (`npx hyperframes audio ... --read`): finds timed hits and guesses voice / music / sfx. Stem splitting and descriptions need a HeyGen key.

### What Wrenn could borrow for sound

- Keep the "sound is data next to the scene" idea (our `scene/sound.json`). Their per-clip shape (`start`, `duration`, `volume`, `mediaStart`, `loop`) is a good model for when the editor needs real tracks.
- Ducking with a volume envelope per clip, simplified to a small number of segments (they cap at 32 because ffmpeg's `volume=...:eval=frame` gets slow). Useful when we duck music under each hit.
- Groups (Music, SFX, Voice) with one fader each. Easy to show as three sliders in a non-techy UI.
- A limiter on the master, and fail the render loudly if the mix data is broken (they do; Wrenn's spec says fall back to music only, which is friendlier for our users).
- Their mix checklist: watch once with sound, once muted, listen once without watching; music should "end on purpose".

## Editing model and timeline

- The **browser editor** (`npx hyperframes preview`) has: files, preview, a Design panel, and a timeline.
- Timeline actions: move a clip, trim either edge, split at playhead (B for razor, S to split), copy/duplicate/delete, linked selection (video + its sound move together), snapping to playhead/clips/beats, **ripple edit** on by default, audio meters, "add beat at playhead" markers, keyframes.
- Every timeline change saves straight to the project files (the HTML). So the editor and the AI edit the same source. This is the most useful idea for Wrenn: the editor should write the same files Claude Code writes, not a second format.
- Shortcuts follow normal video editors (Space, J/K/L, I/O, arrows to step frames). Good reference list if we build one.
- `@hyperframes/studio` (npm) exports `StudioApp`, `Timeline`, `Player`, `NLEPreview` and more. Needs **React 19** (Wrenn already uses React 19) and Zustand (Wrenn does not use it yet). The docs warn the parts need Studio's own project state and contexts.
- `@hyperframes/player` is a small `<hyperframes-player>` web component to play a composition in a page. Could be handy for an in-app preview, but only if our scenes are HyperFrames compositions.

### What Wrenn could borrow for the editor

- One source of truth: timeline edits write the scene + sound files, Claude reads the same files.
- Clip = start, duration, in-point, volume. Track rows: video, music, SFX, voice.
- Beat markers you can snap cuts to (fits "music synced to cuts").
- Ripple delete on the main track, linked selection for a clip and its sound.
- The CapCut-like basics (cut, trim, volume, music, voiceover) map one to one onto features they already have, so their docs are a good spec to copy behavior from (not code).

## Verdict

| | Use it | Borrow ideas | Skip |
| - | - | - | - |
| Sound / mixing | | Yes | |
| Editor / timeline | Maybe later (v3) | Yes, now | |

- **Sound, now:** keep Wrenn's own ffmpeg mix. Borrow: per-clip volume envelopes for ducking, Music/SFX/Voice groups, master limiter.
- **Editor, v3:** design our timeline after theirs (clip shape, ripple, beats, linked sound). Re-check `@hyperframes/studio` when it hits 1.0; reusing it means switching Wrenn's scenes to HyperFrames compositions plus adding Zustand and their whole editor state, which is a big move.
- Not a reason to switch the render engine. That call from the phase 3 doc still stands.

## Unsure

- Whether the Studio desktop app is open source (looks closed, needs HeyGen login).
- Whether each npm package is Apache-2.0 (no per-package license field, root LICENSE is Apache-2.0).
- The license of the "bundled set" of SFX inside HyperFrames. I did not check it, so don't copy those files.
- How usable `Timeline` is outside `StudioApp` in practice. I only read the docs, not the code.

## Sources

- Repo: https://github.com/heygen-com/hyperframes (tags, LICENSE, `packages/`)
- Voice, music, captions: https://github.com/heygen-com/hyperframes/blob/main/docs/guides/voice-and-audio.mdx
- Audio attributes and mixing: https://github.com/heygen-com/hyperframes/blob/main/docs/reference/audio-effects.mdx
- Browser editor: https://github.com/heygen-com/hyperframes/blob/main/docs/studio/index.mdx
- Timeline: https://github.com/heygen-com/hyperframes/blob/main/docs/studio/timeline.mdx
- Studio package: https://github.com/heygen-com/hyperframes/blob/main/docs/packages/studio.mdx
- Player package: https://github.com/heygen-com/hyperframes/blob/main/docs/packages/player.mdx
- Studio app: https://github.com/heygen-com/hyperframes/blob/main/docs/studio-app/index.mdx
- Mixer code: https://github.com/heygen-com/hyperframes/blob/main/packages/engine/src/services/audioMixer.ts
