// Thick crayon-like zig-zag (inspo: brush-stroke bg, shape only).
// Used behind the Download button only. Size it with className.
// The viewBox has room on every side so the rounded ends never get clipped.
// At night, light sky on the dark page turns into a flat grey shape, so it switches
// to teal at a lower opacity and reads as a soft crayon mark behind the button.

export function Scribble({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="-90 -90 1380 620"
      aria-hidden
      className={`pointer-events-none absolute -z-10 opacity-40 dark:opacity-20 ${className}`}
      fill="none"
    >
      <polyline
        points="40,400 210,70 320,340 450,90 560,370 700,100 810,380 940,80 1060,350 1170,110"
        className="stroke-sky dark:stroke-teal"
        strokeWidth="150"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
