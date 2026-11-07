# Engine test notes

A first test of how Wrenn turns an HTML scene into an MP4.
Result: a 5 second, 1080x1920, 30fps video, 150 frames, about 0.44 MB.

## How to run it

```
cd desktop/engine
npm install
npx playwright install chromium   # only the first time
npm run render
```

The video lands in `out/test.mp4` (ignored by git).

## How it works

1. `scene/index.html` is a normal web page. It has one GSAP timeline that is **paused**, so nothing moves on its own.
2. The page puts a `window.seek(t)` function on the page. It jumps the timeline to exactly `t` seconds.
3. `src/render.ts` opens the page in headless Chromium (Playwright), waits for the brand fonts (`document.fonts.ready`), then for each of the 150 frames:
   - calls `seek(frame / 30)`
   - takes a JPEG screenshot
   - writes that image straight into ffmpeg's input (stdin)
4. ffmpeg (from `ffmpeg-static`) turns the stream of images into an H.264 MP4 (`yuv420p`, `+faststart`, so it plays on phones and social apps).

Why seek instead of "just recording the screen": the picture for frame 42 only depends on the number 42, never on how fast the computer is. A slow laptop takes longer but makes the exact same video. That is why the scene can't use `Date.now`, `requestAnimationFrame` loops, or CSS animations.

## How long it took

- Render: **28.6 seconds** for 150 frames (about 5 frames per second) on Lian's Windows laptop.
- So roughly 6x slower than real time. A 30 second video would take about 3 minutes.
- Most of the time is the screenshot step. Ideas to speed it up later: lower JPEG quality, capture with the Chrome DevTools `HeadlessExperimental.beginFrame` API, or render 2 to 4 pages in parallel and join the parts.

## Audio

Not in this test. The MP4 has no sound. The plan is to make the audio track separately (Web Audio `OfflineAudioContext`, synced to the same timeline times) and let ffmpeg mix it in at the end.

## What Electron's own capture would need

Wrenn is already an Electron app, and Electron ships its own Chromium. So we could skip Playwright:

- Make a hidden `BrowserWindow` with `show: false` and `webPreferences: { offscreen: true }`, size 1080x1920, and `setZoomFactor(1)`.
- Load the same `scene/index.html`.
- Same loop: `webContents.executeJavaScript("seek(t)")`, then `webContents.capturePage()` to get the image, then `image.toJPEG(95)` into ffmpeg's stdin.
- Or use `webContents.beginFrameSubscription()` / the offscreen `paint` event, but those fire whenever Chromium paints, so you have to be careful to match each painted frame to the right seek time. `capturePage` after each seek is simpler and safer.
- Watch out for: the display's scaling (Windows at 125% or 150%) changing the captured size, and offscreen windows throttling. Set `backgroundThrottling: false`.
- ffmpeg-static would need to be unpacked from the asar archive when packaging (`asarUnpack` in electron-builder), since a binary inside asar can't run.

## Recommendation

- **For the app: use Electron's own capture.** Users won't have Playwright's Chromium (about 120 MB extra download) unless we bundle it, and Electron already has a Chromium inside. The seek, screenshot, pipe to ffmpeg idea stays exactly the same, only the "take a screenshot" part changes.
- **Keep Playwright for development and tests.** It's handy to render scenes from the terminal without opening the app, like this test does.
- **HyperFrames:** worth a look only if its license allows it (another agent is checking). It would save us writing this loop, but this loop is about 100 lines and we control it fully. Unless HyperFrames gives something big (faster capture, built-in audio), our own small engine is simpler to own.

## Packages used

gsap 3.15.1, ffmpeg-static 5.3.0, playwright 1.65.0, typescript 7.0.2, tsx 4.23.15, @types/node 26.6.6.

npm asked before running install scripts, so `ffmpeg-static` (downloads the ffmpeg binary) and `esbuild` (used by tsx) are approved in `package.json` under `allowScripts`.
