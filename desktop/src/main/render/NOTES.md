# Render engine (Electron)

Turns a scene folder into an MP4 using Electron's own Chromium. Same idea as the
Playwright test in `desktop/engine/`, but no extra browser to download.

## Files

- `render.ts`: `renderScene({ sceneDir, outFile, onProgress?, signal? })`
- `cli.ts`: dev tool to render from the terminal (built as `out/main/render-cli.js`)
- `test-scene/`: the engine test scene, adapted to the contract below, with its own copies of GSAP and the brand fonts

## Run it without the app

```
cd desktop
npm run render -- src/main/render/test-scene render-test.mp4
```

It builds, opens no window, prints progress and the time, then quits.
MP4 files are ignored by git, so the test video won't get committed.

## Scene contract

A scene is a folder with `index.html` that:

- sets `window.WRENN = { width, height, fps, duration }` (duration in seconds)
- has `window.seek(t)`, which may return a Promise (we always await it)
- has `window.wrennReady`, a Promise that resolves when fonts and images are loaded
- loads only local files (relative paths). Anything not `file:`, `data:` or `blob:` is blocked.

## How it works

1. A hidden offscreen `BrowserWindow` opens the scene: sandboxed, no Node, no preload,
   its own session that blocks the network, no navigation, no popups.
2. Wait for `wrennReady` (30 second limit), read `WRENN`, size the window to it.
3. For each frame: `seek(frame / fps)`, wait two `requestAnimationFrame`s so the picture
   is painted, `capturePage()`, and send the raw BGRA pixels into ffmpeg's stdin.
4. ffmpeg (`ffmpeg-static`) writes H.264, `yuv420p`, crf 18, `+faststart`.
5. If anything fails or the render is cancelled: ffmpeg is killed, the half-written
   MP4 is deleted, the window is destroyed. Errors from ffmpeg include its log.

## Speed (test scene, 1080x1920, 150 frames, Lian's laptop)

- Playwright version: 28.6 s
- This version: **11.3 s** (about 2.5x faster)
- Per frame: about 30 ms waiting for the paint, 30 ms for `capturePage()`, a few ms to write.
- Raw pixels beat JPEG (11 s vs 14.6 s): no JPEG encode and decode per frame.

## Gotchas (found while testing)

- **Windows display scaling.** At 125% the window came out 1081x1922, not 1080x1920.
  `thickFrame: false` fixes it (no invisible resize border). `offscreen.deviceScaleFactor: 1`
  keeps 1 CSS pixel = 1 video pixel. If the size is still off, `toPixels()` resizes as a safety net.
- **Paint timing.** Two faster tricks gave wrong (stale) frames, so don't use them:
  `webContents.setFrameRate(240)` and grabbing the offscreen `paint` event (4.5 s, but frames
  didn't match). Seek + two rAFs + `capturePage()` at the default frame rate matched the
  Playwright render on every frame, and two runs gave byte-identical frames.
- **Broken pipe.** If ffmpeg dies, writing to it gives `EPIPE`. `writeFrame` then waits for
  ffmpeg's own error (with its log) instead of reporting a bare `EPIPE`. The engine version
  in `desktop/engine/` still has the bare `EPIPE` behavior.

## Packaging (later)

ffmpeg can't run from inside the `app.asar` archive. In the electron-builder config add:

```
asarUnpack:
  - node_modules/ffmpeg-static/**
```

`render.ts` already swaps `app.asar` for `app.asar.unpacked` in the ffmpeg path.
`ffmpeg-static` is approved under `allowScripts` in `package.json` (its install script downloads ffmpeg).

## Not done yet

- Audio (plan: render it separately, let ffmpeg mix it in).
- Cancelling was written but only tested through the error path, not a real abort from the UI.
