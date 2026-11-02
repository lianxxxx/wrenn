// Round, uneven cloud bumps rising upward. Sits on top of a colored block
// (From photos to video band, footer). Color comes from the text color class.

const CLOUD_PATH =
  "M0 80 A84 84 0 0 1 140 45 A114 114 0 0 1 330 40 A102 102 0 0 1 500 50 A126 126 0 0 1 710 38 A108 108 0 0 1 890 48 A114 114 0 0 1 1080 42 A72 72 0 0 1 1200 80 Z";

// Phones get 3 big bumps: the 7-bump shape looks crumpled when squeezed that narrow.
const CLOUD_PATH_PHONE = "M0 80 A75 75 0 0 1 130 45 A84 84 0 0 1 270 42 A78 78 0 0 1 400 80 Z";

export function CloudEdge({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      <svg viewBox="0 -30 400 110" preserveAspectRatio="none" className="block h-full w-full sm:hidden">
        <path d={CLOUD_PATH_PHONE} fill="currentColor" />
      </svg>
      <svg viewBox="0 -30 1200 110" preserveAspectRatio="none" className="hidden h-full w-full sm:block">
        <path d={CLOUD_PATH} fill="currentColor" />
      </svg>
    </div>
  );
}

