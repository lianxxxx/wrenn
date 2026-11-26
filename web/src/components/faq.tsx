import { BlobWords } from "@/components/blob-words";
import { IconBlob } from "@/components/icon-blob";
import { SectionHeading } from "@/components/section-heading";

// FAQ for non-tech visitors (inspo: Untitled UI FAQ grid). Every answer is shown, no clicking:
// two columns on bigger screens, one on phones, each question with an icon on a marker blob.
// Draft copy: check the Claude answers once Phase 3 confirms how Wrenn runs Claude Code.

// Simple line icons (24x24), in the same order as the questions below
const icons = [
  // Free: a tag
  <path key="free" d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9zM7.5 7.5h.01" />,
  // How many: stacked layers
  <path key="many" d="M12 3 3 8l9 5 9-5-9-5zM3 13l9 5 9-5" />,
  // Editing: scissors
  <path key="edit" d="M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.1 7.9 20 20M8.1 16.1 20 4" />,
  // Set up: a terminal
  <path key="setup" d="M4 5h16v14H4zM8 10l2 2-2 2M12 14h4" />,
  // ElevenLabs voice: a microphone
  <path key="voice" d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />,
  // Private: a lock
  <path key="private" d="M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4" />,
  // Sizes: two frames
  <path key="sizes" d="M3 7h8v14H3zM14 4h7v7h-7zM14 15h7v6h-7z" />,
  // Bird: a music note
  <path key="bird" d="M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm11-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />,
  // What you need: a checklist
  <path key="needs" d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" />,
  // Mac: a laptop
  <path key="mac" d="M5 5h14v10H5zM2 19h20" />,
];

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
    q: "What do I need to run it?",
    a: "A Windows 10 or 11 computer (64-bit), Claude Code signed in to a paid Claude plan, and an internet connection while a video is being made, since Claude Code works online. ElevenLabs is optional.",
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
      <ul data-reveal-group className="mx-auto mt-2xl grid max-w-[1000px] gap-x-2xl gap-y-xl text-left md:grid-cols-2">
        {faqs.map((item, i) => (
          <li key={item.q} data-reveal="rise" className="flex items-start gap-md">
            <IconBlob icon={icons[i]} index={i} />
            <div>
              <h3 className="font-display text-xl leading-tight text-navy">{item.q}</h3>
              {item.a && <p className="mt-xs text-[0.9375rem] leading-relaxed text-navy-body">{item.a}</p>}
              {item.steps && (
                <ol className="mt-xs list-decimal space-y-xs pl-lg text-[0.9375rem] leading-relaxed text-navy-body">
                  {item.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
