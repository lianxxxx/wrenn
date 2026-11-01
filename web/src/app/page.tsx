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

// Uneven blob corners and tilts, from DESIGN.md Shapes
const blobShapes = [
  { borderRadius: "58% 42% 52% 48% / 55% 48% 52% 45%", transform: "rotate(-3deg)" },
  { borderRadius: "40% 60% 48% 52% / 52% 44% 56% 48%", transform: "rotate(2deg)" },
  { borderRadius: "60% 40% 45% 55% / 48% 60% 40% 52%", transform: "rotate(-1.5deg)" },
  { borderRadius: "48% 52% 58% 42% / 58% 42% 50% 50%", transform: "rotate(2.5deg)" },
];

type BlobWord = { word: string; className: string };

function Blobs({ words }: { words: BlobWord[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-2">
      {words.map((w, i) => (
        <span
          key={w.word}
          className={`font-display text-5xl leading-tight px-[0.45em] pt-[0.1em] pb-[0.18em] ${w.className}`}
          style={blobShapes[i % blobShapes.length]}
        >
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
              { word: "No", className: "bg-sky text-navy" },
              { word: "prompts.", className: "bg-orange text-navy" },
              { word: "Just", className: "bg-red text-white" },
              { word: "render.", className: "bg-lime text-navy" },
            ]}
          />
          <p className="text-sm text-navy-body">Light background, alternating dark and light</p>
          <Blobs
            words={[
              { word: "No", className: "bg-teal text-white" },
              { word: "prompts.", className: "bg-orange text-navy" },
              { word: "Just", className: "bg-red text-white" },
              { word: "render.", className: "bg-lime text-navy" },
            ]}
          />
          <div className="flex flex-col gap-lg rounded-lg bg-navy p-xl">
            <p className="text-sm text-cream">Dark background: white text on red and teal only</p>
            <Blobs
              words={[
                { word: "No", className: "bg-teal text-white" },
                { word: "prompts.", className: "bg-red text-white" },
                { word: "Just", className: "bg-teal text-white" },
                { word: "render.", className: "bg-red text-white" },
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
