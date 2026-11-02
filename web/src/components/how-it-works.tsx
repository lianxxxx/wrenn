import Image from "next/image";
import { BlobWords } from "@/components/blob-words";
import { SectionHeading } from "@/components/section-heading";
import { StepCarousel } from "@/components/step-carousel";

// "Tap. Render. Post." with 3 cards fanned like a hand of cards (inspo: Detach).
// Phone (Detach): swipeable fan in StepCarousel, side cards cut off by the screen edge.
// Desktop (Little Bloom): bigger cards, both side cards tilt clockwise (6°), sides higher, middle lower and in front.

const steps = [
  {
    num: "1",
    title: "Pick a template",
    image: { src: "/steps/pick.png", width: 1448, height: 1086 },
    body: "Choose a style, a size for TikTok, Reels or YouTube, and a vibe.",
    className: "rotate-[6deg]",
  },
  {
    num: "2",
    title: "Drop your stuff",
    image: { src: "/steps/drop.png", width: 1448, height: 1086 },
    body: "Add your logo, photos or videos, and your brand name.",
    className: "z-10 translate-y-2xl",
  },
  {
    num: "3",
    title: "Hit render",
    image: { src: "/steps/render.png", width: 1558, height: 1010 },
    body: "Wrenn makes the video with music and saves it to your computer.",
    className: "rotate-[6deg] translate-y-md",
  },
];

function StepCard({ step, className = "" }: { step: (typeof steps)[number]; className?: string }) {
  return (
    <article
      className={`relative shrink-0 rounded-lg border border-navy/15 bg-bg text-center text-navy ${className}`}
    >
      <Image {...step.image} alt="" className="mx-auto h-28 w-auto object-contain mix-blend-multiply sm:h-36 dark:rounded-md dark:bg-white dark:mix-blend-normal dark:p-1" />
      <h3 className="mt-md font-display text-3xl">
        {step.num}. {step.title}
      </h3>
      <p className="mt-sm text-[0.9375rem] leading-relaxed">{step.body}</p>
    </article>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="overflow-hidden px-md py-3xl">
      <SectionHeading
        title={
          <>
            Tap. Render.{" "}
            <span className="inline-flex align-baseline">
              <BlobWords className="" offset={1} words={[{ word: "Post.", bg: "bg-lemon", text: "text-white" }]} />
            </span>
          </>
        }
        sub="No editing and no timeline. Three steps and your video is ready to post."
      />
      <StepCarousel>
        {steps.map((step) => (
          <StepCard key={step.num} step={step} className="h-full w-[240px] px-md py-xl" />
        ))}
      </StepCarousel>

      <div className="mt-2xl hidden items-stretch justify-center gap-md pb-2xl sm:flex">
        {steps.map((step) => (
          <StepCard
            key={step.num}
            step={step}
            className={`w-[220px] px-md py-xl lg:w-[300px] lg:px-lg ${step.className}`}
          />
        ))}
      </div>
    </section>
  );
}
