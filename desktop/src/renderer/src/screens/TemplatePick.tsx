import { useState } from 'react'
import { Button } from '../components/Button'
import { ScreenTitle } from '../components/ScreenTitle'
import { templates, type CustomTemplate } from '../data'

type Props = {
  // The user's own saved prompt templates, oldest first
  customTemplates: CustomTemplate[]
  onBack: () => void
  onPick: (templateId: string) => void
  // Opens the "My own prompt" form
  onNewCustom: () => void
  onDeleteCustom: (id: string) => Promise<void>
}

const cardLook =
  'flex min-h-44 flex-col items-start justify-end rounded-lg px-[22px] py-[28px] text-left text-ink shadow-[0_10px_30px_rgba(0,0,0,0.08)]'

// Step 1 of the template path. Cards with a credit show who inspired them.
// After Wrenn's own templates come the user's saved prompts, then "My own prompt" to add one.
export function TemplatePick({ customTemplates, onBack, onPick, onNewCustom, onDeleteCustom }: Props) {
  return (
    <div className="mx-auto w-full max-w-[896px]">
      <ScreenTitle title="Pick a template" step="Step 1 of 3" onBack={onBack} />

      <div className="grid grid-cols-2 gap-lg">
        {templates.map((t) =>
          t.available ? (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(t.id)}
              className={`press cursor-pointer ${cardLook} ${t.color}`}
            >
              <span className="font-display text-[1.875rem] leading-[1.1]">{t.name}</span>
              <span className="mt-sm text-base">{t.description}</span>
              {t.credit && <span className="mt-xs text-[0.8125rem] font-semibold opacity-80">Inspired by {t.credit}</span>}
            </button>
          ) : (
            <div
              key={t.id}
              aria-disabled="true"
              className="flex min-h-44 flex-col items-start justify-end rounded-lg border-2 border-dashed border-navy/25 px-[22px] py-[28px] text-left"
            >
              <span className="mb-sm rounded-pill bg-navy/10 px-[10px] py-[2px] text-[0.8125rem] font-semibold text-navy">
                Coming soon
              </span>
              <span className="font-display text-[1.875rem] leading-[1.1] text-navy/60">{t.name}</span>
              <span className="mt-sm text-base text-navy-body/80">{t.description}</span>
            </div>
          )
        )}

        {customTemplates.map((t) => (
          <CustomCard key={t.id} template={t} onPick={() => onPick(t.id)} onDelete={() => onDeleteCustom(t.id)} />
        ))}

        <button
          type="button"
          onClick={onNewCustom}
          className="press flex min-h-44 cursor-pointer flex-col items-start justify-end rounded-lg border-2 border-dashed border-navy/40 px-[22px] py-[28px] text-left text-navy hover:border-navy"
        >
          <svg viewBox="0 0 24 24" className="mb-sm size-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="font-display text-[1.875rem] leading-[1.1]">My own prompt</span>
          <span className="mt-sm text-base text-navy-body">Got a prompt you like? Save it as your own template.</span>
        </button>
      </div>
    </div>
  )
}

type CardProps = {
  template: CustomTemplate
  onPick: () => void
  onDelete: () => Promise<void>
}

// One saved prompt. Delete asks first, right on the card (no pop-up window).
function CustomCard({ template, onPick, onDelete }: CardProps) {
  const [asking, setAsking] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const questionId = `delete-${template.id}`

  async function confirmDelete() {
    setDeleting(true)
    setError('')
    try {
      await onDelete()
    } catch {
      setError("Wrenn couldn't delete it. Try again.")
      setDeleting(false)
    }
  }

  if (asking) {
    return (
      <div
        role="group"
        aria-labelledby={questionId}
        className="flex min-h-44 flex-col items-start justify-end rounded-lg border-2 border-line bg-card px-[22px] py-[28px] text-left"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setAsking(false)
        }}
      >
        <p id={questionId} className="font-display text-2xl leading-tight text-navy">
          Delete "{template.name}"?
        </p>
        <p className="mt-xs text-base text-navy-body">Your videos stay. Only this saved prompt goes.</p>
        {error && (
          <p className="mt-xs text-[0.8125rem] font-semibold text-red dark:text-[#FF8A80]" role="alert">
            {error}
          </p>
        )}
        <div className="mt-md flex flex-wrap gap-md">
          {/* Focus lands on the safe choice, so a stray Enter keeps the template */}
          <Button autoFocus variant="ghost" onClick={() => setAsking(false)} disabled={deleting}>
            Keep it
          </Button>
          <Button onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Yes, delete'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    // The pick button and the delete button sit side by side (a button can't hold another button)
    <div className="relative">
      <button type="button" onClick={onPick} className={`press w-full cursor-pointer bg-orange ${cardLook}`}>
        <span className="pr-2xl font-display text-[1.875rem] leading-[1.1]">{template.name}</span>
        <span className="mt-sm line-clamp-2 text-base">{template.prompt}</span>
        {template.credit && (
          <span className="mt-xs line-clamp-1 break-all text-[0.8125rem] font-semibold opacity-80">
            Inspired by {template.credit}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={() => setAsking(true)}
        aria-label={`Delete ${template.name}`}
        className="absolute top-md right-md cursor-pointer rounded-pill p-sm text-ink hover:bg-ink/10"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" />
        </svg>
      </button>
    </div>
  )
}
