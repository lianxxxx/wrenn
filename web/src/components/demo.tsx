import Image from "next/image";
import { BlobWords } from "@/components/blob-words";
import { SampleVideo } from "@/components/sample-video";
import { SectionHeading } from "@/components/section-heading";

// "From photos to video". Plain page background. Centered headline and sub. Below it (inspo: Little Bloom):
// two staggered frames on the left (your photos with the mascot on top, the finished
// video), and a column of feature rows on the right.

const features = [
  { title: "Music that fits", body: "Beats and sound effects land on every cut." },
  { title: "Your brand, not a template", body: "Your logo, colors and fonts, everywhere." },
  { title: "Readable on mute", body: "Big, clear text for people scrolling with no sound." },
  { title: "Saved on your computer", body: "An MP4 file, ready to post anywhere." },
];

// A product frame: its contents use fixed light colors so it looks the same in both themes.
// Only the surface softens to cream at night so it doesn't glare.
function PhotoStack() {
  return (
    <div className="relative flex aspect-[4/5] w-full items-center justify-center rounded-md border-[6px] border-navy bg-white dark:bg-[#F3EBDD]">
      {/* Placeholder "photos": swap for real sample inputs later */}
      <div className="absolute left-[14%] top-[16%] h-[42%] w-[55%] -rotate-6 rounded-sm bg-sky" />
      <div className="absolute bottom-[16%] right-[14%] h-[42%] w-[55%] rotate-3 rounded-sm bg-lemon" />
      <span className="relative font-display text-xl text-[#023047]">your photos</span>
    </div>
  );
}

export function Demo() {
  return (
    <section id="demo" className="px-md py-xl sm:py-[3.4375rem]">
      <div className="mx-auto max-w-[1160px]">
      <SectionHeading
        title={
          <>
            From photos to{" "}
            <span className="inline-flex align-baseline">
              <BlobWords className="" offset={1} pop words={[{ word: "video", bg: "bg-red", text: "text-white" }]} />
            </span>
          </>
        }
        sub="Drop in a few photos or clips. Wrenn turns them into a video in about a minute."
      />

      <div className="mt-2xl grid gap-2xl lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div className="grid grid-cols-2 items-end gap-md">
          <div className="relative mt-3xl">
            {/* Draft PNG from brand/mascot/, swap for the SVG once it's traced */}
            <Image
              src="/wrenn-bird.png"
              alt=""
              width={1462}
              height={1076}
              className="absolute -top-16 right-2 w-24 sm:-top-20 sm:w-28 dark:[filter:drop-shadow(0_0_1px_#f3ebdd)_drop-shadow(0_0_1px_#f3ebdd)]"
            />
            <PhotoStack />
          </div>
          <SampleVideo className="aspect-[9/16] w-full rounded-md border-[6px] border-navy" />
        </div>

        <ul data-reveal-group className="flex flex-col gap-md">
          {features.map((f) => (
            <li
              key={f.title}
              data-reveal="rise"
              className="rounded-lg border border-navy/15 p-md"
            >
              <h3 className="font-display text-xl text-navy">{f.title}</h3>
              <p className="text-[0.875rem] leading-snug text-navy-body">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
      </div>
    </section>
  );
}
