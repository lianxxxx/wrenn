# Voiceover and music made for the video (design, for Lian to approve)

Date: 2026-11-23. From ROADMAP "Later": "Music made for the video" (2026-11-20) and "Voiceover" (2026-11-19). Size: big feature, planned together because the voice changes how the music is mixed.

Builds on `docs/superpowers/specs/2026-11-08-sound-design.md` (CC0 songs, own song, ElevenLabs song, sound effects from `scene/sound.json`, mixed by ffmpeg in `desktop/src/main/audio/mix.ts`).

## Goal

Make the sound feel like a pro showreel:

1. **Music that follows the edit.** Today the song is picked by vibe and laid under the video. It has the right tempo (120 BPM) but it doesn't know where the cuts are, so the drops, fills and endings land in random places. We want the music's sections and hits to land on the video's own scene changes.
2. **A voice.** Lian's tests felt like they were missing someone talking. The user can add their own voice, or let the AI write a short script and read it.

Still "No prompts. Just render.": the user only picks options. Claude Code does the writing, Wrenn does the rest.

## An honest note first: "code-made music sounds cheap"

Phase 4 says "No code-made music (Lian: sounds cheap)". Then on 2026-11-20 Lian heard the Moondance showreel, which was composed in code, and loved it. Both can be true. Code music sounds cheap when it is plain synth beeps: sine waves, no real drums, no mixing. It sounds good when it is built like a real track:

- **Real sampled drums**, not synthesized ones (kick, snare, clap, hats, crash). We'd add a small CC0 drum kit next to the sound effects in `desktop/resources/`.
- **A few good synth voices** made with Web Audio: a warm bass (detuned saws through a low-pass filter), chord stabs, one pluck lead. Fewer, better sounds.
- **Mixing like a producer**: sidechain (the bass and chords dip on every kick, the "pumping" sound of modern pop), a little reverb on the chords, a bus compressor and limiter at the end.
- **Arrangement**: the energy rises and falls with the sections, fills before a cut, a crash and a drop on the cut, a clear final hit.

So the proposal is: **try A as an experiment**, keep the CC0 songs as the default until Lian has listened, and keep B and the CC0 songs as fallbacks forever. If A still sounds cheap after the listening test, we drop it and nothing is lost.

## What the user sees

Changes on the existing screens only. One column (forms rule).

**Options screen, "Music"** (today: Wrenn songs, your song, ElevenLabs, none):

- **Made for your video** (new, marked "New"): music built to fit this video's cuts. Free, offline.
- **Wrenn songs** (stays, default until the listening test).
- **Made by ElevenLabs** (only with a key): same idea as "Made for your video", but ElevenLabs makes the track from Wrenn's timing plan.
- **Your song**, **No music** (stay as they are).

**Upload screen, new "Voiceover (optional)" field**, under the fonts field:

- **No voice** (default)
- **Your voice**: upload a file (.mp3, .wav, .m4a) or press **Record** and read into the mic. A small hint: "Read slowly. Short is best: about 2 words a second."
- **AI voice** (needs the ElevenLabs key, otherwise shown with "Add your key in Settings"): Claude writes the script, ElevenLabs reads it. A short list of 4 to 6 voices with a play button to hear each one. No script box: the script is written for them.

**Done screen**: same as today, plus a short note if something fell back (for example "ElevenLabs didn't read the script, so your video has music only.").

**Progress screen**: new steps in the same bar: "Writing the music", "Recording the voice", then "Adding sound".

## How it works (step by step)

Who writes what. New files in **bold**.

