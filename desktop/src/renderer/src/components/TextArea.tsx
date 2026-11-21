import { useId, type TextareaHTMLAttributes } from 'react'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  hint?: string
  value: string
  // Most letters allowed. Shows a small counter under the box.
  maxLength: number
}

// A labelled box for a few sentences. Same look as TextField.
export function TextArea({ label, hint, value, maxLength, className = '', ...props }: Props) {
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
      <textarea
        id={id}
        rows={3}
        value={value}
        maxLength={maxLength}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-sm block w-full resize-y rounded-sm border-2 border-line bg-card px-md py-[10px] text-base text-navy placeholder:text-navy-body/75 hover:border-navy/40 focus:border-navy"
        {...props}
      />
      <p className="mt-xs text-right text-[0.8125rem] font-medium text-navy-body" aria-hidden>
        {value.length}/{maxLength}
      </p>
    </div>
  )
}
