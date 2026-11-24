import type { Metadata } from "next";
import Image from "next/image";
import localFont from "next/font/local";
import { SITE_URL } from "@/lib/links";
import "./globals.css";

// Self-hosted copies of brand/fonts/ (no Google Fonts CDN)
const bubblegum = localFont({
  src: "../fonts/BubblegumSans-Regular.woff2",
  variable: "--font-bubblegum",
  weight: "400",
});

const figtree = localFont({
  src: "../fonts/Figtree-Variable.woff2",
  variable: "--font-figtree",
  weight: "300 900",
});

// Runs before the page paints, so a saved dark choice doesn't flash light first.
// Default is light: dark only when the visitor picked it with the toggle.
// It also adds a "js" class, so entrance animations only hide things when JS is on.
// It also adds "loaded" once the page and its fonts are ready (it doesn't wait for the
// videos and big images), which removes the loading screen and starts the hero animation.
// After 2.5 seconds it adds it anyway, so the loading screen can never get stuck.
const themeScript =
  'var d=document.documentElement;d.classList.add("js");try{if(localStorage.getItem("theme")==="dark")d.classList.add("dark")}catch(e){}' +
  'function l(){d.classList.add("loaded")}addEventListener("DOMContentLoaded",function(){(document.fonts?document.fonts.ready:Promise.resolve()).then(l)});setTimeout(l,2500);';

// The 5 dots from the videos, in the blob colors
const loaderDots = ["bg-teal", "bg-lime", "bg-lemon", "bg-orange", "bg-red"];

// Title and description use what people search for ("motion graphics app", "video maker
// for windows", "promo video maker"; DataForSEO, US, Nov 2026). Pages add their own title
// through the template, e.g. "Privacy · Wrenn".
const TITLE = "Wrenn: Motion graphics video maker for Windows";
const DESCRIPTION =
  "Make motion graphics promo videos for your app or brand on Windows. Wrenn uses your own Claude Code, so there's nothing to type. No prompts. Just render.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · Wrenn" },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  // Link previews (Facebook, X, Slack, Discord...). The picture comes from opengraph-image.tsx.
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "Wrenn",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bubblegum.variable} ${figtree.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Loading screen: the logo and 5 small dots. Only appears if loading takes longer than 0.3s, gone the moment it's done */}
        <div className="page-loader" aria-hidden>
          <Image src="/wrenn-logo.png" alt="" width={2172} height={724} sizes="120px" loading="eager" className="h-9 w-auto dark:[filter:drop-shadow(0_0_1px_#f3ebdd)_drop-shadow(0_0_1px_#f3ebdd)]" />
          <div className="page-loader-dots">
            {loaderDots.map((color) => (
              <span key={color} className={color} />
            ))}
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
