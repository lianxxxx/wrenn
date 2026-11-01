import { BlobWords } from "@/components/blob-words";

// Placeholder "video frame" showing what a Wrenn showreel looks like.
// Swap for a real looping MP4 made with Wrenn once the app can render one.

function MockAppCard() {
  return (
    <div className="w-[78%] rounded-md border-2 border-navy bg-cream p-sm text-left shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-xs">
        <span className="size-3 rounded-full bg-lime" />
        <span className="h-1.5 w-14 rounded-pill bg-navy/70" />
      </div>
      <div className="mt-sm flex h-14 items-end gap-1">
        {[40, 65, 50, 85, 70, 95].map((h, i) => (
          <span key={i} className="flex-1 rounded-t-sm bg-sky" style={{ height: `${h}%` }} />
        ))}
      </div>
      <span className="mt-sm block h-1.5 w-3/4 rounded-pill bg-navy/30" />
    </div>
  );
}

export function SampleVideo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-md overflow-hidden bg-white p-md ${className}`}
    >
      <MockAppCard />
      <BlobWords
        className="text-3xl"
        words={[
          { word: "Meet", bg: "bg-sky", text: "text-navy" },
          { word: "Trackr", bg: "bg-red", text: "text-white" },
        ]}
      />
      <p className="text-sm font-semibold text-navy">Track habits in one tap</p>

      {/* Fake player: progress bar + label */}
      <div className="absolute inset-x-md bottom-md flex items-center gap-sm">
        <span className="h-1.5 flex-1 overflow-hidden rounded-pill bg-navy/15">
          <span className="block h-full w-2/5 rounded-pill bg-navy" />
        </span>
        <span className="text-[0.6875rem] font-medium text-navy-body">Sample</span>
      </div>
    </div>
  );
}
