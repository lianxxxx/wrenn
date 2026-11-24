import { useId } from 'react'

type Props = {
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

// On / off switch with its label and a short line explaining it.
export function Toggle({ label, hint, checked, onChange }: Props) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-lg py-sm">
      <div>
        <div id={`${id}-label`} className="text-[0.9375rem] font-semibold text-navy">
          {label}
        </div>
        {hint && (
          <div id={`${id}-hint`} className="text-[0.8125rem] font-medium text-navy-body">
            {hint}
          </div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-pill border-2 border-navy transition-colors duration-150 ${checked ? 'bg-teal' : 'bg-card'}`}
      >
        <span
          aria-hidden
          className={`absolute top-1/2 left-[3px] size-5 -translate-y-1/2 rounded-full motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[var(--ease-out-strong)] ${checked ? 'translate-x-6 bg-white' : 'bg-navy'}`}
        />
      </button>
    </div>
  )
}
