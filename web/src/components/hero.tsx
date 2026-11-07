import { BlobWords } from "@/components/blob-words";
import { Stars } from "@/components/stars";

// Hero (inspo: Cloudroom). Centered blob headline, short sub, one button,
// soft clouds behind. The phone video frame was removed for now; a hero visual
// comes back once there are real Wrenn sample videos (see inspo 11, gallery hero).

export function Cloud({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 140 70" aria-hidden className={`absolute -z-10 dark:hidden ${className}`}>
      <path
        d="M20 60 a20 20 0 0 1 4-38 a28 28 0 0 1 52-8 a22 22 0 0 1 40 14 a18 18 0 0 1 4 32 z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// Order of the staggered entrance (see .hero-rise in globals.css)
const heroStep = (step: number) => ({ "--hero-step": step }) as React.CSSProperties;

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-md pb-3xl pt-2xl text-center sm:pt-3xl">
      <Stars />
      {/* First-draft positions (upper left, upper right, lower right, lower left),
          current sizes. None around the phone. */}
      <Cloud className="left-[4%] top-8 w-24 sm:w-28" />
      <Cloud className="right-[18%] top-28 hidden w-20 opacity-60 sm:block" />
      <Cloud className="right-[5%] top-[27rem] hidden w-40 md:block" />
      <Cloud className="left-[12%] top-[34.5rem] hidden w-20 opacity-50 md:block" />

      <h1 style={heroStep(0)} className="hero-rise mx-auto max-w-4xl font-display text-[clamp(2.75rem,10vw,6.5rem)] leading-[1.02] text-navy">
        No prompts.
        <br />
        Just{" "}
        <span className="inline-flex align-baseline">
          <BlobWords className="" offset={1} pop words={[{ word: "render.", bg: "bg-teal", text: "text-white" }]} />
        </span>
      </h1>

      <p style={heroStep(1)} className="hero-rise mx-auto mt-xl max-w-[34rem] text-[1.1875rem] leading-relaxed text-navy-body">
        Pick a template, drop in your photos or videos, and your video&apos;s ready. No editing
        skills needed.
      </p>

      <div style={heroStep(2)} className="hero-rise mt-xl flex flex-col items-center gap-sm">
        <a
          href="#"
          className="rounded-pill bg-navy px-[22px] py-2.5 font-display text-xl text-cream transition-transform active:translate-y-0.5"
        >
          Download for Windows
        </a>
      </div>
    </section>
  );
}
