"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Nav links with the hand-drawn circle on the active one.
// The circle moves to whichever link was clicked, and draws itself in when it does.
// TODO: also follow the scroll position once the other sections exist.

const links = [
  { label: "Home", href: "#" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Templates", href: "#templates" },
];

// Drawn in a 100 x 40 box, then stretched to fit each link
const CIRCLE_PATH =
  "M8 22 C6 8, 40 3, 62 5 C86 7, 97 14, 94 24 C90 35, 55 38, 30 35 C10 33, 2 26, 12 15 C18 9, 30 7, 40 6";

// The path is all x,y pairs, so scale every other number by x, the rest by y
function scalePath(sx: number, sy: number) {
  let i = 0;
  return CIRCLE_PATH.replace(/\d+(\.\d+)?/g, (n) => (Number(n) * (i++ % 2 === 0 ? sx : sy)).toFixed(1));
}

function HandDrawnCircle({ draw }: { draw: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  // The draw-in animation needs the path in real pixels: a stretched viewBox with a
  // non-scaling stroke makes dash lengths unreliable across browsers.
  useLayoutEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const measure = () => {
      const { width, height } = svg.getBoundingClientRect();
      if (width && height) setSize({ w: width, h: height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox={size ? `0 0 ${size.w} ${size.h}` : "0 0 100 40"}
      preserveAspectRatio="none"
      aria-hidden
      className="pointer-events-none absolute -inset-x-3 -inset-y-2 h-[calc(100%+1rem)] w-[calc(100%+1.5rem)] overflow-visible"
    >
      <path
        d={size ? scalePath(size.w / 100, size.h / 40) : CIRCLE_PATH}
        pathLength={size ? 1 : undefined}
        className={size && draw ? "draw-in" : undefined}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        // Only needed before measuring (server HTML), while the box is still stretched
        vectorEffect={size ? undefined : "non-scaling-stroke"}
      />
    </svg>
  );
}

export function NavLinks() {
  const [active, setActive] = useState(links[0].href);
  // The first circle is already there on load; only circles moved by a click draw in
  const [clicked, setClicked] = useState(false);

  return (
    <ul className="hidden items-center gap-lg sm:flex">
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            onClick={() => {
              if (link.href === active) return;
              setActive(link.href);
              setClicked(true);
            }}
            aria-current={active === link.href ? "page" : undefined}
            className="relative text-[0.9375rem] font-semibold"
          >
            {link.label}
            {active === link.href && <HandDrawnCircle draw={clicked} />}
          </a>
        </li>
      ))}
    </ul>
  );
}
