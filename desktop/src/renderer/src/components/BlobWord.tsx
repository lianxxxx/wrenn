// Marker-highlight blob word (see DESIGN.md Shapes), same idea as the landing page.
// The color shape gets a noise filter so its edges look hand-painted; the text stays sharp.

const shapes = [
  { borderRadius: '45% 38% 42% 40% / 50% 46% 54% 50%', rotate: '-1.5deg' },
  { borderRadius: '38% 45% 40% 42% / 46% 54% 48% 52%', rotate: '1deg' },
  { borderRadius: '42% 40% 46% 38% / 54% 48% 50% 46%', rotate: '-0.5deg' }
]

// Render once in the app. One filter per seed, so blobs get different bumps.
export function MarkerFilters() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      {shapes.map((_, i) => (
        <filter key={i} id={`marker-${i}`} x="-20%" y="-30%" width="140%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={i + 3} />
          <feDisplacementMap in="SourceGraphic" scale="14" />
        </filter>
      ))}
    </svg>
  )
}

type Props = {
  word: string
  // Tailwind background class, e.g. "bg-teal"
  bg: string
  seed?: number
}

// Headline blobs always have white text (DESIGN.md), so keep them headline size.
export function BlobWord({ word, bg, seed = 0 }: Props) {
  const shape = shapes[seed % shapes.length]
  return (
    <span className="blob-pop relative isolate inline-block px-[0.4em] pt-[0.08em] pb-[0.14em] text-white" style={{ rotate: shape.rotate }}>
      <span
        aria-hidden
        className={`absolute -inset-1 -z-10 ${bg}`}
        style={{ borderRadius: shape.borderRadius, filter: `url(#marker-${seed % shapes.length})` }}
      />
      {word}
    </span>
  )
}
