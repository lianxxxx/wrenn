# Wrenn tests

Playwright tests that open the real built app and click through it like a user would. Run them before every release.

## How to run

From the `desktop` folder:

```
npm test
```

This builds the app first (`electron-vite build`), then runs every test. It takes about a minute. Wrenn windows will pop open and close on their own while it runs: that's normal, leave them alone.

Other handy ways to run:

- `npx playwright test tests/app.spec.ts` runs one file (build first with `npx electron-vite build` if you changed code).
- `npx playwright test -g "Settings"` runs only the tests with "Settings" in the name.
- `npx playwright show-report` opens the report from the last run in your browser.

If a test fails, Playwright tries it once more. A test that passes on the second try shows as "flaky" in the report: worth a look, but not a blocker.

## Your real files are safe

- Each test gets its own fresh temp folder for settings and videos, and deletes it when done. The app is pointed there with two test-only settings, `WRENN_TEST_USER_DATA` and `WRENN_TEST_OUTPUT_DIR` (see `src/main/index.ts` and `src/main/library.ts`).
- The real Claude Code never runs, so no tokens are used. The startJob tests hide Claude Code from the app, just in case.
- `job.spec.ts` does start video jobs, but with a fake Claude Code (`fakeClaude` in `helpers.ts`): a tiny script that only waits and never talks to anyone. The real one is hidden from the app at the same time. Each test cancels its job.

## What each test covers

`app.spec.ts` (the screens)

- **First launch shows the setup screen.** With no settings yet, the setup screen opens. It only checks the screen shows; it never clicks Sign in.
- **Home.** Both cards show, "Edit my video" can't be clicked and says "Coming soon", and a video placed in the videos folder shows up under "Your videos".
- **Template path.** Pick a template, then step 2: size, length and vibe can be picked, Wrenn's music is picked to start with. "Your own song" shows the song box and greys out Next until a song is added. "A new song" with no ElevenLabs key asks for the key and greys out Next. "No music" lets you go on. Step 3 shows, and "Make my video" stays greyed out with no files.
- **Settings.** Type an ElevenLabs key, click away, close and reopen the app: the key is still there. On disk the key is encrypted, never plain text (when Windows can encrypt).

`start-job.spec.ts` (the main process)

- **startJob turns down bad requests.** Sends broken requests (no brand name, "own" music with no song, unknown music, no files, a "What does it do?" over the limit, a picture sent as a font, a fake template, ElevenLabs with no key) and checks each gets a plain message, and that no job folder was made.
- **startJob takes fonts.** WOFF2, WOFF, TTF and OTF files (upper case names too) pass the check.

`upload.spec.ts` (step 3, "Add your stuff")

- **"What does it do?" box.** The counter goes up as you type and typing stops at the limit (300, from `src/shared/limits.ts`).
- **Fonts box.** It shows with its hint, turns down a picture with a plain message, takes all four kinds of font, each file has its own x to remove it, and "Remove all" empties it.

`job.spec.ts` (starting a job, with the fake Claude Code)

- **brief.json.** "What does it do?" is saved as `about`, trimmed, and left out when it's empty or only spaces.
- **timings.json.** With no file, a broken file or the wrong shape, the time left is the first-time guess. An older file without the music kind still loads, ElevenLabs runs don't slow down the guess for other music, and broken runs are skipped.
- **Progress bar.** "Making your video" has a progress bar with its name, 0 to 100 values and a spoken value like "0%, about 8 min left". Screen readers hear the step, not the ticking numbers. Cancel asks first ("Yes, stop"), then goes back to the upload step and says the files are still there.
- **From the upload screen.** Types the about text, adds a picture and a font, presses "Make my video": the about text is in brief.json and the font is in the job's assets folder.

`eta.spec.ts` (the time left, no window)

- **Progress math.** The guess per part comes from past videos (or a first-time guess), ElevenLabs songs are timed apart from other music, a part that runs long never says zero, rendering uses the real frame speed, the screen never steps back, and the time left reads as "About 3 min left" or "Almost done".
- **Never backward.** Over a whole video with wobbly guesses, the bar never goes back, the time left never goes up, and it never says 100% before it's done. Missing or broken numbers are ignored. "Almost done" starts at 45 seconds left, and only once the bar is at 90% or more.

`notify.spec.ts` (the "video finished" notification, no window)

- **When and what.** Notifies only when Wrenn isn't in front (another app, or minimized), never with no window, and says "Your video is ready" or "Your video didn't finish" in plain words. No real notification is shown.

`sound.spec.ts` (the sound engine, no window)

- **Render CLI adds music.** Renders the small test scene (`src/main/render/test-scene`) to an MP4 with Wrenn's playful music, the same way `npm run render` does. Then checks with ffmpeg: the video has sound, the sound is as long as the picture, and it's still loud a second before the end (so the music doesn't run out early). This one is slow, about 15 to 30 seconds.
