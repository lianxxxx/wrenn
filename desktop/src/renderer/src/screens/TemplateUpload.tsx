import { Button } from '../components/Button'
import { FileDrop } from '../components/FileDrop'
import { ScreenTitle } from '../components/ScreenTitle'
import { TextField } from '../components/TextField'
import type { TemplateDraft } from '../data'

type Props = {
  draft: TemplateDraft
  onChange: (changes: Partial<TemplateDraft>) => void
  onBack: () => void
  onGenerate: () => void
}

// Step 3 of the template path: your files and a few words.
export function TemplateUpload({ draft, onChange, onBack, onGenerate }: Props) {
  const hasFiles = draft.photos.length > 0 || draft.recordings.length > 0
  const ready = hasFiles && draft.brandName.trim() !== ''

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
          hint="A PNG with no background looks best."
          accept="image/*"
          files={draft.logo}
          onFiles={(logo) => onChange({ logo })}
        />
        <TextField
          label="Ending text (optional)"
          hint="The last words people see, like Download it free."
          placeholder="e.g. Download it free"
          value={draft.cta}
          onChange={(e) => onChange({ cta: e.target.value })}
        />
      </div>

      <div className="mt-xl flex items-center justify-end gap-md">
        {!ready && (
          <p className="text-[0.9375rem] text-navy-body">Add at least one file and your brand name.</p>
        )}
        <Button onClick={onGenerate} disabled={!ready}>
          Make my video
        </Button>
      </div>
    </div>
  )
}
