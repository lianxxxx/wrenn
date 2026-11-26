import { Button } from '../components/Button'
import { FileDrop } from '../components/FileDrop'
import { ScreenTitle } from '../components/ScreenTitle'
import { TextArea } from '../components/TextArea'
import { TextField } from '../components/TextField'
import type { TemplateDraft } from '../data'
import { MAX_ABOUT } from '../../../shared/limits'

type Props = {
  draft: TemplateDraft
  onChange: (changes: Partial<TemplateDraft>) => void
  onBack: () => void
  onGenerate: () => void
  // True while Wrenn is setting up the job (before the Generating screen)
  starting: boolean
  // Why the job couldn't start, in plain words. Empty when all is fine.
  error: string
}

// Step 3 of the template path: your files and a few words.
export function TemplateUpload({ draft, onChange, onBack, onGenerate, starting, error }: Props) {
  const hasFiles = draft.photos.length > 0 || draft.recordings.length > 0
  const hasName = draft.brandName.trim() !== ''
  const ready = hasFiles && hasName
  // Says exactly what's missing. A logo or font alone doesn't count as a file here.
  const missing = !hasName && !hasFiles
    ? 'Add your brand name and at least one screenshot or recording.'
    : !hasName
      ? 'Add your brand name.'
      : 'Add at least one screenshot or recording.'

  return (
    // One column, top to bottom: forms are easier to follow with one field at a time
    <div className="mx-auto w-full max-w-[640px]">
      <ScreenTitle
        title="Add your stuff"
        sub="Screenshots and short screen recordings work best."
        step="Step 3 of 3"
        onBack={onBack}
      />

      <div className="flex flex-col gap-xl">
        <TextField
          label="Brand name"
          placeholder="e.g. Wrenn"
          value={draft.brandName}
          onChange={(e) => onChange({ brandName: e.target.value })}
        />
        <TextArea
          label="What does it do? (optional)"
          hint="One or two sentences. Helps Wrenn show the right things."
          placeholder="e.g. Turns your app screenshots into short videos for social media."
          maxLength={MAX_ABOUT}
          value={draft.about}
          onChange={(e) => onChange({ about: e.target.value })}
        />
        <FileDrop
          label="Photos and screenshots"
          accept="image/*"
          multiple
          files={draft.photos}
          onFiles={(photos) => onChange({ photos })}
        />
        <FileDrop
          label="Screen recordings (optional)"
          accept="video/*"
          multiple
          files={draft.recordings}
          onFiles={(recordings) => onChange({ recordings })}
        />
        <FileDrop
          label="Logo (optional)"
          hint="A PNG with a see-through background looks best."
          accept="image/*"
          files={draft.logo}
          onFiles={(logo) => onChange({ logo })}
        />
        <FileDrop
          label="Fonts (optional)"
          hint="Your brand's font files. Skip this and Wrenn picks a font for you."
          accept=".woff2,.woff,.ttf,.otf"
          multiple
          files={draft.fonts}
          onFiles={(fonts) => onChange({ fonts })}
          typeHint="a WOFF2, WOFF, TTF or OTF font"
        />
        <TextField
          label="Ending text (optional)"
          hint="The last words people see, like Download it free."
          placeholder="e.g. Download it free"
          value={draft.cta}
          onChange={(e) => onChange({ cta: e.target.value })}
        />
      </div>

      {error && (
        <p className="mt-xl rounded-sm border-2 border-red bg-card px-md py-sm font-semibold text-navy" role="alert">
          {error}
        </p>
      )}

      <div className="mt-xl flex items-center justify-end gap-md">
        {!ready && (
          <p className="text-[0.9375rem] text-navy-body">{missing}</p>
        )}
        <Button onClick={onGenerate} disabled={!ready || starting}>
          {starting ? 'Starting...' : 'Make my video'}
        </Button>
      </div>
    </div>
  )
}
