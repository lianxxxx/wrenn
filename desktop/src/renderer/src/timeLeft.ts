// Small helpers for the progress screen. Plain functions, so the tests can check them.

// What the screen shows. percent: 0 to 100. secondsLeft: undefined until the first estimate.
export type ShownProgress = { percent: number; secondsLeft?: number }

// The estimate can wobble (a part runs long, or rendering is faster than guessed).
// The screen never steps back: the bar only grows and the time left only shrinks.
// If the new guess is longer, the time left just waits until the real time catches up.
export function steadyProgress(shown: ShownProgress, next: { progress?: number; secondsLeft?: number }): ShownProgress {
  const nextPercent = next.progress === undefined ? 0 : Math.min(100, Math.max(0, next.progress * 100))
  const percent = Math.max(shown.percent, nextPercent)
  let secondsLeft = shown.secondsLeft
  if (next.secondsLeft !== undefined && Number.isFinite(next.secondsLeft)) {
    const fresh = Math.max(0, next.secondsLeft)
    secondsLeft = secondsLeft === undefined ? fresh : Math.min(secondsLeft, fresh)
  }
  return { percent, secondsLeft }
}

// The bar has to be at least this full before the screen says "Almost done"
export const ALMOST_DONE_PERCENT = 90

// "About 4 min left", or "Almost done" near the end. Never negative.
// percent is what the bar shows (0 to 100). "Almost done" waits for the bar too,
// so a short guess early on can't say it while the bar is only half full.
export function timeLeftText(secondsLeft: number | undefined, percent: number): string {
  if (secondsLeft === undefined || !Number.isFinite(secondsLeft)) return 'Working out the time left'
  if (secondsLeft <= 45) return percent >= ALMOST_DONE_PERCENT ? 'Almost done' : 'About 1 min left'
  const minutes = Math.max(1, Math.round(secondsLeft / 60))
  return `About ${minutes} min left`
}
