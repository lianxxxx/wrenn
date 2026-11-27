import { Button } from '../components/Button'
import { FileDrop } from '../components/FileDrop'
import { ScreenTitle } from '../components/ScreenTitle'
import { TextArea } from '../components/TextArea'
import { TextField } from '../components/TextField'
import type { TemplateDraft } from '../data'
import { MAX_ABOUT } from '../../../shared/limits'
import { rulesFor } from '../../../shared/templates'

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
  // What this template needs: screenshots, a logo, or the user's own words
  const { needs } = rulesFor(draft.templateId)
  const hasName = draft.brandName.trim() !== ''
  const hasMain =
    needs === 'screens'
      ? draft.photos.length > 0 || draft.recordings.length > 0
      : needs === 'logo'
        ? draft.logo.length > 0
        : draft.about.trim() !== ''
  const ready = hasMain && hasName
  // Says exactly what's missing. For "screens", a logo or font alone doesn't count.
  const mainMissing =
    needs === 'screens' ? 'at least one screenshot or recording' : needs === 'logo' ? 'your logo' : 'your words'
  const missing = !hasName && !hasMain
    ? `Add your brand name and ${mainMissing}.`
    : !hasName
      ? 'Add your brand name.'
      : `Add ${mainMissing}.`
  const sub =
    needs === 'screens'
      ? 'Screenshots and short screen recordings work best.'
      : needs === 'logo'
        ? 'Your logo is the star here.'
        : 'Type what the video should say. Wrenn makes the words move.'

  return (
    // One column, top to bottom: forms are easier to follow with one field at a time
    <div className="mx-auto w-full max-w-[640px]">
      <ScreenTitle
        title="Add your stuff"
        sub={sub}
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
        {needs === 'words' ? (
          <TextArea
            label="Your words"
            hint="A few short lines. Wrenn keeps your words and makes them move."
            placeholder="e.g. Stop guessing. Start tracking. Every peso, every day."
            maxLength={MAX_ABOUT}
            value={draft.about}
            onChange={(e) => onChange({ about: e.target.value })}
          />
        ) : (
          <TextArea
            label="What does it do? (optional)"
            hint="One or two sentences. Helps Wrenn show the right things."
            placeholder="e.g. Turns your app screenshots into short videos for social media."
            maxLength={MAX_ABOUT}
            value={draft.about}
            onChange={(e) => onChange({ about: e.target.value })}
          />
        )}
        {needs === 'logo' && (
          <FileDrop
            label="Logo"
            hint="A PNG with a see-through background, or an SVG, looks best."
            accept="image/*"
            files={draft.logo}
            onFiles={(logo) => onChange({ logo })}
          />
        )}
        {needs === 'screens' && (
          <>
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
          </>
        )}
        {needs !== 'logo' && (
          <FileDrop
            label="Logo (optional)"
            hint="A PNG with a see-through background looks best."
            accept="image/*"
            files={draft.logo}
            onFiles={(logo) => onChange({ logo })}
          />
        )}
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
