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

export const metadata: Metadata = {
  title: "Wrenn",
  description: "No prompts. Just render.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bubblegum.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
