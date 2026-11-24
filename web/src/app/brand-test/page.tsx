import type { Metadata } from "next";

// A test page only: keep it out of Google
export const metadata: Metadata = { title: "Brand test", robots: { index: false, follow: false } };

// Brand test page: checks that the tokens and fonts from brand/ work in code.
// Throwaway until the real landing page replaces it.

const colors = [
  { name: "navy", hex: "#023047", className: "bg-navy" },
  { name: "cream", hex: "#FFF8EC", className: "bg-cream" },
  { name: "red", hex: "#D62828", className: "bg-red" },
  { name: "orange", hex: "#F77F00", className: "bg-orange" },
  { name: "lemon", hex: "#F3DA2E", className: "bg-lemon" },
  { name: "lime", hex: "#82B51F", className: "bg-lime" },
  { name: "sky", hex: "#8ECAE6", className: "bg-sky" },
  { name: "teal", hex: "#219EBC", className: "bg-teal" },
  { name: "golden", hex: "#E0B800", className: "bg-golden" },
];

// Marker-highlight blobs: a rounded shape roughened by an SVG noise filter,
// so the edges look hand-painted while the text stays sharp.
const blobShapes = [
  { borderRadius: "45% 38% 42% 40% / 50% 46% 54% 50%", transform: "rotate(-1.5deg)" },
  { borderRadius: "38% 45% 40% 42% / 46% 54% 48% 52%", transform: "rotate(1deg)" },
  { borderRadius: "42% 40% 46% 38% / 54% 48% 50% 46%", transform: "rotate(-0.5deg)" },
  { borderRadius: "40% 42% 38% 45% / 48% 52% 46% 54%", transform: "rotate(1.5deg)" },
];

const MARKER_FILTERS = 4;

// One filter per seed, so neighbouring blobs get different bumps
function MarkerFilters() {
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

type BlobWord = { word: string; bg: string; text: string };

function Blobs({ words }: { words: BlobWord[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-3">
      {words.map((w, i) => (
        <span
          key={w.word}
          className={`relative isolate font-display text-5xl leading-tight px-[0.4em] pt-[0.08em] pb-[0.14em] ${w.text}`}
          style={{ transform: blobShapes[i % blobShapes.length].transform }}
        >
          <span
            aria-hidden
            className={`absolute -inset-1 -z-10 ${w.bg}`}
            style={{
              borderRadius: blobShapes[i % blobShapes.length].borderRadius,
              filter: `url(#marker-${i % MARKER_FILTERS})`,
            }}
          />
          {w.word}
        </span>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col items-center gap-lg">
      <span className="rounded-pill border-2 border-navy px-3.5 py-1 text-[0.9375rem] font-semibold">
        {title}
      </span>
      {children}
    </section>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[1160px] flex-col gap-3xl px-md py-2xl text-center">
      <MarkerFilters />
      <header className="flex flex-col items-center gap-sm">
        <h1 className="font-display text-8xl leading-none">wrenn</h1>
        <p className="font-display text-3xl text-orange">No prompts. Just render.</p>
        <p className="text-navy-body">Brand test page. Tokens from brand/tokens.css, fonts from brand/fonts.</p>
      </header>

      <Section title="Colors">
        <div className="grid w-full grid-cols-2 gap-md sm:grid-cols-3 lg:grid-cols-5">
          {colors.map((c) => (
            <div key={c.name} className="overflow-hidden rounded-md border border-line bg-white text-left">
              <div className={`h-20 ${c.className}`} />
              <div className="p-sm text-sm">
                <b className="block">{c.name}</b>
                <code className="text-navy-body">{c.hex}</code>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="flex w-full flex-col gap-md text-left">
          <p className="font-display text-7xl leading-[1.05]">Display: No prompts.</p>
          <p className="font-display text-[3.5rem] leading-[1.05]">H2: How it works</p>
          <p className="font-display text-3xl">H3: Pick a template</p>
          <p className="text-[1.1875rem] leading-relaxed">Lead: Pick a template, drop in your logo and screenshots, and Wrenn renders an MP4.</p>
          <p className="leading-relaxed">Body: No prompts and no timeline. Three steps and your video is ready to post.</p>
          <p className="text-[0.9375rem] font-semibold">Label: Home · Templates · How it works</p>
          <p className="text-[0.8125rem] font-medium text-navy-body">Small: Saved to Documents/Wrenn</p>
        </div>
      </Section>

      <Section title="Blob words">
        <div className="flex flex-col gap-lg">
          <p className="text-sm text-navy-body">Light background, mostly light blobs</p>
          <Blobs
            words={[
              { word: "No", bg: "bg-sky", text: "text-navy" },
              { word: "prompts.", bg: "bg-orange", text: "text-navy" },
              { word: "Just", bg: "bg-red", text: "text-white" },
              { word: "render.", bg: "bg-lime", text: "text-navy" },
            ]}
          />
          <p className="text-sm text-navy-body">Light background, alternating dark and light</p>
          <Blobs
            words={[
              { word: "No", bg: "bg-teal", text: "text-white" },
              { word: "prompts.", bg: "bg-orange", text: "text-navy" },
              { word: "Just", bg: "bg-red", text: "text-white" },
              { word: "render.", bg: "bg-lime", text: "text-navy" },
            ]}
          />
          <div className="flex flex-col gap-lg rounded-lg bg-navy p-xl">
            <p className="text-sm text-cream">Dark background: white text on red and teal only</p>
            <Blobs
              words={[
                { word: "No", bg: "bg-teal", text: "text-white" },
                { word: "prompts.", bg: "bg-red", text: "text-white" },
                { word: "Just", bg: "bg-teal", text: "text-white" },
                { word: "render.", bg: "bg-red", text: "text-white" },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center justify-center gap-md">
          <button
            data-testid="button-primary"
            className="rounded-pill bg-navy px-[22px] py-2.5 font-display text-xl text-cream shadow-[0_4px_0_rgba(2,48,71,0.25)]"
          >
            Download free
          </button>
          <button className="rounded-pill border-2 border-navy px-[22px] py-2 font-display text-xl text-navy">
            See a demo
          </button>
          <div className="rounded-lg bg-navy p-md">
            <button className="rounded-pill bg-cream px-[22px] py-2.5 font-display text-xl text-navy">
              Download
            </button>
          </div>
        </div>
      </Section>
    </main>
  );
}
