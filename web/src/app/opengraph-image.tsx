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
        <div style={{ position: "absolute", top: 70, right: 120, width: 220, height: 90, borderRadius: 60, background: SKY_SOFT }} />
        <div style={{ position: "absolute", bottom: 48, right: 300, width: 160, height: 64, borderRadius: 50, background: SKY_SOFT }} />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={216} height={72} alt="" style={{ objectFit: "contain" }} />

        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Bubblegum Sans", color: NAVY, fontSize: 112, lineHeight: 1.05 }}>
            <div style={{ display: "flex" }}>No prompts.</div>
            <div style={{ display: "flex", alignItems: "center" }}>
              Just
              <div style={{ display: "flex", marginLeft: 28, padding: "0 36px 10px", borderRadius: "48% 42% 46% 40% / 55% 50% 52% 48%", background: TEAL, color: "#FFFFFF", transform: "rotate(-1.5deg)" }}>
                render.
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
