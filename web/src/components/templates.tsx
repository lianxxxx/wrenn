import Image from "next/image";
import { BlobWords, type BlobWord } from "@/components/blob-words";
import { Scribble } from "@/components/scribble";
import { SectionHeading } from "@/components/section-heading";

// "Made for every feed" (inspo: Little Bloom staggered cards).
// Centered headline and sub, then the 4 size presets as frames at staggered heights with sticker labels on the bottom.
// Frame sizes are in px at full size (tallest is 360px). --scale shrinks the whole row on smaller screens,
// so tablets keep one staggered row and phones get a short 2x2 grid.
// Sticker text uses fixed navy (#023047) because the blob colors don't change at night.

const sizes: { label: BlobWord; size: string; ratio: string; where: string; w: number; h: number; offset: number }[] = [
  { label: { word: "Reels", bg: "bg-red", text: "text-white" }, size: "1080 × 1920", ratio: "9:16", where: "TikTok, Reels, Stories", w: 202.5, h: 360, offset: 40 },
  { label: { word: "Feed", bg: "bg-lime", text: "text-[#023047]" }, size: "1080 × 1350", ratio: "4:5", where: "Facebook and Instagram feed", w: 240, h: 300, offset: 110 },
  { label: { word: "Square", bg: "bg-orange", text: "text-[#023047]" }, size: "1080 × 1080", ratio: "1:1", where: "Any feed", w: 240, h: 240, offset: 0 },
  { label: { word: "YouTube", bg: "bg-teal", text: "text-white" }, size: "1920 × 1080", ratio: "16:9", where: "YouTube and websites", w: 360, h: 202.5, offset: 64 },
];


export function Templates() {
  return (
    <section id="templates" className="px-md py-xl sm:py-[3.4375rem]">
      <div className="mx-auto max-w-[1160px]">
        <SectionHeading
          title={
            <>
              Made for every{" "}
              <span className="inline-flex align-baseline">
                <BlobWords className="" offset={1} pop words={[{ word: "feed", bg: "bg-orange", text: "text-white" }]} />
              </span>
            </>
          }
          sub="One click to pick the size. Your video fits TikTok, Reels, feed posts or YouTube."
        />

        {/* The W brush (the only one on the site) sits behind the frames */}

        <div className="relative isolate">

          <Scribble className="left-1/2 top-1/2 w-[min(960px,100vw)] -translate-x-1/2 -translate-y-1/2" />

        {/* Phones: 2x2 grid, extra top space so the perched mascot clears the sub. sm and up: one staggered row. */}
        <div
          data-reveal-group
          className="mt-[5.5rem] grid grid-cols-2 items-start justify-items-center gap-x-md gap-y-2xl [--scale:0.42] sm:mt-2xl sm:flex sm:justify-center sm:gap-md sm:[--scale:0.52] md:[--scale:0.62] lg:gap-lg lg:[--scale:0.82]"
        >
          {sizes.map((s, i) => (
            <figure
              key={s.size}
              data-reveal="rise"
              className="relative shrink-0 sm:mt-[calc(var(--offset)*var(--scale))]"
              style={{ "--offset": `${s.offset}px` } as React.CSSProperties}
            >
              {i === 0 && (
                // Draft PNG from brand/mascot/, swap for the SVG once it's traced
                <Image
                  src="/wrenn-bird.png"
                  alt=""
                  width={1462}
                  height={1076}
                  sizes="96px"
                  className="absolute -top-16 left-1 w-20 sm:-top-20 sm:w-24 dark:[filter:drop-shadow(0_0_1px_#f3ebdd)_drop-shadow(0_0_1px_#f3ebdd)]"
                />
              )}
              <div className="relative">
                {/* A product frame: white by day, soft cream at night so it doesn't glare. Inside: the ratio and where it fits, styled like the feature cards (fixed colors, the frame stays light at night) */}
                <div
                  className="flex flex-col items-center justify-center gap-[calc(6px*var(--scale))] rounded-md border-2 border-navy/70 bg-white px-sm text-center dark:bg-[#F3EBDD]"
                  style={{ width: `calc(${s.w}px * var(--scale))`, height: `calc(${s.h}px * var(--scale))` }}
                >
                  <span className="font-display text-base leading-tight text-[#023047] sm:text-xl">{s.ratio}</span>
                  <span className="text-[0.75rem] leading-snug text-[#2A4A5A] sm:text-[0.875rem]">{s.where}</span>
                </div>
                <figcaption className="absolute inset-x-0 -bottom-5 flex flex-col items-center">
                  <BlobWords className="text-lg sm:text-xl" offset={i} words={[s.label]} />
                </figcaption>
              </div>
              <p className="mt-lg text-center text-[0.8125rem] text-navy-body">{s.size}</p>
            </figure>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
