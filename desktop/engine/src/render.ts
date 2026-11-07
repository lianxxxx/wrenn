// Renders scene/index.html to out/test.mp4, one frame at a time.
// Steps: open the scene in headless Chromium, seek to each frame's time,
// take a screenshot, and pipe the image straight into ffmpeg.

import { spawn } from "node:child_process";
import { mkdirSync, rmSync, statSync } from "node:fs";
import { once } from "node:events";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ffmpegPath from "ffmpeg-static";
import { chromium } from "playwright";

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
const DURATION_SECONDS = 5;
const TOTAL_FRAMES = FPS * DURATION_SECONDS;

const engineDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const scenePath = join(engineDir, "scene", "index.html");
const outDir = join(engineDir, "out");
const outFile = join(outDir, "test.mp4");

// Tell TypeScript about the functions the scene puts on window.
declare global {
  interface Window {
    seek: (t: number) => void;
  }
}

function startFfmpeg() {
  if (!ffmpegPath) throw new Error("ffmpeg-static has no binary for this computer.");

  const args = [
    "-y",
    // Input: a stream of JPEG images coming in on stdin.
    "-f", "image2pipe",
    "-framerate", String(FPS),
    "-c:v", "mjpeg",
    "-i", "pipe:0",
    // Output: H.264 MP4 that plays everywhere (phones, social apps).
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-r", String(FPS),
    "-movflags", "+faststart",
    outFile,
  ];

  const ffmpeg = spawn(ffmpegPath as unknown as string, args, {
    stdio: ["pipe", "ignore", "pipe"],
  });

  let log = "";
  ffmpeg.stderr.on("data", (chunk) => (log += chunk.toString()));

  const done = new Promise<void>((resolve, reject) => {
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}\n${log}`));
    });
  });

  // The real error always arrives through "done", so these just stop crashes:
  // writing to a dead ffmpeg emits "error", and "done" may reject before anyone awaits it.
  ffmpeg.stdin.on("error", () => {});
  done.catch(() => {});

  return { stdin: ffmpeg.stdin, done, process: ffmpeg };
}

// Write one frame to ffmpeg, and wait if its input buffer is full.
// If ffmpeg dies while we wait, "done" rejects, so we never hang forever.
function writeFrame(stdin: NodeJS.WritableStream, data: Buffer, done: Promise<void>) {
  return new Promise<void>((resolve, reject) => {
    if (stdin.write(data)) resolve();
    else Promise.race([once(stdin, "drain"), done]).then(() => resolve(), reject);
  });
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const started = Date.now();

  const browser = await chromium.launch({ headless: true });
  let ffmpeg: ReturnType<typeof startFfmpeg> | undefined;

  try {
    const page = await browser.newPage({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 1,
    });

    await page.goto(pathToFileURL(scenePath).href);
    // Wait for the brand fonts so no frame shows a fallback font.
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.waitForFunction(() => typeof window.seek === "function");

    ffmpeg = startFfmpeg();

    for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
      const time = frame / FPS;
      await page.evaluate((t) => window.seek(t), time);
      const image = await page.screenshot({ type: "jpeg", quality: 95 });
      await writeFrame(ffmpeg.stdin, image, ffmpeg.done);

      if (frame % 30 === 0) console.log(`frame ${frame + 1}/${TOTAL_FRAMES}`);
    }

    ffmpeg.stdin.end();
    await ffmpeg.done;
  } catch (error) {
    // Something broke: stop ffmpeg and delete the half-written video
    if (ffmpeg) {
      ffmpeg.stdin.destroy();
      ffmpeg.process.kill("SIGKILL");
    }
    rmSync(outFile, { force: true });
    throw error;
  } finally {
    await browser.close();
  }

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  const sizeMb = (statSync(outFile).size / 1024 / 1024).toFixed(2);
  console.log(`Done in ${seconds}s. ${outFile} (${sizeMb} MB)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
