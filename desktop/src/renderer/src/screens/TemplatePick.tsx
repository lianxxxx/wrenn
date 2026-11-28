import { useEffect, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { ScreenTitle } from '../components/ScreenTitle'
import { templates, type CustomTemplate } from '../data'

type Props = {
  // The user's own saved prompt templates, oldest first
  customTemplates: CustomTemplate[]
  onPick: (templateId: string) => void
  // Opens the "My own prompt" form
  onNewCustom: () => void
  onDeleteCustom: (id: string) => Promise<void>
}

// The light blob colors the cards use (they stay the same in dark mode)
const BLOB_COLORS = ['bg-sky', 'bg-lemon', 'bg-lime', 'bg-orange']

// A color for each saved prompt card. It cycles through the blob colors, skipping any that
// match the card on its left or the card right above it (the grid has 2 columns).
function customColors(count: number): string[] {
  const grid = templates.map((t) => (t.available ? t.color : ''))
  const colors: string[] = []
  for (let i = 0; i < count; i++) {
    const at = grid.length
    const left = at % 2 === 1 ? grid[at - 1] : ''
    const above = grid[at - 2] ?? ''
    let color = BLOB_COLORS[i % BLOB_COLORS.length]
    for (let k = 0; k < BLOB_COLORS.length && (color === left || color === above); k++) {
      color = BLOB_COLORS[(i + k + 1) % BLOB_COLORS.length]
    }
    grid.push(color)
    colors.push(color)
  }
  return colors
}

const cardLook =
  'flex min-h-44 flex-col items-start justify-end rounded-lg px-[22px] py-[28px] text-left text-ink shadow-[0_10px_30px_rgba(0,0,0,0.08)]'

// Step 1 of the template path. Cards with a credit show who inspired them.
// After Wrenn's own templates come the user's saved prompts, then "My own prompt" to add one.
export function TemplatePick({ customTemplates, onPick, onNewCustom, onDeleteCustom }: Props) {
  const colors = customColors(customTemplates.length)
  return (
    <div className="mx-auto w-full max-w-[896px]">
      <ScreenTitle title="Pick a template" step="Step 1 of 3" />

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

        {customTemplates.map((t, i) => (
          <CustomCard
            key={t.id}
            template={t}
            color={colors[i]}
            onPick={() => onPick(t.id)}
            onDelete={() => onDeleteCustom(t.id)}
          />
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
  // A blob color class, like "bg-sky"
  color: string
  onPick: () => void
  onDelete: () => Promise<void>
}

// One saved prompt. Delete asks first, right on the card (no pop-up window).
function CustomCard({ template, color, onPick, onDelete }: CardProps) {
  const [asking, setAsking] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const questionId = `delete-${template.id}`
  const trashRef = useRef<HTMLButtonElement>(null)
  // True once the question was shown, so focus only goes back after "Keep it" or Escape
  const asked = useRef(false)

  // The question replaced the card, so put keyboard focus back on the trash button when it returns.
  useEffect(() => {
    if (asking) asked.current = true
    else if (asked.current) {
      asked.current = false
      trashRef.current?.focus()
    }
  }, [asking])

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
      <button type="button" onClick={onPick} className={`press w-full cursor-pointer ${color} ${cardLook}`}>
        <span className="pr-2xl font-display text-[1.875rem] leading-[1.1]">{template.name}</span>
        <span className="mt-sm line-clamp-2 text-base">{template.prompt}</span>
        {template.credit && (
          <span className="mt-xs line-clamp-1 break-all text-[0.8125rem] font-semibold opacity-80">
            Inspired by {template.credit}
          </span>
        )}
      </button>
      {/* 40px to click. Ink focus ring: the usual teal one is hard to see on the light cards. */}
      <button
        ref={trashRef}
        type="button"
        onClick={() => setAsking(true)}
        aria-label={`Delete ${template.name}`}
        className="absolute top-md right-md flex size-10 cursor-pointer items-center justify-center rounded-pill text-ink hover:bg-ink/10 focus-visible:bg-ink/10 focus-visible:outline-ink! focus-visible:outline-offset-0!"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" />
        </svg>
      </button>
    </div>
  )
}
