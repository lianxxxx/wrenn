import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { ProgressBar } from '../components/ProgressBar'
import { CheckIcon, Spinner } from '../components/Spinner'

type Props = {
  onDone: () => void
  onCancel: () => void
}

const steps = ['Watching your video', 'Adding subtitles', 'Cutting and zooming', 'Saving your video']

// How long each fake step takes, in milliseconds
const STEP_TIME = 1500

// FAKE progress for the edit path (not built yet). The template path uses the real Generating screen.
export function EditGenerating({ onDone, onCancel }: Props) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (current >= steps.length) {
      onDone()
      return
    }
    const timer = window.setTimeout(() => setCurrent((c) => c + 1), STEP_TIME)
    return () => window.clearTimeout(timer)
  }, [current, onDone])

  const percent = Math.round((Math.min(current, steps.length) / steps.length) * 100)

  return (
    <div className="mx-auto w-full max-w-[576px] text-center">
      <h1 className="font-display text-[3rem] leading-[1.05] text-navy">Making your video</h1>
      <p className="mt-sm text-[1.1875rem] text-navy-body">This can take a few minutes. You can leave Wrenn open in the background.</p>

      <ProgressBar percent={percent} />

      <ol className="mx-auto mt-xl flex max-w-[320px] flex-col gap-md text-left" aria-live="polite">
        {steps.map((label, i) => {
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
