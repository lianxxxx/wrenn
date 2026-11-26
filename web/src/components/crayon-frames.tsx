import Image from "next/image";
import { BlobWords, type BlobWord } from "@/components/blob-words";

// "Made for every feed": the 4 sizes as hand-drawn crayon frames, slightly tilted,
// like sketches on paper. The rough line comes from an SVG noise filter (like the marker
// highlights), drawn twice (a bold pass and a faint offset pass) so it reads as a crayon.
// The line and text use the theme's navy, so they turn cream at night. Hover (or tap) a frame and
// a real Wrenn video still (G-Track sample) fills it, cropped to that size.
// Frame sizes are in px at full size; --scale shrinks the row on smaller screens.

const sizes: { label: BlobWord; size: string; ratio: string; where: string; w: number; h: number; offset: number; tilt: number }[] = [
  { label: { word: "Reels", bg: "bg-red", text: "text-white" }, size: "1080 × 1920", ratio: "9:16", where: "TikTok, Reels, Stories", w: 202.5, h: 360, offset: 40, tilt: -3 },
  { label: { word: "Feed", bg: "bg-lime", text: "text-[#023047]" }, size: "1080 × 1350", ratio: "4:5", where: "Facebook and Instagram feed", w: 240, h: 300, offset: 110, tilt: 2 },
  { label: { word: "Square", bg: "bg-orange", text: "text-[#023047]" }, size: "1080 × 1080", ratio: "1:1", where: "Any feed", w: 240, h: 240, offset: 0, tilt: -2 },
  { label: { word: "YouTube", bg: "bg-teal", text: "text-white" }, size: "1920 × 1080", ratio: "16:9", where: "YouTube and websites", w: 360, h: 202.5, offset: 64, tilt: 3 },
];

export function CrayonFrames() {
  return (
    <>
      {/* The crayon roughness, one filter for all 4 frames */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="crayon" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
        </filter>
      </svg>

      {/* Phones: 2x2 grid. sm and up: one staggered row. */}
      <div
        data-reveal-group
        className="grid grid-cols-2 items-start justify-items-center gap-x-md gap-y-2xl [--scale:0.42] sm:flex sm:justify-center sm:gap-lg sm:[--scale:0.52] md:[--scale:0.62] lg:gap-xl lg:[--scale:0.82]"
      >
        {sizes.map((s, i) => (
          // tabIndex: a tap (phones) or Tab key focuses the frame, which shows the picture like a hover
          <figure
            key={s.size}
            data-reveal="rise"
            tabIndex={0}
            className="group relative shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-teal sm:mt-[calc(var(--offset)*var(--scale))]"
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
                className="absolute -top-16 left-1 z-10 w-20 sm:-top-20 sm:w-24 dark:[filter:drop-shadow(0_0_1px_#f3ebdd)_drop-shadow(0_0_1px_#f3ebdd)]"
              />
            )}
            <div className="relative">
              <div
                className="relative grid place-items-center text-navy"
                style={{
                  width: `calc(${s.w}px * var(--scale))`,
                  height: `calc(${s.h}px * var(--scale))`,
                  transform: `rotate(${s.tilt}deg)`,
                }}
              >
                {/* On hover or tap: the same moment from a real Wrenn video (G-Track sample) fills the frame */}
                <div className="absolute inset-[5px] overflow-hidden rounded-[13px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100">
                  <Image
                    src="/demo/gtrack-scene.jpg"
                    alt={`A G-Track video Wrenn made, in ${s.label.word} size`}
                    fill
                    sizes="(min-width: 1024px) 300px, 40vw"
                    className="object-cover object-[50%_28%] motion-safe:scale-105 motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-100 motion-safe:group-focus:scale-100"
                  />
                </div>
                {/* The crayon line: a bold pass and a faint offset pass, both roughened */}
                <div aria-hidden className="absolute inset-[3px] rounded-[16px] border-4 border-current" style={{ filter: "url(#crayon)" }} />
                <div aria-hidden className="absolute inset-[5px] translate-y-px rounded-[18px] border-[1.5px] border-current opacity-45" style={{ filter: "url(#crayon)" }} />
                <div className="relative flex flex-col items-center gap-[calc(6px*var(--scale))] px-sm text-center transition-opacity duration-200 group-hover:opacity-0 group-focus:opacity-0">
                  <span className="font-display text-base leading-tight sm:text-xl">{s.ratio}</span>
                  <span className="text-[0.75rem] leading-snug text-navy-body sm:text-[0.875rem]">{s.where}</span>
                </div>
              </div>
              <figcaption className="absolute inset-x-0 -bottom-5 flex flex-col items-center">
                <BlobWords className="text-lg sm:text-xl" offset={i} words={[s.label]} />
              </figcaption>
            </div>
            <p className="mt-lg text-center text-[0.8125rem] text-navy-body">{s.size}</p>
          </figure>
        ))}
      </div>
    </>
  );
}
