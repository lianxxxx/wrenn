# Wrenn templates

A template is a kit that turns a user's screenshots, logo and a few words into a video. It isn't code that makes the video by itself. It's a set of instructions plus a starter page that the user's own Claude Code follows.

How a video gets made:

1. Wrenn copies a template's `template/` folder into a new **job folder** and adds the user's files.
2. Wrenn runs the user's own Claude Code in the background in that folder with one line, "make my video". The user never types anything.
3. Claude Code reads `CLAUDE.md`, looks at the assets, and writes the video as a web page in `scene/`. It writes `done.json` when it's finished.
4. Wrenn opens `scene/index.html`, steps through it frame by frame, and saves an MP4.

## Templates

- `feature-walkthrough/`: Hook, one feature per screenshot in a device frame, logo moment, ending line. 15, 30 or 60 seconds.

Each template folder has:

- `template/`: exactly what gets copied into a job folder.
- `sample-job/`: a filled job folder (Wrenn's own screenshots and logo) for testing by hand.

## Job folder layout

```
job-folder/
├── CLAUDE.md          instructions Claude Code follows
├── brief.json         { brandName, endingText, size, length, vibe }  (Wrenn writes this)
├── assets/            the user's logo, screenshots, recordings, fonts (Wrenn copies these in)
├── scene/
│   ├── index.html     the video (Claude Code writes this; the starter is a placeholder)
│   ├── wrenn.js       helpers: canvas, timing, device frames, text reveal, colors, safe area
│   ├── vendor/gsap.min.js
│   └── fonts/         Figtree (default font) and its license
└── done.json          {"ok": true} or {"ok": false, "reason": "..."}  (Claude Code writes this last)
```

`brief.json` values:

- `size`: `reels` (1080x1920), `feed` (1080x1350), `square` (1080x1080), `youtube` (1920x1080)
- `length`: `"15"`, `"30"` or `"60"` (seconds, as a string)
- `vibe`: `playful`, `clean`, `bold` or `calm`

Wrenn has to create the job folder's `assets/` folder itself (the template has no empty folders, since git doesn't keep them).

## The scene contract

The renderer depends on exactly this. `wrenn.js` sets it all up when the scene calls `Wrenn.install({ timeline, duration })`.

- `window.WRENN = { width, height, fps: 30, duration }`. `duration` is in seconds. The page is exactly `width` by `height` CSS pixels.
- `window.seek(t)` jumps the paused GSAP master timeline to `t` seconds (clamped to 0..duration). It **always returns a Promise**. It resolves right away unless the scene has screen recordings, in which case it waits for each video's `seeked` event. The renderer must await it before every capture.
- `window.wrennReady` is a Promise. It exists as soon as `wrenn.js` loads. It resolves (with the `WRENN` object) after fonts, all images and all videos are loaded and frame 0 is drawn. It **rejects** with an error if an image or video fails to load or the scene script throws, so the renderer can stop and report it instead of making a broken video.

How a renderer uses it:

```js
await page.waitForFunction(() => window.wrennReady);   // wrenn.js has loaded
const info = await page.evaluate(() => window.wrennReady); // rejects on a broken scene
const frames = Math.round(info.duration * info.fps);
// resize the window to info.width x info.height, zoom factor 1
for (let i = 0; i < frames; i++) {
  await page.evaluate((t) => window.seek(t), i / info.fps);
  // capture the frame
}
```

Rules that keep every render the same: all motion lives on one paused timeline. No `Date.now`, `requestAnimationFrame` loops, timers, CSS animations or transitions (wrenn.js switches those off), video autoplay, or `Math.random` (use `Wrenn.random(seed)`). Scenes load assets with relative paths (`../assets/...`) from `file://`, and never use the network.

Debug helpers: open `scene/index.html#debug` to see the safe box and the corner zones. Run `await Wrenn.checkSafeArea()` in the console to list anything sitting in a corner or text outside the safe box.

## Credits

- **GSAP** 3.15.1 by GreenSock (`scene/vendor/gsap.min.js`), copied from the `gsap` npm package. Used under GreenSock's standard "no charge" license: https://gsap.com/standard-license. The copyright notice stays at the top of the file.
- **Figtree** by Erik Kennedy (The Figtree Project Authors), licensed under the SIL Open Font License 1.1. The license is in `scene/fonts/OFL-Figtree.txt`.
- Inspired by motion-graphics.org and the motion design creators Lian saves. Wrenn writes its own instructions.
