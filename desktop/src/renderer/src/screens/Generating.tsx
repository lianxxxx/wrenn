import { Button } from '../components/Button'
import { ProgressBar } from '../components/ProgressBar'
import { Spinner } from '../components/Spinner'
import type { JobEvent } from '../data'

type Props = {
  // The latest event for this job. Done and cancelled never show here (App moves on).
  event: JobEvent
  onCancel: () => void
  onTryAgain: () => void
}

// The template path, driven by real events from the main process.
// The user only waits here: Claude Code runs in the background, no typing.
//   waiting-for-claude -> Claude Code is building the scenes (message says what it's doing)
//   rendering          -> the MP4 is being made, with a real progress bar
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

  const building = event.stage === 'waiting-for-claude'
  const rendering = event.stage === 'rendering'
  const addingSound = event.stage === 'adding-sound'
  const percent =
    rendering && event.total ? Math.min(100, Math.round(((event.frame ?? 0) / event.total) * 100)) : 0

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <div className="text-center">
        <h1 className="font-display text-[3rem] leading-[1.05] text-navy">Making your video</h1>
        <p className="mt-sm text-[1.1875rem] leading-[1.55] text-navy-body">
          This takes a few minutes. You can leave Wrenn open and do something else.
        </p>
      </div>

      <div className="mt-xl rounded-lg border-2 border-line bg-card p-lg">
        <Step
          active={building}
          done={!building}
          title="Building your scenes"
          // Screen readers hear what Claude Code is doing as it changes
          text={building ? `${event.message || 'Getting started'}...` : 'Done'}
        />
        <div className="my-md border-t-2 border-line" />
        <Step
          active={rendering}
          done={addingSound}
          title="Putting your video together"
          text={rendering ? `${percent}% done` : addingSound ? 'Done' : 'Next'}
        />
        {rendering && (
          <div className="mt-md ml-[56px]">
            <ProgressBar percent={percent} />
          </div>
        )}
        <div className="my-md border-t-2 border-line" />
        <Step
          active={addingSound}
          done={false}
          title="Adding music and sound"
          text={addingSound ? `${event.message || 'Mixing it in'}...` : 'Next'}
        />
      </div>

      <div className="mt-xl text-center">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

// One line of progress: a spinner while it runs, a check when it's done, a dot while it waits
function Step({ active, done, title, text }: { active: boolean; done: boolean; title: string; text: string }) {
  return (
    <div className="flex items-center gap-md" aria-live={active ? 'polite' : undefined}>
      <span className="flex size-10 shrink-0 items-center justify-center">
        {active ? (
          <Spinner className="size-8" />
        ) : done ? (
          <span className="flex size-8 items-center justify-center rounded-full bg-lime text-ink" aria-hidden>
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
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
