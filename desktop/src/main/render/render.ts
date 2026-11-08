// Renders one scene folder (index.html) to an MP4, one frame at a time.
// Steps: open the scene in a hidden Electron window, seek to each frame's time,
// grab the picture, and pipe the raw pixels straight into ffmpeg.
// The scene contract (WRENN, seek, wrennReady) is described in NOTES.md.

import { BrowserWindow, session, type NativeImage } from 'electron'
import { spawn } from 'child_process'
import { once } from 'events'
import { existsSync, mkdirSync, rmSync } from 'fs'
import { dirname, join, resolve } from 'path'
import ffmpegStatic from 'ffmpeg-static'

export type RenderOptions = {
  /** Folder that holds the scene's index.html */
  sceneDir: string
  /** Where the MP4 goes. Replaced if it already exists. */
  outFile: string
  /** Called after each frame is sent to ffmpeg. frame counts from 1. */
  onProgress?: (frame: number, total: number) => void
  /** Abort this to stop the render. The half-written MP4 is deleted. */
  signal?: AbortSignal
}

// What the scene puts on window.WRENN
type SceneInfo = { width: number; height: number; fps: number; duration: number }

// How long the scene gets to load its fonts and images before we give up
const READY_TIMEOUT_MS = 30_000

// The capture windows share one private session, so the network block below
// never touches the main app window.
const RENDER_PARTITION = 'wrenn-render'
let sessionReady = false

// Only local files may load. Anything else (http, https, ws...) is cancelled,
// so a scene can't phone home or pull in remote fonts and scripts.
function lockDownSession(): Electron.Session {
  const renderSession = session.fromPartition(RENDER_PARTITION)
  if (!sessionReady) {
    renderSession.webRequest.onBeforeRequest((details, callback) => {
      const protocol = new URL(details.url).protocol
      const allowed = protocol === 'file:' || protocol === 'data:' || protocol === 'blob:'
      callback({ cancel: !allowed })
    })
    // Scenes never need the camera, notifications and so on
    renderSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false))
    sessionReady = true
  }
  return renderSession
}

// ffmpeg-static points inside app.asar in the packaged app, but a program can't run
// from inside an asar archive. electron-builder's asarUnpack puts it next to it.
export function getFfmpegPath(): string {
  if (!ffmpegStatic) throw new Error('ffmpeg-static has no ffmpeg for this computer.')
  return ffmpegStatic.replace('app.asar', 'app.asar.unpacked')
}

