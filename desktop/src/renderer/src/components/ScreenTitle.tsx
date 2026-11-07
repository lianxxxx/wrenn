import type { ReactNode } from 'react'

type Props = {
  title: ReactNode
  sub?: string
  // e.g. "Step 1 of 3"
  step?: string
  onBack?: () => void
}

// Top of each screen: a Back link, where you are, then the big title.
export function ScreenTitle({ title, sub, step, onBack }: Props) {
  return (
    <div className="mb-xl">
      {(onBack || step) && (
        <div className="mb-md flex items-center gap-md text-[0.9375rem] font-semibold text-navy-body">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex cursor-pointer items-center gap-xs rounded-sm py-xs pr-sm text-navy hover:underline"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </button>
          )}
          {step && <span>{step}</span>}
        </div>
      )}
      <h1 className="font-display text-[3rem] leading-[1.05] text-navy">{title}</h1>
      {sub && <p className="mt-sm max-w-[576px] text-[1.1875rem] leading-[1.55] text-navy-body">{sub}</p>}
    </div>
  )
}
