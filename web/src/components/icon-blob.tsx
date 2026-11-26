// A small line icon on a marker blob, the same hand-painted shape as the headline highlights
// (blob-words.tsx). Used by the feature list in "From photos to video" and the FAQ.

// Blob corners like the marker highlights, a different one per index
const BLOB_RADII = [
  "45% 38% 42% 40% / 50% 46% 54% 50%",
  "38% 45% 40% 42% / 46% 54% 48% 52%",
  "42% 40% 46% 38% / 54% 48% 50% 46%",
  "40% 42% 38% 45% / 48% 52% 46% 54%",
];

// The brand blob colors with the text color that reads on each (fixed, they don't change at night)
const COLORS = [
  { bg: "bg-red", ink: "text-white" },
  { bg: "bg-orange", ink: "text-[#023047]" },
  { bg: "bg-lime", ink: "text-[#023047]" },
  { bg: "bg-teal", ink: "text-white" },
];

/** `icon` is the inside of a 24x24 line icon (paths). `index` picks the color and blob shape. */
export function IconBlob({ icon, index }: { icon: React.ReactNode; index: number }) {
  const color = COLORS[index % COLORS.length];
  return (
    <span className={`relative isolate grid size-11 shrink-0 place-items-center ${color.ink}`}>
      <span
        aria-hidden
        className={`absolute inset-0 -z-10 ${color.bg}`}
        style={{ borderRadius: BLOB_RADII[index % BLOB_RADII.length], filter: `url(#marker-${index % 4})` }}
      />
      <svg viewBox="0 0 24 24" aria-hidden className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {icon}
      </svg>
    </span>
  );
}
