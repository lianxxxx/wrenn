import { BlobWords } from "@/components/blob-words";
import { SectionHeading } from "@/components/section-heading";

// FAQ for non-tech visitors. Uses <details> so it opens and closes with no JavaScript.
// Draft copy: check the Claude answers once Phase 3 confirms how Wrenn runs Claude Code.

const faqs: { q: string; a: string; steps?: string[] }[] = [
  {
    q: "Is Wrenn really free?",
    a: "Wrenn itself is free, with no sign-up and no watermark. But you need a paid Claude plan, because Wrenn uses your own Claude Code to build each video. So the only cost is your Claude plan.",
  },
  {
    q: "How many videos can I make?",
    a: "Wrenn has no limit. Each video uses some of your Claude plan's usage, so how many you can make in a day depends on your Claude plan's limits. If you hit the limit, you can make more once it resets.",
  },
  {
    q: "Do I need to know video editing?",
    a: "No. You pick a template, add your photos or videos, and click Render. Wrenn handles the timing, text, motion and music for you.",
  },
  {
    q: "How do I set up Claude Code?",
    steps: [
      "Get a Claude plan at claude.ai.",
      "Install Claude Code by following Anthropic's guide (Wrenn links to it).",
      "Open Claude Code once and sign in.",
      "Open Wrenn. It finds Claude Code on its own, so you never have to type in a terminal again.",
    ],
    a: "",
  },
  {
    q: "What is ElevenLabs for? Do I need it?",
    a: "No, it's optional. Wrenn already adds music and sound effects for free. ElevenLabs adds a realistic voiceover. If you want it, paste your own ElevenLabs API key in Wrenn's settings. The key stays on your computer, and any voice usage is billed by ElevenLabs on your plan.",
  },
  {
    q: "Are my photos and videos private?",
    a: "Yes. Everything stays on your computer. Wrenn has no servers, so your files and your finished videos never get uploaded anywhere by Wrenn.",
  },
  {
    q: "What sizes can I make?",
    a: "TikTok, Reels and Stories (9:16), Facebook and Instagram feed (4:5), square (1:1), and YouTube or website (16:9).",
  },
  {
    q: "Why a bird?",
    a: "Wrenn's mascot is a wren, a small songbird found mostly in North and South America. The name stuck because \"Wrenn\" sounds like \"render\", which is what it does. The wren isn't from the Philippines, so it got a Filipino touch. Its rainbow tail comes from the Ibong Adarna, the magical bird from Filipino folklore whose song changes its colors.",
  },
  {
    q: "Is there a Mac version?",
    a: "Not yet. Wrenn is Windows only for now.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="px-md py-xl sm:py-[3.4375rem]">
      <SectionHeading
        title={
          <>
            Questions? We got{" "}
            <span className="inline-flex align-baseline">
              <BlobWords className="" offset={1} pop words={[{ word: "you.", bg: "bg-lime", text: "text-white" }]} />
            </span>
          </>
        }
        sub="The quick answers before you hit download."
      />
      {/* One box per question, same corners and border as the cards above. The whole question row is the tap area. */}
      <div data-reveal-group className="mx-auto mt-2xl flex max-w-[760px] flex-col gap-sm">
        {faqs.map((item) => (
          <details key={item.q} data-reveal="rise" className="faq-item group rounded-lg border border-navy/15 px-md text-left sm:px-lg">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-md py-sm font-display text-lg text-navy sm:py-md sm:text-xl [&::-webkit-details-marker]:hidden">
              {item.q}
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className="size-5 shrink-0 text-navy duration-200 group-open:rotate-180 motion-safe:transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            {item.a && <p className="pb-md text-[0.9375rem] leading-relaxed text-navy-body">{item.a}</p>}
            {item.steps && (
              <ol className="list-decimal pb-md space-y-xs pl-lg text-[0.9375rem] leading-relaxed text-navy-body">
                {item.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            )}
          </details>
        ))}
      </div>
    </section>
  );
}
