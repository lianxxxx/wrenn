// The sound engine, without the app window: renders the small test scene to an MP4 with
// Wrenn's own music (the same CLI as "npm run render"), then checks the sound with ffmpeg.
// Slow: rendering takes about 10 to 30 seconds.

import { expect, test } from '@playwright/test'
import { spawn } from 'child_process'
import { cpSync, existsSync } from 'fs'
import { join } from 'path'
import { DESKTOP, ffmpeg, makeTempDirs, removeTempDirs, RENDER_CLI, type TestDirs } from './helpers'

// In Node, require('electron') gives the path to the Electron program
const ELECTRON: string = require('electron')
const TEST_SCENE = join(DESKTOP, 'src', 'main', 'render', 'test-scene')

let dirs: TestDirs

test.beforeEach(() => {
  dirs = makeTempDirs()
})

test.afterEach(() => {
  removeTempDirs(dirs)
})

// Runs the render CLI and resolves with what it printed
function render(sceneDir: string, outFile: string): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      ELECTRON,
      // --user-data-dir keeps Chromium's own cache files in the temp folder too
      [RENDER_CLI, sceneDir, outFile, '--sound', 'playful', `--user-data-dir=${dirs.userData}`],
      { cwd: DESKTOP, env: { ...process.env, ELECTRON_RUN_AS_NODE: undefined } }
    )
    let output = ''
    child.stdout.on('data', (d) => (output += d))
    child.stderr.on('data', (d) => (output += d))
    child.on('error', reject)
    child.on('close', (code) =>
      code === 0 ? resolvePromise(output) : reject(new Error(`Render failed (exit ${code}):\n${output}`))
    )
  })
}

// How long one stream of the file really plays, by decoding it to nowhere and reading the last "time="
function streamSeconds(file: string, stream: 'v' | 'a'): number {
  const out = ffmpeg(['-i', file, '-map', `0:${stream}:0`, '-f', 'null', '-'])
  const times = [...out.matchAll(/time=(\d+):(\d+):([\d.]+)/g)]
  expect(times.length, `no time= in ffmpeg output for stream ${stream}`).toBeGreaterThan(0)
  const [, h, m, s] = times[times.length - 1]
  return Number(h) * 3600 + Number(m) * 60 + Number(s)
}

// Average loudness (dB) of the audio from "start" for "length" seconds
function meanVolume(file: string, start: number, length: number): number {
  const out = ffmpeg(['-ss', String(start), '-t', String(length), '-i', file, '-map', '0:a:0', '-af', 'volumedetect', '-f', 'null', '-'])
  const match = /mean_volume:\s*(-?[\d.]+|-inf) dB/.exec(out)
  expect(match, 'volumedetect printed no mean_volume').not.toBeNull()
  return match![1] === '-inf' ? -Infinity : Number(match![1])
}

test('render CLI adds music that lasts the whole video', async () => {
  test.slow()
  expect(existsSync(RENDER_CLI), 'Build first: npm test builds the app before running').toBe(true)

  // Copy the scene into the temp folder, so nothing is written next to the source files
  const sceneDir = join(dirs.root, 'scene')
  cpSync(TEST_SCENE, sceneDir, { recursive: true })
  const outFile = join(dirs.root, 'out.mp4')

  const log = await render(sceneDir, outFile)
  expect(log).toContain('Sound added.')
  expect(existsSync(outFile)).toBe(true)

  // There is an audio stream
  const info = ffmpeg(['-i', outFile], true)
  expect(info).toMatch(/Stream #0:\d+.*: Audio:/)

  // Sound and picture are the same length (within a tenth of a second)
  const video = streamSeconds(outFile, 'v')
  const audio = streamSeconds(outFile, 'a')
  expect(video).toBeGreaterThan(1)
  expect(Math.abs(audio - video)).toBeLessThan(0.1)

  // Still loud near the end: the second that ends 1 s before the end (the fade-out is 1.5 s)
  const volume = meanVolume(outFile, video - 2, 1)
  // Printed in the test report, handy when a song changes
  console.log(`video ${video.toFixed(2)} s, audio ${audio.toFixed(2)} s, volume near the end ${volume.toFixed(1)} dB`)
  expect(volume).toBeGreaterThan(-40)
})
