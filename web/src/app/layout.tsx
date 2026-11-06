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
const themeScript =
  'document.documentElement.classList.add("js");try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}';

export const metadata: Metadata = {
  title: "Wrenn",
  description: "No prompts. Just render.",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
