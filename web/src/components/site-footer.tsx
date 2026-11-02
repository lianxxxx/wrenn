import Image from "next/image";
import Link from "next/link";
import { FooterCloud } from "@/components/footer-cloud";
import { Stars } from "@/components/stars";
import { Cloud } from "@/components/hero";

// Footer: one big sky-soft cloud (FooterCloud) with white clouds, logo and link columns.
// The copyright line sits below it, on the page background.

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
    title: "More",
    // GitHub and Report a problem stay "#" until the repo is public (see ROADMAP Phase 7)
    links: [
      { label: "GitHub", href: "#" },
      { label: "Report a problem", href: "#" },
      { label: "Privacy", href: "/privacy" },
      { label: "Credits", href: "/credits" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer>
    <div className="relative isolate mx-sm mt-3xl px-12 py-24 text-navy sm:mx-md sm:px-[9%] sm:py-32">
      {/* One continuous cloud outline: round bumps on all four sides */}
      <FooterCloud className="absolute inset-0 -z-10" />
      <Stars className="inset-[12%] -z-[5]" />
      <Cloud className="right-[12%] top-[22%] hidden w-28 sm:block" />
      <Cloud className="left-[44%] top-[30%] hidden w-16 opacity-60 md:block" />
      <div className="mx-auto grid max-w-[1160px] gap-xl sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Image src="/wrenn-logo.png" alt="Wrenn" width={2172} height={724} className="h-12 w-auto dark:[filter:drop-shadow(0_0_1px_#f3ebdd)_drop-shadow(0_0_1px_#f3ebdd)]" />
          <p className="mt-sm max-w-[22rem] text-[0.9375rem] leading-relaxed text-navy-body">
            No prompts. Just render. A free app that turns your photos and videos into videos you can post.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-body">{col.title}</p>
            <ul className="mt-sm flex flex-col gap-xs">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[0.9375rem] text-navy hover:underline">
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
