// Night-sky stars for the hero and footer. Only visible in dark mode.
// Fixed positions (not random) so the page looks the same on every load.

// "only" limits a star to phones ("phone") or to sm and up ("wide"). Leave it out to show it everywhere.
type Star = { left: string; top: string; size: number; dim?: boolean; only?: "phone" | "wide" };

const SKY_STARS: Star[] = [
  { left: "6%", top: "14%", size: 3, dim: false },
  { left: "14%", top: "38%", size: 2, dim: true },
  { left: "22%", top: "8%", size: 2, dim: false },
  { left: "9%", top: "62%", size: 3, dim: true },
  { left: "30%", top: "24%", size: 2, dim: true },
  { left: "18%", top: "82%", size: 2, dim: false },
  { left: "38%", top: "6%", size: 3, dim: false },
  { left: "62%", top: "10%", size: 2, dim: true },
  { left: "70%", top: "30%", size: 3, dim: false },
  { left: "78%", top: "12%", size: 2, dim: false },
  { left: "86%", top: "44%", size: 2, dim: true },
  { left: "92%", top: "20%", size: 3, dim: false },
  { left: "82%", top: "70%", size: 2, dim: false },
  { left: "94%", top: "84%", size: 2, dim: true },
  { left: "66%", top: "58%", size: 2, dim: true },
  { left: "48%", top: "90%", size: 2, dim: true },
];

// A few bigger four-point sparkles, like the hand-drawn pop lines
const SKY_SPARKLES: Star[] = [
  { left: "12%", top: "22%", size: 14 },
  { left: "88%", top: "32%", size: 12 },
  { left: "74%", top: "78%", size: 10 },
];

// Footer: stars sit only in the cloud's bumps and edges, never over the logo or link columns.
// Positions are % of the whole footer cloud box (FooterCloud shape: wide on sm+, tall on phones).
const FOOTER_STARS: Star[] = [
  // Wide: top bumps
  { left: "13%", top: "19%", size: 3, only: "wide" },
  { left: "26%", top: "9%", size: 2, dim: true, only: "wide" },
  { left: "58%", top: "8%", size: 2, dim: true, only: "wide" },
  { left: "74%", top: "12%", size: 2, only: "wide" },
  { left: "87%", top: "19%", size: 3, dim: true, only: "wide" },
  // Wide: bottom bumps
  { left: "12%", top: "81%", size: 2, dim: true, only: "wide" },
  { left: "26%", top: "89%", size: 3, only: "wide" },
  { left: "42%", top: "91%", size: 2, dim: true, only: "wide" },
  { left: "74%", top: "88%", size: 2, only: "wide" },
  // Wide: side bumps
  { left: "4%", top: "48%", size: 2, only: "wide" },
  { left: "95%", top: "52%", size: 2, dim: true, only: "wide" },
  // Phone: side bumps, outside the stacked text
  { left: "6%", top: "28%", size: 3, only: "phone" },
  { left: "8%", top: "55%", size: 2, dim: true, only: "phone" },
  { left: "11%", top: "77%", size: 2, only: "phone" },
  { left: "92%", top: "30%", size: 2, dim: true, only: "phone" },
  { left: "93%", top: "62%", size: 3, only: "phone" },
  { left: "89%", top: "78%", size: 2, dim: true, only: "phone" },
];

const FOOTER_SPARKLES: Star[] = [
  { left: "41%", top: "7%", size: 14, only: "wide" },
  { left: "57%", top: "85%", size: 12, only: "wide" },
  { left: "86%", top: "79%", size: 10, only: "wide" },
  { left: "88%", top: "50%", size: 10, only: "phone" },
];

const LAYOUTS = {
  sky: { stars: SKY_STARS, sparkles: SKY_SPARKLES },
  footer: { stars: FOOTER_STARS, sparkles: FOOTER_SPARKLES },
};

function onlyClass(only: Star["only"]) {
  if (only === "phone") return "sm:hidden";
  if (only === "wide") return "hidden sm:block";
  return "";
}

// className sets where the stars sit (default: fill the parent, behind the content).
// layout picks the star positions: "sky" (hero) or "footer" (kept out of the text columns).
export function Stars({
  className = "inset-0 -z-10",
  layout = "sky",
}: {
  className?: string;
  layout?: keyof typeof LAYOUTS;
}) {
  const { stars, sparkles } = LAYOUTS[layout];
  return (
    <div aria-hidden className={`pointer-events-none absolute hidden dark:block ${className}`}>
      {stars.map((s, i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-[#fff8ec] ${s.dim ? "opacity-50" : "opacity-90"} ${onlyClass(s.only)}`}
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
        />
      ))}
      {sparkles.map((s, i) => (
        <svg
          key={`sparkle-${i}`}
          viewBox="0 0 24 24"
          className={`absolute text-lemon ${onlyClass(s.only)}`}
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
        >
          <path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
