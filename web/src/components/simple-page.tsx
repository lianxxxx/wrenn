import Image from "next/image";
import Link from "next/link";

// Shared layout for plain text pages (Privacy, Credits): logo back to home, a title, readable text.

export function SimplePage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[44rem] px-md py-2xl">
      <Link href="/" className="inline-block">
        <Image src="/wrenn-logo.png" alt="Wrenn, back to home" width={2172} height={724} sizes="120px" loading="eager" className="h-10 w-auto dark:[filter:drop-shadow(0_0_1px_#f3ebdd)_drop-shadow(0_0_1px_#f3ebdd)]" />
      </Link>
      <h1 className="mt-2xl font-display text-[clamp(2.5rem,7vw,4rem)] leading-[1.05] text-navy">{title}</h1>
      <p className="mt-xs text-[0.8125rem] text-navy-body">Last updated {updated}</p>
      <div className="mt-xl flex flex-col gap-lg text-[1.0625rem] leading-relaxed text-navy-body [&_h2]:mt-md [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-navy [&_a]:text-navy [&_a]:underline [&_ul]:list-disc [&_ul]:pl-lg">
        {children}
      </div>
    </main>
  );
}
