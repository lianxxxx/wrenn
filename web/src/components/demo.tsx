import Image from "next/image";
import { BlobWords } from "@/components/blob-words";
import { DeviceVideo } from "@/components/device-frames";
import { SectionHeading } from "@/components/section-heading";

// "From photos to video". Plain page background. Centered headline and sub. Below it (inspo: Little Bloom):
// a phone playing a Reels video Wrenn made (G-Track sample; the mascot sits on it)
// and a laptop playing a YouTube-size one (Trackr sample), and a column of feature rows on the right.

// Blob corners like the marker highlights in blob-words.tsx, a different one per card
const BLOB_RADII = [
  "45% 38% 42% 40% / 50% 46% 54% 50%",
  "38% 45% 40% 42% / 46% 54% 48% 52%",
  "42% 40% 46% 38% / 54% 48% 50% 46%",
  "40% 42% 38% 45% / 48% 52% 46% 54%",
];

// Simple line icons drawn here (no icon package). 24x24, stroke uses the text color.
const icons = {
  music: <path d="M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm11-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />,
  brand: <path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.4-4-8-9-8zM7.5 12.5h.01M10.5 8h.01M15.5 8.5h.01" />,
  mute: <path d="M4 6h16M4 12h10M4 18h7M17 15l4 4m0-4-4 4" />,
  saved: <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />,
};

const features: { title: string; body: string; icon: keyof typeof icons; bg: string; ink: string }[] = [
  { title: "Music that fits", body: "Beats and sound effects land on every cut.", icon: "music", bg: "bg-red", ink: "text-white" },
  { title: "Your brand, not a template", body: "Your logo, colors and fonts, everywhere.", icon: "brand", bg: "bg-orange", ink: "text-[#023047]" },
  { title: "Readable on mute", body: "Big, clear text for people scrolling with no sound.", icon: "mute", bg: "bg-lime", ink: "text-[#023047]" },
  { title: "Saved on your computer", body: "An MP4 file, ready to post anywhere.", icon: "saved", bg: "bg-teal", ink: "text-white" },
];

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

      <div className="mt-2xl grid gap-2xl lg:grid-cols-[1.7fr_1fr] lg:items-center">
        <div className="flex items-end gap-md sm:gap-lg">
          <div className="relative w-[28%] shrink-0">
            {/* Draft PNG from brand/mascot/, swap for the SVG once it's traced */}
            <Image
              src="/wrenn-bird.png"
              alt=""
              width={1462}
              height={1076}
              sizes="112px"
              className="absolute -top-12 right-0 z-10 w-16 sm:-top-16 sm:w-24 dark:[filter:drop-shadow(0_0_1px_#f3ebdd)_drop-shadow(0_0_1px_#f3ebdd)]"
            />
            <DeviceVideo name="gtrack-phone" label="The video Wrenn made for G-Track" width={390} height={800} />
          </div>
          <DeviceVideo
            name="trackr-laptop"
            label="The video Wrenn made for Trackr"
            width={800}
            height={485}
            className="mb-[2%] min-w-0 flex-1"
          />
        </div>

        <ul data-reveal-group className="flex flex-col gap-md">
          {features.map((f, i) => (
            <li
              key={f.title}
              data-reveal="rise"
              className="flex items-center gap-md rounded-lg border border-navy/15 p-md"
            >
              {/* Icon on a marker blob, the same hand-painted shape as the headline highlights */}
              <span className={`relative isolate grid size-11 shrink-0 place-items-center ${f.ink}`}>
                <span
                  aria-hidden
                  className={`absolute inset-0 -z-10 ${f.bg}`}
                  style={{ borderRadius: BLOB_RADII[i % BLOB_RADII.length], filter: `url(#marker-${i % 4})` }}
                />
                <svg viewBox="0 0 24 24" aria-hidden className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {icons[f.icon]}
                </svg>
              </span>
              <div>
                <h3 className="font-display text-xl leading-tight text-navy">{f.title}</h3>
                <p className="text-[0.875rem] leading-snug text-navy-body">{f.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      </div>
    </section>
  );
}
