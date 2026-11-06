// Marker-highlight blob words (see DESIGN.md Shapes).
// A rounded shape roughened by an SVG noise filter, so the edges look
// hand-painted while the text stays sharp.

const blobShapes = [
  { borderRadius: "45% 38% 42% 40% / 50% 46% 54% 50%", transform: "rotate(-1.5deg)" },
  { borderRadius: "38% 45% 40% 42% / 46% 54% 48% 52%", transform: "rotate(1deg)" },
  { borderRadius: "42% 40% 46% 38% / 54% 48% 50% 46%", transform: "rotate(-0.5deg)" },
  { borderRadius: "40% 42% 38% 45% / 48% 52% 46% 54%", transform: "rotate(1.5deg)" },
];

const MARKER_FILTERS = 4;

// Render once per page (in the root layout). One filter per seed,
// so neighbouring blobs get different bumps.
export function MarkerFilters() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      {Array.from({ length: MARKER_FILTERS }, (_, i) => (
        <filter key={i} id={`marker-${i}`} x="-20%" y="-30%" width="140%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={i + 3} />
          <feDisplacementMap in="SourceGraphic" scale="14" />
        </filter>
      ))}
    </svg>
  );
}

export type BlobWord = { word: string; bg: string; text: string };

export function BlobWords({
  words,
  className = "text-5xl",
  offset = 0,
  pop = false,
}: {
  words: BlobWord[];
  className?: string;
  offset?: number;
  // Pop in once when scrolled into view (section headlines only)
  pop?: boolean;
}) {
  return (
    <span className="flex flex-wrap justify-center gap-x-[0.25em] gap-y-[0.2em]">
      {words.map((w, index) => {
        const i = index + offset;
        const shape = blobShapes[i % blobShapes.length];
        return (
          <span
            key={w.word}
            className={`relative isolate font-display leading-tight px-[0.4em] pt-[0.08em] pb-[0.14em] ${className} ${w.text}`}
            style={{ transform: shape.transform }}
            data-reveal={pop ? "pop" : undefined}
          >
            <span
              aria-hidden
              className={`absolute -inset-1 -z-10 ${w.bg}`}
              style={{ borderRadius: shape.borderRadius, filter: `url(#marker-${i % MARKER_FILTERS})` }}
            />
            {w.word}
          </span>
        );
      })}
    </span>
  );
}
