import { useState } from 'react'
import { Button } from '../components/Button'
import { ScreenTitle } from '../components/ScreenTitle'
import { TextArea } from '../components/TextArea'
import { TextField } from '../components/TextField'
import { cleanError, type NewCustomTemplate } from '../data'
import { MAX_CREDIT, MAX_CUSTOM_PROMPT, MAX_TEMPLATE_NAME } from '../../../shared/limits'

type Props = {
  onBack: () => void
  // Saves it on this computer. Throws with a plain message if it can't.
  onSave: (template: NewCustomTemplate) => Promise<void>
}

// "My own prompt": save a prompt you like as your own template.
// One column, one field at a time. Wrenn still does the size, length and render.
export function CustomTemplateForm({ onBack, onSave }: Props) {
  const [name, setName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [credit, setCredit] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const ready = name.trim() !== '' && prompt.trim() !== ''
  const missing =
    !name.trim() && !prompt.trim() ? 'Add a name and your prompt.' : !name.trim() ? 'Add a name.' : 'Add your prompt.'

  async function save() {
    setError('')
    setSaving(true)
    try {
      await onSave({ name: name.trim(), prompt: prompt.trim(), credit: credit.trim() || undefined })
    } catch (e) {
      setError(cleanError(e))
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <ScreenTitle
        title="My own prompt"
        sub="Save a prompt you like as your own template. Wrenn still handles the size, the timing and the render."
        onBack={onBack}
      />

      <div className="flex flex-col gap-xl">
        <TextField
          label="Template name"
          placeholder="e.g. Neon launch"
          maxLength={MAX_TEMPLATE_NAME}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextArea
          label="Your prompt"
          hint="Describe the video you want: the story, the look, the pace. Your files and the size you pick get added for you."
          placeholder="e.g. Open on a black screen. The logo cracks in like glass, then each screenshot slams in on the beat."
          maxLength={MAX_CUSTOM_PROMPT}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <TextField
          label="Where it's from (optional)"
          hint="The creator or a link, so they get the credit."
          placeholder="e.g. @creator or a link"
          maxLength={MAX_CREDIT}
          value={credit}
          onChange={(e) => setCredit(e.target.value)}
        />
      </div>

      {error && (
        <p className="mt-xl rounded-sm border-2 border-red bg-card px-md py-sm font-semibold text-navy" role="alert">
          {error}
        </p>
      )}

      <div className="mt-xl flex items-center justify-end gap-md">
        {!ready && <p className="text-[0.9375rem] text-navy-body">{missing}</p>}
        <Button onClick={save} disabled={!ready || saving}>
          {saving ? 'Saving...' : 'Save template'}
        </Button>
      </div>
    </div>
  )
}