1. **Wrenn** writes the job folder as today. `brief.json` gets two new fields: `music` (`made`, `wrenn`, `elevenlabs`, `own`, `none`) and `voiceover` (`none`, `own`, `ai`). With `own`, the voice file is copied to `voice/own.<ext>` (not `assets/`, same reason as the own song).
2. **Claude Code** writes `scene/index.html` and `scene/sound.json` as today, plus:
   - **`scene/music.json`**: the timing map of the edit (always, for every music choice, it's cheap). Example below.
   - **`scene/voiceover.json`**: only when `voiceover` is `ai`. The script, one line per scene, each with the time it starts and the most seconds it may take.
3. **Wrenn renders** the silent MP4 (no change).
4. **Wrenn makes the music** from `music.json`:
   - `made` (A): Wrenn's own small music engine turns `music.json` into a WAV (see "A" below).
   - `elevenlabs` (B): Wrenn turns `music.json` into an ElevenLabs composition plan and asks for the track.
   - `wrenn` / `own`: as today. `music.json` is ignored.
5. **Wrenn makes the voice**: `ai` sends each script line to ElevenLabs text to speech. `own` uses the user's file.
6. **Wrenn mixes** music, voice and effects with ffmpeg (one command, like today), music ducked under the voice. Picture copied, not re-encoded.

Why Claude writes a timing map instead of the music itself: Claude is great at knowing where the cuts are (it wrote them), but asking it to write audio code for every video would give a different quality each time, and a bug would mean a silent video. With a map, Claude decides *when*, and Wrenn's tested engine decides *how it sounds*. One map also feeds both A and B.

### `scene/music.json` (Claude Code writes it)

```json
{
  "bpm": 120,
  "sections": [
    { "from": 0, "to": 2, "name": "intro", "energy": 2 },
    { "from": 2, "to": 8, "name": "build", "energy": 3 },
    { "from": 8, "to": 14, "name": "drop", "energy": 5 },
    { "from": 14, "to": 15, "name": "outro", "energy": 1 }
  ],
  "accents": [
    { "t": 2, "type": "crash" },
    { "t": 7.5, "type": "fill" },
    { "t": 8, "type": "drop" },
    { "t": 14, "type": "final" }
  ]
}
```

- `sections` cover the whole video with no gaps, each boundary on a scene change, on the 2 second bar grid where possible. `energy` 1 to 5 says how full the music is.
- `accents`: `crash` (a cymbal on a cut), `fill` (a drum roll into the next beat), `drop` (silence for half a beat, then everything hits), `stop` (music cuts out, for a big moment), `final` (the last hit).
- Wrenn checks everything (like `readHits` does for `sound.json`): times inside the video, sections sorted and touching, unknown types skipped. Broken or missing file: Wrenn uses a plain map (one section, final hit at the end) so A and B still work.

### `scene/voiceover.json` (Claude Code writes it, only for AI voice)

```json
{
  "lines": [
    { "t": 2.0, "max": 2.5, "text": "Tracking money is a chore." },
    { "t": 6.0, "max": 3.0, "text": "Trackr does it for you." }
  ]
}
```

- About 2.5 words per second, so `max` 2.5 s means about 6 words. Lines never overlap and leave room for the ending text.
- Short, spoken, from `about` and the screenshots. No brand slogans invented, no claims the screens don't show.

## A vs B vs fallback

**A. Made in code (default for "Made for your video")**

- Wrenn's engine in a hidden Electron window (Web Audio only exists in a browser, so not in the Node main process), using `OfflineAudioContext`, which renders faster than real time and the same every time.
- Per vibe, a fixed "kit": drum samples, bass, chords, lead, chord progression, swing. Energy 1 to 5 adds or removes layers (1: pad only, 3: kick, hats and bass, 5: everything).
- The engine knows the beat grid (120 BPM, 0.5 s per beat), so every section and accent lands exactly on the video's cuts. This is the part ElevenLabs can't promise.
- Output: `music/made.wav`, exactly the video's length. Then mixed like any song.

**B. ElevenLabs with a composition plan (with a key)**

- `music.json` becomes a `composition_plan` (model `music_v2_5`): one chunk per section with `duration_ms` and `positive_styles` from the vibe and energy ("120 BPM", "punchy drums", "big drop", ...). Sent to `POST /v1/music` with the plan instead of a `prompt` ([compose docs](https://elevenlabs.io/docs/api-reference/music/compose)).
- Limit: each section must be **3 to 120 seconds**. Our scenes are 2 to 4 s, so Wrenn merges short sections into their neighbor (a 15 s video ends up with 3 or 4 chunks). On v2 models the section lengths are always kept ([compose docs](https://elevenlabs.io/docs/api-reference/music/compose)).
- Big win over today: section changes land on our scene changes. Not promised: the exact beat inside a section (the model may drift off 120 BPM), and accents like a fill on 7.5 s.
- Free helper: `POST /v1/music/plan` turns a prompt into a plan and costs no credits ([create plan docs](https://elevenlabs.io/docs/api-reference/music/create-composition-plan)). Useful while testing to see what good plans look like.
- Worth testing too: `POST /v1/music/video-to-music` takes the finished video (up to 600 s, 200 MB) and makes music for it, optionally with sound effects on the cues ([video to music docs](https://elevenlabs.io/docs/api-reference/music/video-to-music)). It might follow the cuts with no plan at all. Try it next to B in the listening test.
- Found while reading: today's `elevenlabs.ts` sends no `model_id`, so it uses `music_v1`, which ElevenLabs removes on **January 31, 2027** ([models page](https://elevenlabs.io/docs/overview/models)). Switching to `music_v2_5` is a small fix we should do anyway.

**Fallback (always)**

- A fails (engine error, timeout) → a Wrenn CC0 song for the vibe. B fails (no credits, no connection) → A, then a CC0 song. Same rule as today: sound is a bonus, the video always finishes, the Done screen says what happened.

## Voiceover options

**Your voice (upload or record)**

- Upload: copied to `voice/own.<ext>`, cleaned up by ffmpeg (cut silence at the start, a high-pass to remove rumble, loudness to about -16 LUFS), placed from the start of the brand open (about 0.5 s in).
- Record: the browser's `MediaRecorder` in the upload screen, saved as a file, then the same as upload. Windows asks for mic access once.
- We don't know the words, so the voice isn't lined up with scenes. Fine for v1 of this. Later, Whisper (planned for edit mode in v3) could give word times for captions.

**AI voice (ElevenLabs, user's key)**

- Each script line goes to `POST /v1/text-to-speech/{voice_id}/with-timestamps` ([docs](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps)). The answer has `audio_base64` plus `alignment`: every character with its start and end time in seconds. Wrenn adds up characters into words.
- Model `eleven_multilingual_v2` (up to 10,000 characters per request, far more than we need) or `eleven_flash_v2_5` (cheaper, faster) ([models page](https://elevenlabs.io/docs/overview/models)). `previous_text` and `next_text` keep the tone smooth between lines.
- If a line is longer than its `max`, Wrenn first asks again with `voice_settings.speed` a little higher, then trims the silence, and if it still doesn't fit, it may run into the next gap (never over the next line). We log it.
- Voices: a fixed list of 4 to 6 ElevenLabs premade voices (ids in code, names shown in the app). The user's own cloned voices are a "later".
- Captions: the word times make on-screen captions possible, but the scene is already drawn before the voice exists. Captions are left out of this plan (see question 6).
- **Local TTS (Kokoro)**: later, as planned. The same `voiceover.json` would feed it, so nothing here blocks it.

## Mixing (ducking)

Same one ffmpeg command in `mix.ts`, one more input:

- **Voice** is the lead. Loudness about -16 LUFS, light compression so quiet words still come through.
- **Music ducks under the voice**: a `sidechaincompress` keyed by the voice, stronger than today's duck for effects (about 6:1, attack 20 ms, release 300 ms so the music comes back up smoothly between lines, not in jumps). With a voice, the music also starts lower overall (about 0.45 instead of 0.7).
- **Effects** a bit quieter when there's a voice, and effects that fall in the middle of a spoken word get softer, so they don't cover it.
- A (made in code) can do better than ducking: Wrenn knows the voice times before it renders the music, so it can drop the lead and thin the chords while someone talks. Nice extra, not required.
- Then the same limiter and AAC as today.

## Risks and open questions for Lian

1. **Default music**: keep "Wrenn songs" as the default until you've heard A, then decide? (Recommended: yes.)
2. **Drum kit**: OK to add a small CC0 drum kit (kick, snare, clap, hats, crash, about 15 short files) to `desktop/resources/`, credited in `CREDITS.md` like the songs?
3. **Listening test**: are 3 test videos enough (one playful 15 s, one clean 30 s, one bold 30 s), each with A, B, video-to-music and a CC0 song, for you to pick?
4. **Voice timing**: for AI voice, OK that Claude guesses each line's length (about 2.5 words a second) and Wrenn squeezes it to fit? The other way is a second Claude Code run after the voice is made, which is exact but adds minutes to every video.
5. **Your voice, recorded in the app**: needed in the first version, or is upload enough at first? (Recording adds a mic permission and a bit of UI.)
6. **Captions**: on-screen captions from the voice's word times, in this feature or later? (Later is simpler: it needs the scene to know the voice first, see question 4.)
7. **AI voice list**: are 4 to 6 fixed voices fine, or do you want the user's own ElevenLabs voices in the list too?
8. **Script language**: English only for now, or follow the brief's language?
9. **Cost**: ElevenLabs Music and TTS use the user's credits. Show a small "uses your ElevenLabs credits" line next to those options?
10. **Risk, A sounds cheap**: if after the test A still sounds cheap, we drop it and keep B and the CC0 songs. Agree that this is the deal?
11. **Risk, B drifts off the beat**: the model may not keep 120 BPM exactly, so sound effects on the 0.5 s grid could feel a little off against the music. If it bothers you, B could skip the sound effects or we try video-to-music instead.
12. **Risk, longer wait**: A adds a few seconds, B and TTS add up to a minute or two (network). The progress bar's time estimate needs these steps added.

## Build order (each step one commit, tests first)

Music first, voice second, so each can ship on its own.

1. **music.json reader**: `readMusicMap()` next to `readHits()` in `sounds.ts`, with the same "trust nothing" checks and the plain fallback map. Tests first (good file, broken file, gaps, out of range).
2. **Template**: a new step in the template `CLAUDE.md` to write `scene/music.json` from the real scene times, plus the check before `done.json`. Test: the job checks see the file.
3. **Drum kit**: add the CC0 drum samples and their credits (after question 2). Test: `listSfx`-style loader finds them.
4. **Music engine (A)**: `music.json` + vibe kit → WAV in a hidden window with `OfflineAudioContext`. Tests: WAV length equals video length, loud peaks land on section changes and accents (within 10 ms), same input gives the same file.
5. **Wire "Made for your video"**: new `MusicChoice` `made`, progress step, fallback to a CC0 song. Tests: choice flows from the screen to the job, fallback note on failure.
6. **Listening test with Lian** (no code): the 3 videos from question 3. Decide the default.
7. **B, composition plan**: pure function `music.json` → `composition_plan` (merge sections under 3 s, styles per vibe and energy), switch to `music_v2_5`. Tests on the function, then one real call by hand.
8. **Mixer, voice track**: add a voice input and voice ducking to `mixSound()`. Tests: the ffmpeg filter has the voice duck, output length still equals the video.
9. **Your voice, upload**: the "Voiceover" field, copy to `voice/`, cleanup, mix. Tests: field, copy, mix.
10. **AI script**: template step for `scene/voiceover.json` (only when `voiceover` is `ai`) and its reader with checks. Tests first.
11. **AI voice**: ElevenLabs text to speech with timestamps per line, fit to `max`, voice picker in the field. Tests with a fake server (never a real key in tests).
12. **Record in the app** (if question 5 says now), and the Done screen notes.
13. **Review**: lint, type check, build, code and design review, then Lian double-checks.
