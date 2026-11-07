# Sound: music and sound effects (design, for Lian to approve)

Date: 2026-11-08. Phase 4, step "Local audio". Size: big feature.

## Intent

Every Wrenn video gets music and sound effects that land on the cuts, so it feels like a real showreel. No copyright problems, no extra cost, works offline.

## Decisions to make (Lian)

1. **Where the music comes from** (pick one or more):
   - **A. Wrenn makes its own music** in code (Web Audio, already the plan in CLAUDE.md). Simple beats and melodies, one style per vibe (playful, clean, bold, calm). No copyright at all. Recommended as the default.
   - **B. A few free songs inside Wrenn** (CC0 music, for example from FreePD). Sounds more "real", but we must check each song's license and credit it.
   - **C. Your own song**: an optional "Add music" box on the upload screen.
   - **D. ElevenLabs music** with the user's own key (later, v2).
2. **Voiceover** (ElevenLabs, optional key): now or later? Recommended: later (v2), so v1 ships sooner.

Recommendation: **A + C** for v1.

## How it works (A + C)

1. **Beat grid:** the template already lands hits on a steady grid (every 0.5 s). Claude Code also writes a small `scene/sound.json`: the moments of each cut, pop and whoosh (for example `{ "bpm": 120, "hits": [{ "t": 0.5, "type": "pop" }, ...] }`).
2. **Music:** Wrenn builds the track with `OfflineAudioContext` from the vibe (tempo, drums, a simple chord loop, a soft ending), exactly as long as the video. With C, the user's song is used instead, faded in and out and trimmed to the length.
3. **Sound effects:** small sounds made in code (pop, whoosh, click, soft riser), placed on the `hits` from `sound.json`, a bit quieter than the music.
4. **Mix:** music lowered a little under each effect (ducking), then a gentle limiter so nothing is too loud.
5. **Into the MP4:** the mixed WAV is added by ffmpeg after the frames are rendered (AAC audio). The video part doesn't change.

## Work (2 agents in parallel, then me)

- **Agent 1, audio engine** (`desktop/src/main/audio/`): music per vibe, the effects, the mix, the WAV, and merging it into the MP4 with ffmpeg.
- **Agent 2, template + app**: teach the template to write `sound.json`, add the optional "Add music" box (one column, below the files), and pass it to the job.
- **Me, test:** make 2 videos (Reels + YouTube), listen, fix, show Lian.

## Not in this step

Voiceover, ElevenLabs music, picking from a music library, editing the sound by hand (that's the video editor, later).

## Done when

Both test videos have music and effects that match the cuts, sound good to Lian, and the type check and build pass.
