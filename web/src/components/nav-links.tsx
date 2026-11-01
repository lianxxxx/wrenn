"use client";

import { useState } from "react";

// Nav links with the hand-drawn circle on the active one.
// The circle moves to whichever link was clicked.
// TODO: also follow the scroll position once the other sections exist.

const links = [
  { label: "Home", href: "#" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Templates", href: "#templates" },
];

function HandDrawnCircle() {
  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden
      className="pointer-events-none absolute -inset-x-3 -inset-y-2 h-[calc(100%+1rem)] w-[calc(100%+1.5rem)] overflow-visible"
    >
      <path
        d="M8 22 C6 8, 40 3, 62 5 C86 7, 97 14, 94 24 C90 35, 55 38, 30 35 C10 33, 2 26, 12 15 C18 9, 30 7, 40 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function NavLinks() {
  const [active, setActive] = useState(links[0].href);

  return (
    <ul className="hidden items-center gap-lg sm:flex">
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            onClick={() => setActive(link.href)}
            aria-current={active === link.href ? "page" : undefined}
            className="relative text-[0.9375rem] font-semibold"
          >
            {link.label}
            {active === link.href && <HandDrawnCircle />}
          </a>
        </li>
      ))}
    </ul>
  );
}
