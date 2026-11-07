import type { ReactNode } from 'react'

export type Choice<T extends string> = {
  id: T
  name: string
  hint?: string
  // Optional little picture above the name, e.g. a size shape
  visual?: ReactNode
}

type Props<T extends string> = {
  legend: string
  name: string
  options: Choice<T>[]
  value: T
  onChange: (value: T) => void
  // Tailwind grid columns class, e.g. "grid-cols-4"
  columns?: string
}

// A row of pick-one cards. Under the hood it's normal radio buttons,
// so arrow keys and screen readers work like any other form.
export function ChoiceGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  columns = 'grid-cols-3'
}: Props<T>) {
  return (
    <fieldset>
      <legend className="mb-sm text-[0.9375rem] font-semibold text-navy">{legend}</legend>
      <div className={`grid gap-md ${columns}`}>
        {options.map((option) => (
          <label key={option.id} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className="peer sr-only"
            />
            <span className="relative flex h-full flex-col items-center justify-center gap-sm rounded-md border-2 border-line bg-card px-md py-md text-center transition-colors duration-150 hover:border-navy/25 peer-checked:border-navy peer-checked:bg-sky-soft dark:peer-checked:bg-teal/25 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal">
              {/* Check badge on the picked card, so "picked" doesn't rely on color alone */}
              {value === option.id && (
                <span
                  className="absolute top-sm right-sm flex size-6 items-center justify-center rounded-full bg-lime text-ink"
                  aria-hidden
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
              )}
              {option.visual}
              <span className="font-display text-xl leading-none text-navy">{option.name}</span>
              {option.hint && (
                <span className="text-[0.8125rem] font-medium text-navy-body">{option.hint}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
