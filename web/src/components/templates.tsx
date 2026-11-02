import Image from "next/image";
import { BlobWords, type BlobWord } from "@/components/blob-words";
import { SectionHeading } from "@/components/section-heading";

// "Made for every feed" (inspo: Little Bloom staggered cards).
// Centered headline and sub, then the 4 size presets as frames at staggered heights with sticker labels on the bottom.

const sizes: { label: BlobWord; size: string; aspect: string; offset: string }[] = [
  { label: { word: "Reels", bg: "bg-red", text: "text-white" }, size: "1080 × 1920", aspect: "aspect-[9/16]", offset: "lg:mt-xl" },
  { label: { word: "Feed", bg: "bg-orange", text: "text-navy" }, size: "1080 × 1350", aspect: "aspect-[4/5]", offset: "lg:mt-3xl" },
  { label: { word: "Square", bg: "bg-lime", text: "text-navy" }, size: "1080 × 1080", aspect: "aspect-square", offset: "lg:mt-0" },
  { label: { word: "YouTube", bg: "bg-teal", text: "text-white" }, size: "1920 × 1080", aspect: "aspect-video", offset: "lg:mt-2xl" },
];

export function Templates() {
  return (
    <section id="templates" className="px-md py-3xl">
      <div className="mx-auto max-w-[1160px]">
        <SectionHeading
          title={
            <>
              Made for every{" "}
              <span className="inline-flex align-baseline">
                <BlobWords className="" offset={1} words={[{ word: "feed", bg: "bg-orange", text: "text-white" }]} />
              </span>
            </>
          }
          sub="One click to pick the size. Your video fits TikTok, Reels, feed posts or YouTube."
        />

        <div className="mt-2xl grid grid-cols-2 items-start gap-x-md gap-y-2xl lg:grid-cols-[0.8fr_1fr_1fr_1.5fr]">
          {sizes.map((s, i) => (
            <figure key={s.size} className={`relative ${s.offset}`}>
              {i === 0 && (
                // Draft PNG from brand/mascot/, swap for the SVG once it's traced
                <Image
                  src="/wrenn-bird.png"
                  alt=""
                  width={1462}
                  height={1076}
                  className="absolute -top-16 left-2 w-20 sm:-top-20 sm:w-24 dark:[filter:drop-shadow(0_0_1px_#f3ebdd)_drop-shadow(0_0_1px_#f3ebdd)]"
                />
              )}
              <div className="relative">
                <div className={`rounded-md border-[6px] border-navy bg-white ${s.aspect}`} />
                <figcaption className="absolute inset-x-0 -bottom-5 flex flex-col items-center">
                  <BlobWords className="text-xl" offset={i} words={[s.label]} />
                </figcaption>
              </div>
              <p className="mt-lg text-center text-[0.8125rem] text-navy-body">{s.size}</p>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
