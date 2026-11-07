// The thick progress bar for "making your video" screens. percent is 0 to 100.
export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      className="mt-xl h-4 overflow-hidden rounded-pill border-2 border-navy bg-card"
      role="progressbar"
      aria-label="Progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div
        className="h-full rounded-pill bg-teal transition-[width] duration-500 ease-[var(--ease-out-strong)]"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
