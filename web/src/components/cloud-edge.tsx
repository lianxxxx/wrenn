// Round, uneven cloud bumps rising upward. Sits on top of a colored block
// (Made for every feed band, footer). Color comes from the text color class.

export function CloudEdge({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 -30 1200 110" preserveAspectRatio="none" aria-hidden className={`block w-full ${className}`}>
      <path
        d="M0 80 V55 A84 84 0 0 1 140 45 A114 114 0 0 1 330 40 A102 102 0 0 1 500 50 A126 126 0 0 1 710 38 A108 108 0 0 1 890 48 A114 114 0 0 1 1080 42 A72 72 0 0 1 1200 55 V80 Z"
        fill="currentColor"
      />
    </svg>
  );
}
