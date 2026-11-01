// Thick crayon-like zig-zag (inspo: brush-stroke bg, shape only).
// Used behind the FAQ list and the Download button. Size it with className.
// The viewBox has room on every side so the rounded ends never get clipped.

export function Scribble({
  className = "",
  stretch = false,
}: {
  className?: string;
  stretch?: boolean;
}) {
  return (
    <svg
      viewBox="-90 -90 1380 620"
      preserveAspectRatio={stretch ? "none" : "xMidYMid meet"}
      aria-hidden
      className={`pointer-events-none absolute -z-10 opacity-40 ${className}`}
      fill="none"
    >
      <polyline
        points="40,400 210,70 320,340 450,90 560,370 700,100 810,380 940,80 1060,350 1170,110"
        stroke="var(--color-sky)"
        strokeWidth="150"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
