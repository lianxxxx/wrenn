import Image from "next/image";
import Link from "next/link";
import { FooterCloud } from "@/components/footer-cloud";
import { Stars } from "@/components/stars";
import { Cloud } from "@/components/hero";
import { ISSUES_URL, REPO_URL } from "@/lib/links";

// Footer: one big sky-soft cloud (FooterCloud) with white clouds, logo and link columns.
// The copyright line sits below it, on the page background.

const columns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Sizes", href: "#templates" },
      { label: "FAQ", href: "#faq" },
      { label: "Download", href: "#get-wrenn" },
    ],
  },
  {
    title: "More",
    // These work once the repo is public (see ROADMAP Phase 7)
    links: [
      { label: "GitHub", href: REPO_URL },
      { label: "Report a problem", href: ISSUES_URL },
      { label: "Privacy", href: "/privacy" },
      { label: "Credits", href: "/credits" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer>
    {/* Top margin matches the gap between sections (the CTA above adds the same again as bottom padding) */}
    <div className="relative isolate mx-sm mt-xl px-12 py-24 text-navy sm:mx-md sm:mt-[3.4375rem] sm:px-[9%] sm:py-32">
      {/* One continuous cloud outline: round bumps on all four sides */}
      <FooterCloud className="absolute inset-0 -z-10" />
      {/* Footer layout keeps the stars in the cloud's bumps, away from the text */}
      <Stars layout="footer" className="inset-0 -z-[5]" />
      <Cloud className="right-[12%] top-[22%] hidden w-28 sm:block" />
      <Cloud className="left-[44%] top-[30%] hidden w-16 opacity-60 md:block" />
      <div className="mx-auto grid max-w-[1160px] gap-xl sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Image src="/wrenn-logo.png" alt="Wrenn" width={2172} height={724} sizes="144px" className="h-12 w-auto dark:[filter:drop-shadow(0_0_1px_#f3ebdd)_drop-shadow(0_0_1px_#f3ebdd)]" />
          <p className="mt-sm max-w-[22rem] text-[0.9375rem] leading-relaxed text-navy-body">
            No prompts. Just render. A free app that turns your photos and videos into videos you can post.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-body">{col.title}</p>
            {/* Each link is at least 24px tall (WCAG tap size); the padding replaces the old gap */}
            <ul className="mt-sm flex flex-col">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="inline-block py-[3px] text-[0.9375rem] text-navy hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    {/* Copyright sits outside the cloud, on the page background */}
    <p className="mt-sm pb-lg text-center text-[0.8125rem] text-navy-body">© 2026 Wrenn</p>
    </footer>
  );
}
