import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { CheckIcon, Spinner } from '../components/Spinner'
import type { Job } from '../data'

type Props = {
  job: Job
  onDone: () => void
  onCancel: () => void
}

const steps = {
  template: ['Reading your files', 'Building scenes', 'Putting it together', 'Saving your video'],
  edit: ['Watching your video', 'Adding subtitles', 'Cutting and zooming', 'Saving your video']
}

// How long each fake step takes, in milliseconds
const STEP_TIME = 1500

// Fake progress. Later the real engine reports which step it's on.
export function Generating({ job, onDone, onCancel }: Props) {
  const list = steps[job.kind]
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (current >= list.length) {
      onDone()
      return
    }
    const timer = window.setTimeout(() => setCurrent((c) => c + 1), STEP_TIME)
    return () => window.clearTimeout(timer)
  }, [current, list.length, onDone])

  const percent = Math.round((Math.min(current, list.length) / list.length) * 100)

  return (
    <div className="mx-auto w-full max-w-[576px] text-center">
      <h1 className="font-display text-[3rem] leading-[1.05] text-navy">Making your video</h1>
      <p className="mt-sm text-[1.1875rem] text-navy-body">This can take a few minutes. You can leave Wrenn open in the background.</p>

      <div
        className="mt-xl h-4 overflow-hidden rounded-pill border-2 border-navy bg-card"
        role="progressbar"
        aria-label="Progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="h-full rounded-pill bg-teal transition-[width] duration-500 ease-[var(--ease-out-strong)]"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol className="mx-auto mt-xl flex max-w-[320px] flex-col gap-md text-left" aria-live="polite">
        {list.map((label, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={label} className="flex items-center gap-md">
              <span className="flex size-8 shrink-0 items-center justify-center">
                {done ? (
                  <span className="flex size-7 items-center justify-center rounded-full bg-lime text-ink">
                    <CheckIcon className="size-4" />
                  </span>
                ) : active ? (
                  <Spinner className="size-7" />
                ) : (
                  <span className="size-3 rounded-full bg-navy/20" />
                )}
              </span>
              <span className={`text-lg ${done || active ? 'font-semibold text-navy' : 'text-navy-body/70'}`}>
                {label}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="mt-xl">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
