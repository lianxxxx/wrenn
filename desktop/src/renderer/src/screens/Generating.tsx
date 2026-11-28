import { useState } from 'react'
import { Button } from '../components/Button'
import { CancelButton } from '../components/CancelButton'
import { ProgressBar } from '../components/ProgressBar'
import { CheckIcon, Spinner } from '../components/Spinner'
import type { JobEvent } from '../data'
import { steadyProgress, timeLeftText, type ShownProgress } from '../timeLeft'

type Props = {
  // The latest event for this job. Done and cancelled never show here (App moves on).
  event: JobEvent
  onCancel: () => void
  onTryAgain: () => void
}

// The template path, driven by real events from the main process.
// The user only waits here: Claude Code runs in the background, no typing.
// One bar for the whole video, with about how long is left (main/eta.ts makes the guess).
//   waiting-for-claude -> Claude Code is building the scenes (message says what it's doing)
//   rendering          -> the MP4 is being made (frame / total)
//   adding-sound       -> music and sound effects are mixed in (message may say e.g. "Making your song")
//   failed             -> a plain message and Try again
export function Generating({ event, onCancel, onTryAgain }: Props) {
  if (event.stage === 'failed') {
    return (
      <div className="mx-auto w-full max-w-[576px] text-center" role="alert">
        <h1 className="font-display text-[3rem] leading-[1.05] text-navy">That didn't work</h1>
        <p className="mt-sm text-[1.1875rem] leading-[1.55] text-navy-body">
          {event.message || 'Something went wrong while making your video.'}
        </p>
        <p className="mt-sm text-base text-navy-body">Your answers and files are still there.</p>
        <div className="mt-xl">
          <Button onClick={onTryAgain}>Try again</Button>
        </div>
      </div>
    )
  }

  return <Progress event={event} onCancel={onCancel} />
}

function Progress({ event, onCancel }: { event: JobEvent; onCancel: () => void }) {
  // What the bar and the time left show. Only moves forward (see timeLeft.ts).
  // Adjusted while rendering, the React way to follow a changing prop without an extra pass.
  const [shown, setShown] = useState<ShownProgress>({ percent: 0 })
  const next = steadyProgress(shown, event)
  if (next.percent !== shown.percent || next.secondsLeft !== shown.secondsLeft) setShown(next)

  const building = event.stage === 'waiting-for-claude'
  const rendering = event.stage === 'rendering'
  const addingSound = event.stage === 'adding-sound'
  const renderPercent =
    rendering && event.total ? Math.min(100, Math.round(((event.frame ?? 0) / event.total) * 100)) : 0
  const overall = Math.round(next.percent)
  const timeLeft = timeLeftText(next.secondsLeft, overall)
  // Screen readers hear only when the step changes, not the numbers that tick every second
  const stepNow = building ? 'Building your scenes' : rendering ? 'Putting your video together' : 'Adding music and sound'

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <div className="text-center">
        <h1 className="font-display text-[3rem] leading-[1.05] text-navy">Making your video</h1>
        <p className="mt-sm text-[1.1875rem] leading-[1.55] text-navy-body">
          You can leave Wrenn open and do something else. We'll let you know when it's ready.
        </p>
      </div>

      <div className="mt-xl">
        <ProgressBar
          className=""
          percent={overall}
          label="Making your video"
          valueText={`${overall}%, ${timeLeft.toLowerCase()}`}
        />
        <div className="mt-sm flex items-baseline justify-between gap-md text-base">
          <span className="font-semibold text-navy">{timeLeft}</span>
          <span className="text-navy-body tabular-nums" aria-hidden>
            {overall}%
          </span>
        </div>
      </div>

      <p className="sr-only" role="status">
        {stepNow}
      </p>

      <div className="mt-lg rounded-lg border-2 border-line bg-card p-lg">
        <Step
          active={building}
          done={!building}
          title="Building your scenes"
          text={building ? `${event.message || 'Getting started'}...` : 'Done'}
        />
        <div className="my-md border-t-2 border-line" />
        <Step
          active={rendering}
          done={addingSound}
          title="Putting your video together"
          text={rendering ? `${renderPercent}% of the frames done` : addingSound ? 'Done' : 'Up next'}
        />
        <div className="my-md border-t-2 border-line" />
        <Step
          active={addingSound}
          done={false}
          title="Adding music and sound"
          text={addingSound ? `${event.message || 'Mixing it in'}...` : 'Up next'}
        />
      </div>

      <div className="mt-xl text-center">
        <CancelButton onConfirm={onCancel} />
      </div>
    </div>
  )
}

// One line of progress: a spinner while it runs, a check when it's done, a dot while it waits
function Step({ active, done, title, text }: { active: boolean; done: boolean; title: string; text: string }) {
  return (
    <div className="flex items-center gap-md">
      <span className="flex size-10 shrink-0 items-center justify-center">
        {active ? (
          <Spinner className="size-8" />
        ) : done ? (
          <span className="flex size-8 items-center justify-center rounded-full bg-lime text-ink" aria-hidden>
            <CheckIcon className="size-5" />
          </span>
        ) : (
          <span className="size-3 rounded-full bg-line" aria-hidden />
        )}
      </span>
      <div>
        <p className={`font-display text-2xl leading-tight ${active || done ? 'text-navy' : 'text-navy-body'}`}>{title}</p>
        <p className="text-base text-navy-body">{text}</p>
      </div>
    </div>
  )
}