function startFfmpeg(info: SceneInfo, outFile: string) {
  const args = [
    '-y',
    // Input: raw BGRA pixels on stdin, one full frame after another
    // (measured faster than JPEG: no encode and decode step per frame)
    '-f', 'rawvideo',
    '-pix_fmt', 'bgra',
    '-s', `${info.width}x${info.height}`,
    '-framerate', String(info.fps),
    '-i', 'pipe:0',
    // Output: H.264 MP4 that plays everywhere (phones, social apps)
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-r', String(info.fps),
    '-movflags', '+faststart',
    outFile
  ]

  const ffmpeg = spawn(getFfmpegPath(), args, { stdio: ['pipe', 'ignore', 'pipe'], windowsHide: true })

  // Keep only the end of the log, that's where ffmpeg explains what went wrong
  let log = ''
  ffmpeg.stderr.on('data', (chunk) => (log = (log + chunk.toString()).slice(-4000)))

  const done = new Promise<void>((resolve, reject) => {
    ffmpeg.on('error', reject)
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg exited with code ${code}\n${log}`))
    })
  })

  // The real error always arrives through "done", so these just stop crashes:
  // writing to a dead ffmpeg emits "error", and "done" may reject before anyone awaits it.
  ffmpeg.stdin.on('error', () => {})
  done.catch(() => {})

  return { stdin: ffmpeg.stdin, done, process: ffmpeg }
}

// Write one frame to ffmpeg, and wait if its input buffer is full.
// If ffmpeg dies while we wait, "done" rejects, so we never hang forever.
// A broken pipe (EPIPE) makes "once" reject too, but ffmpeg's own log says more,
// so on a pipe error we wait for "done" and report that instead.
function writeFrame(stdin: NodeJS.WritableStream, data: Buffer, done: Promise<void>): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (stdin.write(data)) resolve()
    else
      Promise.race([once(stdin, 'drain').catch((e) => done.then(() => Promise.reject(e))), done]).then(
        () => resolve(),
        reject
      )
  })
}

// Rejects after ms, with a message that says what we were waiting for
function timeout(ms: number, what: string): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(`Timed out waiting for ${what}`)), ms).unref())
}

function abortError(): Error {
  const error = new Error('Render cancelled')
  error.name = 'AbortError'
  return error
}

// Check what the scene told us, so a typo gives a clear error instead of a broken video
function checkSceneInfo(info: unknown): SceneInfo {
  const i = info as Partial<SceneInfo> | null
  const ok = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0
  if (!i || !ok(i.width) || !ok(i.height) || !ok(i.fps) || !ok(i.duration)) {
    throw new Error(`The scene's window.WRENN is missing or wrong: ${JSON.stringify(info)}`)
  }
  // H.264 with yuv420p needs even sizes
  if (i.width % 2 !== 0 || i.height % 2 !== 0) {
    throw new Error(`The scene size must be even numbers, got ${i.width}x${i.height}`)
  }
  return { width: i.width, height: i.height, fps: i.fps, duration: i.duration }
}

function createCaptureWindow(): BrowserWindow {
  const win = new BrowserWindow({
    show: false,
    // Real size is set once we know the scene's WRENN size
    width: 800,
    height: 600,
    useContentSize: true,
    frame: false,
    // Without this, Windows display scaling (for example 125%) adds an invisible border
    // and the page ends up 1081x1922 instead of 1080x1920
    thickFrame: false,
    webPreferences: {
      // Draw into memory instead of onto a screen. deviceScaleFactor 1 means one
      // CSS pixel is one video pixel, even with Windows display scaling at 125% or 150%.
      offscreen: { deviceScaleFactor: 1 },
      session: lockDownSession(),
      // Same safety settings as the app window: no Node, no preload, own world
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      // A hidden window would otherwise be slowed down by Chromium
      backgroundThrottling: false,
      spellcheck: false
    }
  })

  // The scene stays on its own page: no links, no redirects, no popups
  win.webContents.on('will-navigate', (event) => event.preventDefault())
  win.webContents.on('will-redirect', (event) => event.preventDefault())
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  return win
}

// Seek the scene, then wait two animation frames so the new picture is painted.
// One frame lets the browser apply the change, the second makes sure it was drawn.
// Tested against Playwright: every frame matched. Two faster tricks did NOT:
// raising setFrameRate to 240 and grabbing the 'paint' event both gave stale frames.
const SEEK_AND_PAINT = `(async (t) => {
  await window.seek(t);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
})`

// The page gets its new size a moment after the window does. Wait (up to 2 seconds)
// until the page really is width x height, so frame 0 isn't drawn at the old size.
// If it never matches, carry on: toPixels below still makes the frames the right size.
async function waitForViewport(run: <T>(code: string) => Promise<T>, info: SceneInfo): Promise<void> {
  for (let tries = 0; tries < 40; tries++) {
    const [w, h] = await run<[number, number]>('[window.innerWidth, window.innerHeight]')
    if (w === info.width && h === info.height) return
    await new Promise((r) => setTimeout(r, 50))
  }
}

// Turn a captured image into raw BGRA pixels of exactly the video size.
// With deviceScaleFactor 1 it already is, the resize is only a safety net.
function toPixels(image: NativeImage, info: SceneInfo): Buffer {
  const size = image.getSize()
  const sized =
    size.width === info.width && size.height === info.height
      ? image
      : image.resize({ width: info.width, height: info.height, quality: 'best' })
  return sized.toBitmap()
}

export async function renderScene({ sceneDir, outFile, onProgress, signal }: RenderOptions): Promise<void> {
  const indexFile = join(resolve(sceneDir), 'index.html')
  if (!existsSync(indexFile)) throw new Error(`No index.html in ${sceneDir}`)
  if (signal?.aborted) throw abortError()

  const out = resolve(outFile)
  mkdirSync(dirname(out), { recursive: true })

  const win = createCaptureWindow()
  const contents = win.webContents
  let ffmpeg: ReturnType<typeof startFfmpeg> | undefined

  // If the scene's page crashes, executeJavaScript would wait forever. This rejects instead.
  const crashed = new Promise<never>((_, reject) => {
    contents.once('render-process-gone', (_e, details) =>
      reject(new Error(`The scene's page crashed (${details.reason})`))
    )
  })
  crashed.catch(() => {})

  // Run code in the scene, but stop if the page crashes, ffmpeg dies or the user cancels
  const cancelled = new Promise<never>((_, reject) => {
    signal?.addEventListener('abort', () => reject(abortError()), { once: true })
  })
  cancelled.catch(() => {})
  const run = <T>(code: string, ...extra: Promise<never>[]): Promise<T> =>
    Promise.race([contents.executeJavaScript(code) as Promise<T>, crashed, cancelled, ...extra])

  try {
    await Promise.race([win.loadFile(indexFile), crashed, cancelled])

    // Wait for fonts and images, then read the size, fps and length
    await run('Promise.resolve(window.wrennReady).then(() => true)', timeout(READY_TIMEOUT_MS, 'window.wrennReady'))
    const info = checkSceneInfo(await run('window.WRENN'))
    const hasSeek = await run<boolean>('typeof window.seek === "function"')
    if (!hasSeek) throw new Error("The scene has no window.seek(t) function")

    // Now size the window to the video. Offscreen windows aren't limited by the screen size.
    win.setContentSize(info.width, info.height)
    contents.setZoomFactor(1)
    await waitForViewport(run, info)

    const total = Math.round(info.duration * info.fps)
    ffmpeg = startFfmpeg(info, out)
    // ffmpeg dying should also stop a wait inside the scene
    const ffmpegFailed = ffmpeg.done.then(() => new Promise<never>(() => {}))
    ffmpegFailed.catch(() => {})

    for (let frame = 0; frame < total; frame++) {
      if (signal?.aborted) throw abortError()

      await run(`${SEEK_AND_PAINT}(${frame / info.fps})`, ffmpegFailed)
      const image = await Promise.race([contents.capturePage(), crashed, cancelled])
      await writeFrame(ffmpeg.stdin, toPixels(image, info), ffmpeg.done)

      onProgress?.(frame + 1, total)
    }

    ffmpeg.stdin.end()
    await Promise.race([ffmpeg.done, cancelled])
  } catch (error) {
    // Something broke or the user cancelled: stop ffmpeg and delete the half-written video
    if (ffmpeg) {
      ffmpeg.stdin.destroy()
      ffmpeg.process.kill('SIGKILL')
      // Windows won't delete a file that ffmpeg still has open, so wait for it to exit
      await ffmpeg.done.catch(() => {})
    }
    rmSync(out, { force: true })
    throw error
  } finally {
    if (!win.isDestroyed()) win.destroy()
  }
}
