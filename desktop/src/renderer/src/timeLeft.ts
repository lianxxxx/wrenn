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

// "About 4 min left", or "Almost done" near the end. Never negative.
export function timeLeftText(secondsLeft: number | undefined): string {
  if (secondsLeft === undefined || !Number.isFinite(secondsLeft)) return 'Working out the time left'
  if (secondsLeft <= 45) return 'Almost done'
  const minutes = Math.max(1, Math.round(secondsLeft / 60))
  return `About ${minutes} min left`
}
