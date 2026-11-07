import Image from "next/image";
import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";

// Navbar: logo on the left, links inside a page-colored cloud that hangs from the
// top, flush with the hero card's right edge (inspo: Little Bloom).
// On phones the links hide and the cloud shrinks to fit the Download button.

export function SiteNav() {
  return (
    <header className="relative z-20 flex w-full items-start justify-between gap-sm pl-md md:pl-2xl">
      <a href="#" className="shrink-0 pt-sm">
        {/* Draft PNG from brand/logo/, swap for the SVG once it's traced */}
        <Image src="/wrenn-logo.png" alt="Wrenn" width={2172} height={724} priority className="h-9 w-auto sm:h-12 dark:[filter:drop-shadow(0_0_1px_#f3ebdd)_drop-shadow(0_0_1px_#f3ebdd)]" />
      </a>

      <nav className="relative isolate">
        {/* Phone: small cloud with 6 uneven bumps, sized for the Download button */}
        <svg
          viewBox="0 0 220 115"
          preserveAspectRatio="none"
          aria-hidden
          className="absolute inset-0 -z-10 h-full w-full text-bg sm:hidden"
        >
          <path
            d="M0 0 H220 V40 A28 28 0 0 1 185 70 A32 32 0 0 1 135 88 A30 30 0 0 1 88 90 A28 28 0 0 1 45 72 A25 25 0 0 1 14 42 A20 20 0 0 1 0 10 Z"
            fill="currentColor"
          />
        </svg>
        {/* Desktop: big cloud hanging from the top, bumps along the bottom */}
        <svg
          viewBox="0 0 600 175"
          preserveAspectRatio="none"
          aria-hidden
          className="absolute inset-0 -z-10 hidden h-full w-full text-bg sm:block"
        >
          <path
            d="M0 0 H600 V70 A75 75 0 0 1 470 110 A85 85 0 0 1 320 125 A80 80 0 0 1 180 110 A72 72 0 0 1 60 70 A55 55 0 0 1 0 0 Z"
            fill="currentColor"
          />
        </svg>
        <div className="relative flex items-center gap-lg pb-[2.75rem] pl-[2.75rem] pr-md pt-md text-navy sm:pb-[4.5rem] sm:pl-[5.5rem] sm:pr-xl sm:pt-lg">
          <NavLinks />
          <ThemeToggle />
          <a
            href="#get-wrenn"
            className="rounded-pill bg-navy px-md py-2 font-display text-lg leading-none text-cream"
          >
            Download
          </a>
        </div>
      </nav>
    </header>
  );
}
