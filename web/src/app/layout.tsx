import type { Metadata } from "next";
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
// It also adds "loaded" as soon as the page has finished loading, which removes the
// loading dots right away (or after 6 seconds at most, so they can never get stuck).
const themeScript =
  'var d=document.documentElement;d.classList.add("js");try{if(localStorage.getItem("theme")==="dark")d.classList.add("dark")}catch(e){}' +
  'function l(){d.classList.add("loaded")}addEventListener("load",l);setTimeout(l,6000);';

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
  // Link previews (Facebook, X, Slack, Discord...). No preview image yet: add
  // openGraph.images once there's a 1200x630 share image.
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "Wrenn",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
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
        {/* Loading dots: only appear if loading takes longer than 0.3s, gone the moment it's done */}
        <div className="page-loader" aria-hidden>
          {loaderDots.map((color) => (
            <span key={color} className={color} />
          ))}
        </div>
        {children}
      </body>
    </html>
  );
}
