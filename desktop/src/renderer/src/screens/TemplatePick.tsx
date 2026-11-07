import { ScreenTitle } from '../components/ScreenTitle'
import { templates } from '../data'

type Props = {
  onBack: () => void
  onPick: (templateId: string) => void
}

// Step 1 of the template path. Only one template works for now.
export function TemplatePick({ onBack, onPick }: Props) {
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
              className={`press flex min-h-44 cursor-pointer flex-col items-start justify-end rounded-lg px-[22px] py-[28px] text-left text-ink shadow-[0_10px_30px_rgba(0,0,0,0.08)] ${t.color}`}
            >
              <span className="font-display text-[1.875rem] leading-[1.1]">{t.name}</span>
              <span className="mt-sm text-base">{t.description}</span>
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
      </div>
    </div>
  )
}
