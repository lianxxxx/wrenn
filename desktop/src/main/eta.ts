// How far along a video is, and about how long is left.
// Plain math only (no Electron), so the tests can check it directly.
//
// A video has 3 slow parts: Claude Code making the scene, rendering the frames,
// and adding the sound. We guess each part from past videos of the same length
// (see timings.ts), and use the real frame count while rendering.

export type VideoLength = '15' | '30' | '60'

// Seconds each part took (or should take)
export type StageTimes = { claude: number; render: number; sound: number }

export type EtaStage = 'claude' | 'render' | 'sound'

// First-time guesses, before Wrenn has finished any video of that length
export const DEFAULT_TIMES: Record<VideoLength, StageTimes> = {
  '15': { claude: 240, render: 60, sound: 20 },
  '30': { claude: 360, render: 120, sound: 25 },
  '60': { claude: 540, render: 240, sound: 35 }
}

// The sound part is much slower when ElevenLabs makes a song, so we time it separately.
// "other" is Wrenn's music, the user's own song, or sound effects only.
export type SoundKind = 'elevenlabs' | 'other'

// First-time guess for the extra seconds an ElevenLabs song adds to the sound part
export const SONG_EXTRA_SECONDS = 45

// A past run. `kind` is missing in older timings.json files: those count as "other".
export type PastRun = StageTimes & { kind?: SoundKind }

// Moving the file to Videos\Wrenn at the very end
const SAVE_SECONDS = 2

// How many past videos per length we keep for the average
export const KEEP_RUNS = 5

// The average of the past runs, or the first-time guess when there are none.
// Claude Code and rendering use every run. The sound part only uses runs with the same kind of music.
export function averageTimes(
  runs: PastRun[] | undefined,
  fallback: StageTimes,
  kind: SoundKind = 'other'
): StageTimes {
  const all = runs ?? []
  const avg = (list: PastRun[], key: keyof StageTimes): number =>
    list.reduce((sum, r) => sum + r[key], 0) / list.length
  const sameSound = all.filter((r) => (r.kind ?? 'other') === kind)
  const soundGuess = kind === 'elevenlabs' ? fallback.sound + SONG_EXTRA_SECONDS : fallback.sound
  return {
    claude: all.length > 0 ? avg(all, 'claude') : fallback.claude,
    render: all.length > 0 ? avg(all, 'render') : fallback.render,
    sound: sameSound.length > 0 ? avg(sameSound, 'sound') : soundGuess
  }
}

// Adds a finished run and keeps only the newest few
export function addRun(runs: PastRun[] | undefined, run: PastRun): PastRun[] {
  return [...(runs ?? []), run].slice(-KEEP_RUNS)
}

// Time left in a part that should take `expected` seconds and has run for `elapsed`.
// Counts down normally, but slows down near the end instead of hitting zero,
// so a part that runs long never says "0 seconds" while it's still going.
export function partLeft(expected: number, elapsed: number): number {
  if (expected <= 0) return 0
  const tail = 0.15 * expected
  const slowFrom = expected - tail
  if (elapsed < slowFrom) return expected - elapsed
  return tail * Math.exp(-(elapsed - slowFrom) / tail)
}

export type EtaInput = {
  stage: EtaStage
  // Expected seconds for each part (averaged from past runs)
  times: StageTimes
  // Seconds since the job started, and since this part started
  elapsed: number
  stageElapsed: number
  // Only while rendering
  frame?: number
  total?: number
}

// progress: 0 to 1 for the whole video. secondsLeft: never negative.
export function estimate(input: EtaInput): { progress: number; secondsLeft: number } {
  const { stage, times, stageElapsed } = input
  let left: number

  if (stage === 'claude') {
    left = partLeft(times.claude, stageElapsed) + times.render + times.sound
  } else if (stage === 'render') {
    left = renderLeft(input) + times.sound
  } else {
    left = partLeft(times.sound, stageElapsed)
  }
  left = Math.max(0, left + SAVE_SECONDS)

  const elapsed = Math.max(0, input.elapsed)
  const progress = elapsed + left > 0 ? elapsed / (elapsed + left) : 0
  return { progress: Math.min(0.99, Math.max(0, progress)), secondsLeft: left }
}

// While rendering we know how many frames are done, so we can measure the real speed.
// The first few frames are a shaky measure, so we mix in the guess until 10% is done.
function renderLeft({ times, stageElapsed, frame = 0, total = 0 }: EtaInput): number {
  const guess = partLeft(times.render, stageElapsed)
  if (frame <= 0 || total <= 0 || stageElapsed <= 0) return guess
  const measured = (stageElapsed / frame) * Math.max(0, total - frame)
  const trust = Math.min(1, frame / (0.1 * total))
  return trust * measured + (1 - trust) * guess
}
