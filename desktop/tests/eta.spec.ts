// The time-left math for the progress screen. Plain functions, no app window.

import { expect, test } from '@playwright/test'
import { addRun, averageTimes, DEFAULT_TIMES, estimate, KEEP_RUNS, partLeft, SONG_EXTRA_SECONDS } from '../src/main/eta'
import { steadyProgress, timeLeftText } from '../src/renderer/src/timeLeft'

const times = { claude: 300, render: 100, sound: 20 }

test('averages past runs, or uses the first-time guess', () => {
  expect(averageTimes(undefined, DEFAULT_TIMES['30'])).toEqual(DEFAULT_TIMES['30'])
  const runs = [
    { claude: 200, render: 80, sound: 10 },
    { claude: 400, render: 120, sound: 30 }
  ]
  expect(averageTimes(runs, DEFAULT_TIMES['30'])).toEqual({ claude: 300, render: 100, sound: 20 })
})

test('ElevenLabs songs are timed apart from other sound', () => {
  const runs = [
    // An old run from before "kind" was saved counts as other music
    { claude: 200, render: 80, sound: 10 },
    { claude: 400, render: 120, sound: 30, kind: 'other' as const },
    { claude: 300, render: 100, sound: 90, kind: 'elevenlabs' as const }
  ]
  // Claude Code and rendering use every run
  expect(averageTimes(runs, DEFAULT_TIMES['30'])).toEqual({ claude: 300, render: 100, sound: 20 })
  expect(averageTimes(runs, DEFAULT_TIMES['30'], 'elevenlabs')).toEqual({ claude: 300, render: 100, sound: 90 })
  // No song yet: the first-time guess plus a bit for the song
  const noSong = averageTimes(runs.slice(0, 2), DEFAULT_TIMES['30'], 'elevenlabs')
  expect(noSong.sound).toBe(DEFAULT_TIMES['30'].sound + SONG_EXTRA_SECONDS)
})

test('keeps only the newest runs', () => {
  let runs = addRun(undefined, { claude: 1, render: 1, sound: 1 })
  for (let i = 2; i <= KEEP_RUNS + 2; i++) runs = addRun(runs, { claude: i, render: 1, sound: 1 })
  expect(runs).toHaveLength(KEEP_RUNS)
  expect(runs[runs.length - 1].claude).toBe(KEEP_RUNS + 2)
})

test('a part that runs long never reaches zero and keeps shrinking', () => {
  expect(partLeft(100, 10)).toBeCloseTo(90)
  const late = partLeft(100, 150)
  const later = partLeft(100, 200)
  expect(late).toBeGreaterThan(0)
  expect(later).toBeGreaterThan(0)
  expect(later).toBeLessThan(late)
})

test('the estimate moves forward through the parts', () => {
  const start = estimate({ stage: 'claude', times, elapsed: 0, stageElapsed: 0 })
  expect(start.progress).toBe(0)
  expect(start.secondsLeft).toBeCloseTo(422)

  const midClaude = estimate({ stage: 'claude', times, elapsed: 150, stageElapsed: 150 })
  expect(midClaude.progress).toBeGreaterThan(0.3)
  expect(midClaude.secondsLeft).toBeCloseTo(272)

  // Rendering uses the real speed: 50 of 100 frames in 40 seconds means 40 more seconds
  const midRender = estimate({ stage: 'render', times, elapsed: 340, stageElapsed: 40, frame: 50, total: 100 })
  expect(midRender.secondsLeft).toBeCloseTo(40 + 20 + 2)

  const end = estimate({ stage: 'sound', times, elapsed: 500, stageElapsed: 60 })
  expect(end.secondsLeft).toBeGreaterThanOrEqual(0)
  expect(end.progress).toBeLessThan(1)
})

test('the screen never steps back', () => {
  let shown = steadyProgress({ percent: 0 }, { progress: 0.4, secondsLeft: 200 })
  expect(shown).toEqual({ percent: 40, secondsLeft: 200 })
  // A worse guess: the bar and the time left hold still
  shown = steadyProgress(shown, { progress: 0.3, secondsLeft: 260 })
  expect(shown).toEqual({ percent: 40, secondsLeft: 200 })
  shown = steadyProgress(shown, { progress: 0.5, secondsLeft: 150 })
  expect(shown).toEqual({ percent: 50, secondsLeft: 150 })
})

test('time left reads in plain words', () => {
  expect(timeLeftText(undefined)).toBe('Working out the time left')
  expect(timeLeftText(-5)).toBe('Almost done')
  expect(timeLeftText(30)).toBe('Almost done')
  expect(timeLeftText(60)).toBe('About 1 min left')
  expect(timeLeftText(150)).toBe('About 3 min left')
  expect(timeLeftText(600)).toBe('About 10 min left')
})
