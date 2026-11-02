// Throwaway: compares color sets for the How it works cards. Delete once Lian picks.

import Image from "next/image";

const steps = [
  { title: "1. Pick a template", image: { src: "/steps/pick.png", width: 1448, height: 1086 } },
  { title: "2. Drop your stuff", image: { src: "/steps/drop.png", width: 1448, height: 1086 } },
  { title: "3. Hit render", image: { src: "/steps/render.png", width: 1558, height: 1010 } },
];

const sets: { label: string; cards: string[] }[] = [
  { label: "A. Soft tints: sky-soft, lemon-soft, lime-soft (current)", cards: ["bg-sky-soft", "bg-lemon-soft", "bg-lime-soft"] },
  { label: "B. Full color: sky, lemon, lime", cards: ["bg-sky", "bg-lemon", "bg-lime"] },
  { label: "C. Full color: orange, lemon, sky", cards: ["bg-orange", "bg-lemon", "bg-sky"] },
  { label: "D. Full color: sky, orange, lime", cards: ["bg-sky", "bg-orange", "bg-lime"] },
  { label: "E. Soft + one full: sky-soft, lemon, lime-soft", cards: ["bg-sky-soft", "bg-lemon", "bg-lime-soft"] },
  { label: "F. All one color: lemon-soft", cards: ["bg-lemon-soft", "bg-lemon-soft", "bg-lemon-soft"] },
  { label: "G. All one color: sky-soft", cards: ["bg-sky-soft", "bg-sky-soft", "bg-sky-soft"] },
  { label: "H. All cream", cards: ["bg-cream", "bg-cream", "bg-cream"] },
];

export default function CardColors() {
  return (
    <main className="mx-auto flex w-full max-w-[1000px] flex-col gap-2xl p-md">
      <h1 className="text-sm font-bold">How it works cards: pick a color set</h1>
      {sets.map((set) => (
        <section key={set.label}>
          <p className="mb-sm text-sm font-semibold text-navy-body">{set.label}</p>
          <div className="grid grid-cols-3 gap-sm sm:gap-md">
            {steps.map((step, i) => (
              <article
                key={step.title}
                className={`rounded-lg p-sm text-center text-navy shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:p-lg ${set.cards[i]}`}
              >
                <Image {...step.image} alt="" className="mx-auto h-16 w-auto object-contain mix-blend-multiply sm:h-32" />
                <h3 className="mt-sm font-display text-base sm:text-2xl">{step.title}</h3>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
