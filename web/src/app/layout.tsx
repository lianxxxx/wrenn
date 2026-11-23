import type { Metadata } from "next";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  title: "Wrenn",
  description: "No prompts. Just render.",
  // Link previews (Facebook, X, Slack, Discord...). No preview image yet: add
  // openGraph.images and metadataBase once there's a share image and a domain.
  openGraph: {
    title: "Wrenn",
    description: "No prompts. Just render.",
    siteName: "Wrenn",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Wrenn",
    description: "No prompts. Just render.",
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
