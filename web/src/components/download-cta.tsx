import { BlobWords } from "@/components/blob-words";
import { Scribble } from "@/components/scribble";
import { SectionHeading } from "@/components/section-heading";
import { DOWNLOAD_URL } from "@/lib/links";

// Final call to action. The W brush (the only one on the site) sits behind the button area.

export function DownloadCta() {
  return (
    <section id="get-wrenn" className="px-md py-xl sm:py-[3.4375rem]">
      <SectionHeading
        title={
          <>
            Ready to make your first{" "}
            <span className="inline-flex align-baseline">
              <BlobWords className="" offset={2} pop words={[{ word: "video?", bg: "bg-teal", text: "text-white" }]} />
            </span>
          </>
        }
        sub="Your first video is a few clicks away."
      />
      <div className="relative isolate mx-auto mt-xl flex w-fit flex-col items-center gap-sm px-xl py-lg">
        <Scribble className="left-1/2 top-1/2 w-[min(640px,94vw)] -translate-x-1/2 -translate-y-[62%]" />
        <a
          href={DOWNLOAD_URL}
          className="rounded-pill bg-navy px-[22px] py-2.5 font-display text-xl text-cream transition-transform active:translate-y-0.5"
        >
          Download for Windows
        </a>
        <p className="text-[0.8125rem] font-medium text-navy-body">Free for Windows · No sign-up needed</p>
        {/* The app isn't code signed yet, so Windows warns on first open */}
        <p className="max-w-[22rem] text-center text-[0.8125rem] text-navy-body">
          If Windows says it protected your PC, click &quot;More info&quot;, then &quot;Run anyway&quot;.
        </p>
      </div>
    </section>
  );
}
