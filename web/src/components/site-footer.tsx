import Image from "next/image";
import { CloudEdge } from "@/components/cloud-edge";

// Footer (inspo: Little Bloom): navy, round cloud bumps rising from the top, link columns,
// and a giant "wrenn" wordmark with the mascot perched on the letters.

const columns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Templates", href: "#templates" },
      { label: "FAQ", href: "#faq" },
      { label: "Download", href: "#get-wrenn" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "GitHub", href: "#" },
      { label: "Credits", href: "#" },
      { label: "License (MIT)", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-3xl bg-navy px-md pt-2xl text-cream md:px-2xl">
      <CloudEdge className="absolute inset-x-0 bottom-[calc(100%-1px)] h-14 text-navy sm:h-20" />
      <div className="mx-auto grid max-w-[1160px] gap-xl sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl">wrenn</p>
          <p className="mt-sm max-w-[22rem] text-[0.9375rem] leading-relaxed text-cream/80">
            No prompts. Just render. A free app that turns your photos and videos into videos you can post.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold uppercase tracking-wider text-cream/60">{col.title}</p>
            <ul className="mt-sm flex flex-col gap-xs">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-[0.9375rem] text-cream/90 hover:text-cream">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative mx-auto mt-2xl max-w-[1160px] text-center">
        <p className="font-display text-[clamp(7rem,28vw,24rem)] leading-[0.78] text-lemon">wrenn</p>
        {/* Draft PNG from brand/mascot/, swap for the SVG once it's traced */}
        <Image
          src="/wrenn-bird.png"
          alt=""
          width={1462}
          height={1076}
          className="absolute right-[8%] top-0 w-[clamp(4.5rem,14vw,11rem)] -translate-y-[70%]"
        />
      </div>
    </footer>
  );
}
