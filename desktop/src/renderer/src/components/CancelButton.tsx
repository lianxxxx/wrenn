import { useState } from 'react'
import { Button } from './Button'

type Props = {
  // Runs only after the user says yes
  onConfirm: () => void
}

// Cancel for a video that's being made. Asks first, right on the screen (no pop-up window),
// so one wrong click doesn't throw away minutes of work.
export function CancelButton({ onConfirm }: Props) {
  const [asking, setAsking] = useState(false)

  if (!asking) {
    return (
      <Button variant="ghost" onClick={() => setAsking(true)}>
        Cancel
      </Button>
    )
  }

  return (
    <div
      role="group"
      aria-labelledby="cancel-question"
      className="mx-auto max-w-[420px] rounded-lg border-2 border-line bg-card p-lg text-center"
      onKeyDown={(e) => {
        if (e.key === 'Escape') setAsking(false)
      }}
    >
      <p id="cancel-question" className="font-display text-2xl leading-tight text-navy">
        Stop making this video?
      </p>
      <p className="mt-xs text-base text-navy-body">Your answers and files stay. You can start again any time.</p>
      <div className="mt-lg flex flex-wrap justify-center gap-md">
        {/* Focus lands on the safe choice, so a stray Enter keeps the video going */}
        <Button autoFocus variant="ghost" onClick={() => setAsking(false)}>
          Keep going
        </Button>
        <Button onClick={onConfirm}>Yes, stop</Button>
      </div>
    </div>
  )
}

// Shown on the upload screen after a video was stopped, so the user knows nothing was lost
export function StoppedNote() {
  return (
    <p className="mb-xl rounded-sm border-2 border-teal bg-card px-md py-sm font-semibold text-navy" role="status">
      Stopped. Your files are still here.
    </p>
  )
}
