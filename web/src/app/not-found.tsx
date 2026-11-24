import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BlobWords } from "@/components/blob-words";

// Wrenn's own 404, in the site's style: logo home, the mascot, a highlight word, and a way back.
export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[44rem] flex-1 flex-col items-center px-md py-2xl text-center">
      <Link href="/" className="self-start">
        <Image src="/wrenn-logo.png" alt="Wrenn, back to home" width={2172} height={724} sizes="120px" loading="eager" className="h-10 w-auto dark:[filter:drop-shadow(0_0_1px_#f3ebdd)_drop-shadow(0_0_1px_#f3ebdd)]" />
      </Link>
      {/* Draft PNG from brand/mascot/, swap for the SVG once it's traced */}
      <Image
        src="/wrenn-bird.png"
        alt=""
        width={1462}
        height={1076}
        sizes="128px"
        className="mt-2xl w-28 dark:[filter:drop-shadow(0_0_1px_#f3ebdd)_drop-shadow(0_0_1px_#f3ebdd)]"
      />
      <h1 className="mt-lg font-display text-[clamp(2.5rem,7vw,4rem)] leading-[1.05] text-navy">
        This page{" "}
        <span className="inline-flex align-baseline">
          <BlobWords className="" offset={1} words={[{ word: "flew off.", bg: "bg-red", text: "text-white" }]} />
        </span>
      </h1>
      <p className="mt-md max-w-[28rem] text-[1.0625rem] leading-relaxed text-navy-body">
        Nothing lives at this link. It might have moved, or the link has a typo.
      </p>
      <div className="mt-xl flex flex-wrap items-center justify-center gap-md">
        <Link href="/" className="rounded-pill bg-navy px-[22px] py-2.5 font-display text-xl text-cream">
          Back to home
        </Link>
        <Link href="/#faq" className="font-semibold text-navy underline">
          Read the FAQ
        </Link>
      </div>
    </main>
  );
}
