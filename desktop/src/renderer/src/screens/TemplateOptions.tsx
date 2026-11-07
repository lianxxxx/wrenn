import { Button } from '../components/Button'
import { ChoiceGroup } from '../components/ChoiceGroup'
import { ScreenTitle } from '../components/ScreenTitle'
import { SizePicker } from '../components/SizePicker'
import { lengths, vibes, type TemplateDraft } from '../data'

type Props = {
  draft: TemplateDraft
  onChange: (changes: Partial<TemplateDraft>) => void
  onBack: () => void
  onNext: () => void
}

// Step 2 of the template path: size, length and vibe.
export function TemplateOptions({ draft, onChange, onBack, onNext }: Props) {
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
      </div>

      <div className="mt-xl flex justify-end">
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  )
}
