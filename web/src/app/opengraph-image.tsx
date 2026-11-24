import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The picture shown when the link is shared (Facebook, X, Messenger, Discord, LinkedIn).
// Made from code at build time, like the blog covers on Lian's portfolio: the brand colors,
// fonts, logo and mascot that already exist. Nothing here is a new drawing.
// The image tool can't read WOFF2, so it uses WOFF copies of the same fonts (src/fonts/).

export const alt = "Wrenn: No prompts. Just render. Motion graphics video maker for Windows.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#023047";
const TEAL = "#219EBC";
const PAGE = "#FCFCFA";
const SKY_SOFT = "#DCEFF8";

// The hero's cloud shape (hero.tsx), as an inline SVG
function Cloud({ width, style }: { width: number; style: React.CSSProperties }) {
  return (
    <svg width={width} height={width / 2} viewBox="0 0 140 70" style={{ position: "absolute", ...style }}>
      <path d="M20 60 a20 20 0 0 1 4-38 a28 28 0 0 1 52-8 a22 22 0 0 1 40 14 a18 18 0 0 1 4 32 z" fill={SKY_SOFT} />
    </svg>
  );
}

// The site roughens its highlight blobs with an SVG noise filter, which the image tool
// can't run. So the edge is drawn instead: an oval with small bumps along it, from fixed
// numbers (no randomness), so the picture is the same on every build.
function roughBlobPath(w: number, h: number): string {
  const points = 96;
  const cx = w / 2;
  const cy = h / 2;
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    // Two waves of different sizes make the edge look painted, not wavy
    const wobble = 1 + 0.03 * Math.sin(a * 3 + 1.3) + 0.012 * Math.sin(a * 11 + 0.4) + 0.008 * Math.sin(a * 29);
    // A slightly squarer oval than an ellipse, like a marker stroke
    const x = cx + Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 0.92) * (w / 2) * wobble;
    const y = cy + Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 0.92) * (h / 2) * wobble;
    pts.push([x, y]);
  }
  // Smooth curve through the points (each point is a control point, midpoints are on the curve)
  const mid = (p: [number, number], q: [number, number]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let d = `M ${mid(pts[points - 1], pts[0]).join(" ")}`;
  for (let i = 0; i < points; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % points]);
    d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

// Reads the fonts and images in a cached step, so the picture is made once at build time
// instead of on every share. Fixed paths (not a variable), so only these files get bundled.
// Returns plain base64 text, since the cache can't hold file buffers.
async function loadFiles() {
  "use cache";
  const b64 = (data: Buffer) => data.toString("base64");
  const [bubblegum, figtree, logo, bird] = await Promise.all([
    readFile(join(process.cwd(), "src/fonts/BubblegumSans-Regular.woff")).then(b64),
    readFile(join(process.cwd(), "src/fonts/Figtree-SemiBold.woff")).then(b64),
    readFile(join(process.cwd(), "public/wrenn-logo.png")).then(b64),
    readFile(join(process.cwd(), "public/wrenn-bird.png")).then(b64),
  ]);
  return { bubblegum, figtree, logo, bird };
}

export default async function Image() {
  const files = await loadFiles();
  const logo = `data:image/png;base64,${files.logo}`;
  const bird = `data:image/png;base64,${files.bird}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: PAGE, padding: "56px 72px", position: "relative", fontFamily: "Figtree" }}>
        {/* Soft clouds, like the hero */}
        <Cloud width={210} style={{ top: 48, right: 110 }} />
        <Cloud width={150} style={{ bottom: 30, right: 300 }} />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={216} height={72} alt="" style={{ objectFit: "contain" }} />

        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Bubblegum Sans", color: NAVY, fontSize: 112, lineHeight: 1.05 }}>
            <div style={{ display: "flex" }}>No prompts.</div>
            <div style={{ display: "flex", alignItems: "center" }}>
              Just
              <div style={{ display: "flex", position: "relative", marginLeft: 22, width: 380, height: 150, alignItems: "center", justifyContent: "center", color: "#FFFFFF", transform: "rotate(-1.5deg)" }}>
                <svg width={380} height={150} viewBox="0 0 380 150" style={{ position: "absolute", top: 0, left: 0 }}>
                  <path d={roughBlobPath(380, 150)} fill={TEAL} />
                </svg>
                <div style={{ display: "flex", marginTop: -12 }}>render.</div>
              </div>
            </div>
            <div style={{ display: "flex", marginTop: 34, fontFamily: "Figtree", fontSize: 32, color: "#2A4A5A" }}>
              Motion graphics videos for your app, made on Windows.
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bird} width={300} height={221} alt="" style={{ objectFit: "contain", marginRight: 10 }} />
        </div>

        <div style={{ display: "flex", fontSize: 26, color: NAVY }}>wrenn.leyanne.com</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bubblegum Sans", data: Buffer.from(files.bubblegum, "base64"), weight: 400, style: "normal" },
        { name: "Figtree", data: Buffer.from(files.figtree, "base64"), weight: 600, style: "normal" },
      ],
    },
  );
}
