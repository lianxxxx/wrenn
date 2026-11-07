// The footer's background: one continuous cloud outline with round bumps on all
// four sides (no separate pieces, so no seams). Phones get their own shape drawn
// for a tall box, so the bumps stay round instead of stretching.

// Wide box (desktop): 6 bumps top and bottom, 1 on each side.
const DESKTOP_PATH =
  "M40 70 A80 80 0 0 1 170 38 A90 90 0 0 1 330 30 A95 95 0 0 1 500 34 A95 95 0 0 1 670 30 A90 90 0 0 1 830 38 A80 80 0 0 1 960 70" +
  " A70 70 0 0 1 965 190" +
  " A80 80 0 0 1 830 222 A90 90 0 0 1 670 230 A95 95 0 0 1 500 226 A95 95 0 0 1 330 230 A90 90 0 0 1 170 222 A80 80 0 0 1 40 190" +
  " A70 70 0 0 1 40 70 Z";

// Tall box (phone): 3 wide, flat bumps top and bottom, 3 big ones per side.
const PHONE_PATH =
  "M24 60 A80 80 0 0 1 120 46 A80 80 0 0 1 220 44 A80 80 0 0 1 316 60" +
  " A100 100 0 0 1 320 230 A100 100 0 0 1 320 400 A60 60 0 0 1 316 500" +
  " A80 80 0 0 1 220 516 A80 80 0 0 1 120 516 A80 80 0 0 1 24 500" +
  " A60 60 0 0 1 20 400 A100 100 0 0 1 20 230 A100 100 0 0 1 24 60 Z";

export function FooterCloud({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`text-sky-soft ${className}`}>
      <svg viewBox="-40 -30 420 620" preserveAspectRatio="none" className="h-full w-full sm:hidden">
        <path d={PHONE_PATH} fill="currentColor" />
      </svg>
      <svg viewBox="-30 -30 1060 320" preserveAspectRatio="none" className="hidden h-full w-full sm:block">
        <path d={DESKTOP_PATH} fill="currentColor" />
      </svg>
    </div>
  );
}
