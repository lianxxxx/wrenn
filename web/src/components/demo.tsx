import Image from "next/image";
import { SampleVideo } from "@/components/sample-video";

// "From photos to video" (inspo: Little Bloom split section).
// Left: headline, then two staggered frames: your photos (lower, mascot on top)
// and the finished video. Right: a column of feature cards.

const features = [
  { title: "Music that fits", body: "Beats and sound effects land on every cut.", dot: "bg-orange" },
  { title: "Your brand, not a template", body: "Your logo, colors and fonts, everywhere.", dot: "bg-lime" },
  { title: "Readable on mute", body: "Big, clear text for people scrolling with no sound.", dot: "bg-red" },
  { title: "Saved on your computer", body: "An MP4 file, ready to post anywhere.", dot: "bg-teal" },
];

function PhotoStack() {
  return (
    <div className="relative flex aspect-[4/5] w-full items-center justify-center rounded-md border-[6px] border-navy bg-white">
      {/* Placeholder "photos": swap for real sample inputs later */}
      <div className="absolute left-[14%] top-[16%] h-[42%] w-[55%] -rotate-6 rounded-sm bg-sky" />
      <div className="absolute bottom-[16%] right-[14%] h-[42%] w-[55%] rotate-3 rounded-sm bg-lemon" />
      <span className="relative font-display text-xl text-navy">your photos</span>
    </div>
  );
}

export function Demo() {
  return (
    <section id="demo" className="mx-auto max-w-[1160px] px-md py-3xl">
      <div className="grid gap-2xl lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div>
          <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] leading-[1.05] text-navy">
            From photos
            <br />
            to video
          </h2>
          <p className="mt-sm max-w-[26rem] text-[1.0625rem] leading-relaxed text-navy-body">
            Drop in a few photos or clips. Wrenn turns them into a video in about a minute.
          </p>

          <div className="mt-xl grid grid-cols-2 items-end gap-md">
            <div className="relative mt-3xl">
              {/* Draft PNG from brand/mascot/, swap for the SVG once it's traced */}
              <Image
                src="/wrenn-bird.png"
                alt=""
                width={1462}
                height={1076}
                className="absolute -top-16 right-2 w-24 sm:-top-20 sm:w-28"
              />
              <PhotoStack />
            </div>
            <SampleVideo className="aspect-[9/16] w-full rounded-md border-[6px] border-navy" />
          </div>
        </div>

        <ul className="flex flex-col gap-md lg:pt-3xl">
          {features.map((f) => (
            <li
              key={f.title}
              className="flex items-center gap-md rounded-md bg-white p-md shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
            >
              <span className={`size-12 shrink-0 rounded-full ${f.dot}`} aria-hidden />
              <div>
                <h3 className="font-display text-xl text-navy">{f.title}</h3>
                <p className="text-[0.875rem] leading-snug text-navy-body">{f.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
