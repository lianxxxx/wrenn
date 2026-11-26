import { BlobWords } from "@/components/blob-words";
import { CrayonFrames } from "@/components/crayon-frames";
import { Scribble } from "@/components/scribble";
import { SectionHeading } from "@/components/section-heading";

// "Made for every feed": headline and sub, then the 4 sizes as crayon frames that show a real video still on hover (crayon-frames.tsx).

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

        {/* The W brush (the only one on the site) sits behind the frame */}
        <div className="relative isolate mt-[4.5rem] sm:mt-[5.5rem]">
          <Scribble className="left-1/2 top-1/2 w-[min(960px,100vw)] -translate-x-1/2 -translate-y-1/2" />
          <CrayonFrames />
        </div>
      </div>
    </section>
  );
}
