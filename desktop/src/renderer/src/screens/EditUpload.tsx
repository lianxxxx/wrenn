import { useState } from 'react'
import { Button } from '../components/Button'
import { ChoiceGroup } from '../components/ChoiceGroup'
import { StoppedNote } from '../components/CancelButton'
import { FileDrop } from '../components/FileDrop'
import { ScreenTitle } from '../components/ScreenTitle'
import { SizePicker } from '../components/SizePicker'
import { Toggle } from '../components/Toggle'
import { subtitleStyles, type EditDraft } from '../data'

type Props = {
  draft: EditDraft
  onChange: (changes: Partial<EditDraft>) => void
  onBack: () => void
  onMake: () => void
  // True right after the user stopped a video
  stopped?: boolean
}

// The edit path: one video in. Wrenn decides everything unless you open Customize.
export function EditUpload({ draft, onChange, onBack, onMake, stopped = false }: Props) {
  const [open, setOpen] = useState(false)
  const ready = draft.video.length > 0

  return (
    <div className="mx-auto w-full max-w-[768px]">
      <ScreenTitle
        title="Upload your video"
        sub="Wrenn adds subtitles, cuts the long pauses, zooms in on the good parts and fixes the colors."
        onBack={onBack}
      />

      {stopped && <StoppedNote />}

      <FileDrop
        big
        label="Your video"
        hint="One video, up to a few minutes long."
        accept="video/*"
        files={draft.video}
        onFiles={(video) => onChange({ video })}
      />

      <div className="mt-xl rounded-lg border-2 border-line bg-card">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="customize-panel"
          onClick={() => setOpen(!open)}
          className="flex w-full cursor-pointer items-center justify-between gap-md rounded-lg p-lg text-left"
        >
          <span>
            <span className="block font-display text-2xl leading-tight text-navy">Customize</span>
            <span className="block text-base text-navy-body">
              {open ? 'Change how Wrenn edits your video.' : "Optional. Wrenn picks for you if you skip this."}
            </span>
          </span>
          <svg
            viewBox="0 0 24 24"
            className={`size-6 shrink-0 text-navy motion-safe:transition-transform motion-safe:duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div id="customize-panel" className="flex flex-col gap-xl border-t-2 border-line p-lg">
            <ChoiceGroup
              legend="Subtitle style"
              name="subtitles"
              value={draft.subtitles}
              onChange={(subtitles) => onChange({ subtitles })}
              options={subtitleStyles}
            />
            <div className="divide-y-2 divide-line">
              <Toggle
                label="Cut long pauses"
                hint="Removes the quiet bits so it moves faster."
                checked={draft.cutPauses}
                onChange={(cutPauses) => onChange({ cutPauses })}
              />
              <Toggle
                label="Zoom in on key moments"
                hint="Quick zooms when something important happens."
                checked={draft.zooms}
                onChange={(zooms) => onChange({ zooms })}
              />
              <Toggle
                label="Fix colors automatically"
                hint="Brighter, clearer colors."
                checked={draft.autoColor}
                onChange={(autoColor) => onChange({ autoColor })}
              />
            </div>
            <SizePicker value={draft.size} onChange={(size) => onChange({ size })} />
          </div>
        )}
      </div>

      <div className="mt-xl flex items-center justify-end gap-md">
        {!ready && <p className="text-[0.9375rem] text-navy-body">Add a video to start.</p>}
        <Button onClick={onMake} disabled={!ready}>
          Make my video
        </Button>
      </div>
    </div>
  )
}
