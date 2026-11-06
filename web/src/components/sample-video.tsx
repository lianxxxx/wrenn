import { BlobWords } from "@/components/blob-words";

// Placeholder "video frame" showing what a Wrenn showreel looks like.
// Swap for a real looping MP4 made with Wrenn once the app can render one.
// A video doesn't change theme: everything inside uses fixed light colors (#023047 navy,
// #2A4A5A navy body, #FFF8EC cream), not the theme tokens that flip at night.
// Only the frame surface softens from white to cream in dark mode so it doesn't glare.

function MockAppCard() {
  return (
    <div className="w-[78%] rounded-md border-2 border-[#023047] bg-[#FFF8EC] p-sm text-left shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-xs">
        <span className="size-3 rounded-full bg-lime" />
        <span className="h-1.5 w-14 rounded-pill bg-[#023047]/70" />
      </div>
      <div className="mt-sm flex h-14 items-end gap-1">
        {[40, 65, 50, 85, 70, 95].map((h, i) => (
          <span key={i} className="flex-1 rounded-t-sm bg-sky" style={{ height: `${h}%` }} />
        ))}
      </div>
      <span className="mt-sm block h-1.5 w-3/4 rounded-pill bg-[#023047]/30" />
    </div>
  );
}

export function SampleVideo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col overflow-hidden bg-white p-sm sm:p-md dark:bg-[#F3EBDD] ${className}`}>
      {/* The "video" content takes the free space, so it can never run into the player bar below */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-sm sm:gap-md">
        <MockAppCard />
        <BlobWords
          className="text-2xl sm:text-3xl"
          words={[
            { word: "Meet", bg: "bg-sky", text: "text-[#023047]" },
            { word: "Trackr", bg: "bg-red", text: "text-white" },
          ]}
        />
        <p className="text-center text-xs font-semibold text-[#023047] sm:text-sm">Track habits fast</p>
      </div>

      {/* Fake player: progress bar + label, in its own row at the bottom */}
      <div className="mt-sm flex shrink-0 items-center gap-sm">
        <span className="h-1.5 flex-1 overflow-hidden rounded-pill bg-[#023047]/15">
          <span className="block h-full w-2/5 rounded-pill bg-[#023047]" />
        </span>
        <span className="text-[0.6875rem] font-medium text-[#2A4A5A]">Sample</span>
      </div>
    </div>
  );
}
