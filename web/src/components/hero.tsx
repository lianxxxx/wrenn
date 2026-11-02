import { BlobWords } from "@/components/blob-words";
import { SampleVideo } from "@/components/sample-video";

// Hero (inspo: Cloudroom). Centered blob headline, short sub, one button,
// soft clouds behind, and a 9:16 video frame peeking up from the bottom.
// The video frame is a placeholder until Wrenn can render a real one.

export function Cloud({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 140 70" aria-hidden className={`absolute -z-10 ${className}`}>
      <path
        d="M20 60 a20 20 0 0 1 4-38 a28 28 0 0 1 52-8 a22 22 0 0 1 40 14 a18 18 0 0 1 4 32 z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

function PopLines() {
  return (
    <svg
      viewBox="0 0 360 60"
      aria-hidden
      className="absolute -top-8 left-1/2 w-[360px] -translate-x-1/2"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    >
      <path d="M40 50 L22 30" />
      <path d="M58 40 L52 14" />
      <path d="M320 50 L338 30" />
      <path d="M302 40 L308 14" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-md pt-2xl text-center sm:pt-3xl">
      {/* First-draft positions (upper left, upper right, lower right, lower left),
          current sizes. None around the phone. */}
      <Cloud className="left-[4%] top-8 w-24 sm:w-28" />
      <Cloud className="right-[18%] top-28 hidden w-20 opacity-60 sm:block" />
      <Cloud className="right-[5%] top-[27rem] hidden w-40 md:block" />
      <Cloud className="left-[12%] top-[34.5rem] hidden w-20 opacity-50 md:block" />

      <h1 className="mx-auto max-w-4xl font-display text-[clamp(2.75rem,10vw,6.5rem)] leading-[1.02] text-navy">
        No prompts.
        <br />
        Just{" "}
        <span className="inline-flex align-baseline">
          <BlobWords className="" offset={1} words={[{ word: "render.", bg: "bg-teal", text: "text-white" }]} />
        </span>
      </h1>

      <p className="mx-auto mt-xl max-w-[34rem] text-[1.1875rem] leading-relaxed text-navy-body">
        Pick a template, drop in your photos or videos, and your video&apos;s ready. No editing
        skills needed.
      </p>

      <div className="mt-xl flex flex-col items-center gap-sm">
        <a
          href="#"
          className="rounded-pill bg-navy px-[22px] py-2.5 font-display text-xl text-cream transition-transform active:translate-y-0.5"
        >
          Download for Windows
        </a>
      </div>

      {/* Product peeking up from the bottom (placeholder video frame) */}
      <div className="relative mx-auto mt-2xl h-[300px] w-[260px] text-navy">
        <PopLines />
        <SampleVideo className="aspect-[9/16] w-full justify-start rounded-[28px] border-8 border-navy pt-xl" />
      </div>
    </section>
  );
}
