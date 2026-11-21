type Props = {
  // 0 to 100
  percent: number
  // What screen readers call the bar, and what they read as its value (e.g. "40%, about 3 min left")
  label?: string
  valueText?: string
  className?: string
}

// The thick progress bar for "making your video" screens.
// The fill slides (transform, not width) and holds still if motion is off.
export function ProgressBar({ percent, label = 'Progress', valueText, className = 'mt-xl' }: Props) {
  const value = Math.min(100, Math.max(0, Math.round(percent)))
  return (
    <div
      className={`h-4 overflow-hidden rounded-pill border-2 border-navy bg-card ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={valueText}
    >
      <div
        className="h-full w-full rounded-pill bg-teal motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[var(--ease-out-strong)]"
        style={{ transform: `translateX(${value - 100}%)` }}
      />
    </div>
  )
}
