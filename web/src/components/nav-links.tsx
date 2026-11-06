"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Nav links with the hand-drawn circle on the active one.
// On page load the circle draws itself around "Home" as the last beat of the hero
// entrance. After that it just moves to whichever link was clicked, no redraw
// (the nav isn't sticky, so a draw after a click would play off-screen).
// TODO: also follow the scroll position once the other sections exist.

const links = [
  { label: "Home", href: "#" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Sizes", href: "#templates" },
];

// Drawn in a 100 x 40 box, then stretched to fit each link
const CIRCLE_PATH =
  "M8 22 C6 8, 40 3, 62 5 C86 7, 97 14, 94 24 C90 35, 55 38, 30 35 C10 33, 2 26, 12 15 C18 9, 30 7, 40 6";

// When the draw starts, counted from page load (the hero entrance ends around here)
const DRAW_START_MS = 700;

// The path is all x,y pairs, so scale every other number by x, the rest by y
function scalePath(sx: number, sy: number) {
  let i = 0;
  return CIRCLE_PATH.replace(/\d+(\.\d+)?/g, (n) => (Number(n) * (i++ % 2 === 0 ? sx : sy)).toFixed(1));
}

function HandDrawnCircle({ intro }: { intro: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [length, setLength] = useState<number | null>(null);
  // Decided once, on the first measure: draw in, or just show (nav already scrolled away)
  const [drawDelay, setDrawDelay] = useState<number | null>(null);

  // The draw-in animation needs the path in real pixels: a stretched viewBox with a
  // non-scaling stroke makes dash lengths unreliable across browsers.
  useLayoutEffect(() => {
    const svg = svgRef.current;
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

  // Real pixel length of the stretched path, for the dash
  useLayoutEffect(() => {
    if (!size || !pathRef.current) return;
    setLength(pathRef.current.getTotalLength());
    if (intro && drawDelay === null) {
      const onScreen = svgRef.current!.getBoundingClientRect().bottom > 0;
      // -1 = skip the draw and just show the circle
      setDrawDelay(onScreen ? Math.max(0, DRAW_START_MS - performance.now()) : -1);
    }
  }, [size, intro, drawDelay]);

  const drawing = intro && length !== null && drawDelay !== null && drawDelay >= 0;
  // Before measuring, the intro circle stays hidden (globals.css) so it doesn't blink out
  const className = drawing ? "draw-in" : intro && drawDelay === null ? "circle-intro" : undefined;

  return (
    <svg
      ref={svgRef}
      viewBox={size ? `0 0 ${size.w} ${size.h}` : "0 0 100 40"}
      preserveAspectRatio="none"
      aria-hidden
      className="pointer-events-none absolute -inset-x-3 -inset-y-2 h-[calc(100%+1rem)] w-[calc(100%+1.5rem)] overflow-visible"
    >
      <path
        ref={pathRef}
        d={size ? scalePath(size.w / 100, size.h / 40) : CIRCLE_PATH}
        className={className}
        style={
          drawing
            ? ({
                // One dash as long as the path, with a gap a bit longer, so at the start
                // no piece of the dash (or its round cap) shows anywhere on the path
                "--draw-dash": `${length}px ${length + 8}px`,
                "--draw-from": `${length + 4}px`,
                animationDelay: `${drawDelay}ms`,
              } as React.CSSProperties)
            : undefined
        }
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
  // Only the circle on the first active link draws in, once, on page load
  const [intro, setIntro] = useState(true);

  return (
    <ul className="hidden items-center gap-lg sm:flex">
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            onClick={() => {
              if (link.href === active) return;
              setActive(link.href);
              setIntro(false);
            }}
            aria-current={active === link.href ? "page" : undefined}
            className="relative text-[0.9375rem] font-semibold"
          >
            {link.label}
            {active === link.href && <HandDrawnCircle intro={intro} />}
          </a>
        </li>
      ))}
    </ul>
  );
}
