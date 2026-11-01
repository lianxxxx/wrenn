import { SectionHeading } from "@/components/section-heading";

// "Tap. Render. Post." with 3 cards fanned like a hand of cards (inspo: Detach).
// Always one row, middle card straight and in front.
// Phone (Detach): side cards tilt outward (-8° / 8°) at staggered heights (left higher,
// right lower), cut off by the screen edge.
// Desktop (Little Bloom): bigger cards, both side cards tilt clockwise (6°), sides higher, middle lower.

const steps = [
  {
    num: "1",
    title: "Pick a template",
    body: "Choose a style, a size for TikTok, Reels or YouTube, and a vibe.",
    className: "bg-sky -rotate-[8deg] -translate-y-sm sm:rotate-[6deg] sm:translate-y-0",
  },
  {
    num: "2",
    title: "Drop your stuff",
    body: "Add your logo, photos or videos, and your brand name.",
    className: "bg-lemon z-10 sm:translate-y-2xl",
  },
  {
    num: "3",
    title: "Hit render",
    body: "Wrenn makes the video with music and saves it to your computer.",
    className: "bg-lime rotate-[8deg] translate-y-xl sm:rotate-[6deg] sm:translate-y-md",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="overflow-hidden px-md py-3xl">
      <SectionHeading
        title="Tap. Render. Post."
        sub="No editing and no timeline. Three steps and your video is ready to post."
      />
      <div className="mt-2xl flex items-stretch justify-center sm:pb-2xl">
        {steps.map((step) => (
          <article
            key={step.num}
            className={`relative w-[210px] shrink-0 rounded-lg px-md py-xl text-center text-navy shadow-[0_10px_30px_rgba(0,0,0,0.08)] -mx-lg sm:w-[280px] sm:px-lg sm:py-2xl lg:w-[330px] lg:-mx-xl ${step.className}`}
          >
            <p className="font-display text-6xl leading-none">{step.num}</p>
            <h3 className="mt-sm font-display text-3xl">{step.title}</h3>
            <p className="mt-sm text-[0.9375rem] leading-relaxed">{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
