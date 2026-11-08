import { Button } from '../components/Button'
import { ChoiceGroup } from '../components/ChoiceGroup'
import { FileDrop } from '../components/FileDrop'
import { ScreenTitle } from '../components/ScreenTitle'
import { SizePicker } from '../components/SizePicker'
import { lengths, musicChoices, songTypes, vibes, type TemplateDraft } from '../data'

type Props = {
  draft: TemplateDraft
  onChange: (changes: Partial<TemplateDraft>) => void
  // True when an ElevenLabs key is saved in Settings
  hasElevenLabsKey: boolean
  onOpenSettings: () => void
  onBack: () => void
  onNext: () => void
}

// Step 2 of the template path: size, length, vibe and music.
export function TemplateOptions({ draft, onChange, hasElevenLabsKey, onOpenSettings, onBack, onNext }: Props) {
  const needsSong = draft.music === 'own' && draft.musicFile.length === 0
  const needsKey = draft.music === 'elevenlabs' && !hasElevenLabsKey
  const ready = !needsSong && !needsKey

  return (
    <div className="mx-auto w-full max-w-[896px]">
      <ScreenTitle title="How should it look?" step="Step 2 of 3" onBack={onBack} />

      <div className="flex flex-col gap-xl">
        <SizePicker value={draft.size} onChange={(size) => onChange({ size })} />
        <ChoiceGroup
          legend="Length"
          name="length"
          value={draft.length}
          onChange={(length) => onChange({ length })}
          options={lengths}
        />
        <ChoiceGroup
          legend="Vibe"
          name="vibe"
          columns="grid-cols-4"
          value={draft.vibe}
          onChange={(vibe) => onChange({ vibe })}
          options={vibes}
        />

        <div className="flex flex-col gap-md">
          <ChoiceGroup
            legend="Music"
            name="music"
            columns="grid-cols-4"
            value={draft.music}
            onChange={(music) => onChange({ music })}
            options={musicChoices}
          />

          {/* Right below the choice it belongs to, one column */}
          {draft.music === 'own' && (
            <FileDrop
              label="Your song"
              hint="One song. Wrenn trims it to the video and fades it out."
              accept={songTypes}
              typeHint="an MP3, WAV or M4A song"
              files={draft.musicFile}
              onFiles={(musicFile) => onChange({ musicFile })}
            />
          )}

          {needsKey && (
            <p className="text-[0.9375rem] text-navy-body">
              Add your ElevenLabs key in Settings to use this.{' '}
              <button
                type="button"
                onClick={onOpenSettings}
                className="cursor-pointer rounded-sm font-semibold text-navy underline"
              >
                Open Settings
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="mt-xl flex items-center justify-end gap-md">
        {needsSong && <p className="text-[0.9375rem] text-navy-body">Add your song, or pick other music.</p>}
        <Button onClick={onNext} disabled={!ready}>
          Next
        </Button>
      </div>
    </div>
  )
}
