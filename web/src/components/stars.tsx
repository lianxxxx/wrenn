// Night-sky stars for the hero and footer. Only visible in dark mode.
// Fixed positions (not random) so the page looks the same on every load.

const STARS = [
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
const SPARKLES = [
  { left: "12%", top: "22%", size: 14 },
  { left: "88%", top: "32%", size: 12 },
  { left: "74%", top: "78%", size: 10 },
];

// className sets where the stars sit (default: fill the parent, behind the content).
export function Stars({ className = "inset-0 -z-10" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute hidden dark:block ${className}`}>
      {STARS.map((s, i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-[#fff8ec] ${s.dim ? "opacity-50" : "opacity-90"}`}
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
        />
      ))}
      {SPARKLES.map((s, i) => (
        <svg
          key={`sparkle-${i}`}
          viewBox="0 0 24 24"
          className="absolute text-lemon"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
        >
          <path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
