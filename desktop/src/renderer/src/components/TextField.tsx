import { useId, type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  // A short warning shown under the box, e.g. when a key looks wrong
  warning?: string
}

// A labelled text box with an optional help line under the label.
export function TextField({ label, hint, warning, className = '', ...props }: Props) {
  const id = useId()
  const describedBy = [hint && `${id}-hint`, warning && `${id}-warning`].filter(Boolean).join(' ')
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[0.9375rem] font-semibold text-navy">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-[0.8125rem] font-medium text-navy-body">
          {hint}
        </p>
      )}
      <input
        id={id}
        aria-describedby={describedBy || undefined}
        aria-invalid={warning ? true : undefined}
        className={`mt-sm w-full rounded-sm border-2 bg-card px-md py-[10px] text-base text-navy placeholder:text-navy-body/75 focus:border-navy ${warning ? 'border-red' : 'border-line hover:border-navy/40'}`}
        {...props}
      />
      {warning && (
        <p id={`${id}-warning`} className="mt-xs text-[0.8125rem] font-semibold text-red dark:text-[#FF8A80]" role="alert">
          {warning}
        </p>
      )}
    </div>
  )
}
