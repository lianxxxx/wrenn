// Remembers how long the last few videos took, so the progress screen can say
// "About 4 min left". File: <userData>\timings.json, next to settings.json.
// Only seconds per part and the video length: nothing about the video itself,
// and it never leaves this computer.

import { app } from 'electron'
import { randomBytes } from 'crypto'
import { promises as fs } from 'fs'
import { join } from 'path'

import {
  addRun,
  averageTimes,
  DEFAULT_TIMES,
  type PastRun,
  type SoundKind,
  type StageTimes,
  type VideoLength
} from './eta'

// Each run may say which kind of music it had ("kind"). Older files don't, and still load.
type TimingsFile = Partial<Record<VideoLength, PastRun[]>>

function timingsPath(): string {
  return join(app.getPath('userData'), 'timings.json')
}

// Keep only runs that look right (the file could be edited or broken)
function cleanRuns(value: unknown): PastRun[] {
  if (!Array.isArray(value)) return []
  const ok = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n < 24 * 3600
  return value
    .filter((r) => r && ok(r.claude) && ok(r.render) && ok(r.sound))
    .map((r) => ({
      claude: r.claude,
      render: r.render,
      sound: r.sound,
      kind: r.kind === 'elevenlabs' ? 'elevenlabs' : 'other'
    }))
}

async function readTimings(): Promise<TimingsFile> {
  try {
    const file = JSON.parse(await fs.readFile(timingsPath(), 'utf8'))
    if (!file || typeof file !== 'object') return {}
    const timings: TimingsFile = {}
    for (const length of Object.keys(DEFAULT_TIMES) as VideoLength[]) timings[length] = cleanRuns(file[length])
    return timings
  } catch {
    // No file yet, or a broken one: start fresh
    return {}
  }
}

// The expected seconds for each part of a video of this length and kind of music
export async function expectedTimes(length: VideoLength, kind: SoundKind): Promise<StageTimes> {
  const timings = await readTimings()
  return averageTimes(timings[length], DEFAULT_TIMES[length], kind)
}

// Saves one finished video's times. Errors are ignored: this is only for the estimate.
export async function recordRun(length: VideoLength, run: PastRun): Promise<void> {
  // Each save gets its own temp file, so two videos finishing at once don't write the same one
  const target = timingsPath()
  const temp = `${target}.${randomBytes(6).toString('hex')}.tmp`
  try {
    const timings = await readTimings()
    timings[length] = addRun(timings[length], run)
    await fs.mkdir(app.getPath('userData'), { recursive: true })
    await fs.writeFile(temp, JSON.stringify(timings, null, 2), 'utf8')
    await fs.rename(temp, target)
  } catch (error) {
    console.error('Could not save video timings:', error)
    // Don't leave a half-written temp file behind
    await fs.rm(temp, { force: true }).catch(() => {})
  }
}
