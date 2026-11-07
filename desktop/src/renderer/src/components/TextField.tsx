import { useId, type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
}

// A labelled text box with an optional help line under the label.
export function TextField({ label, hint, className = '', ...props }: Props) {
  const id = useId()
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
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-sm w-full rounded-sm border-2 border-line bg-card px-md py-[10px] text-base text-navy placeholder:text-navy-body/75 hover:border-navy/40 focus:border-navy"
        {...props}
      />
    </div>
  )
}
