import { BlobWord } from '../components/BlobWord'
import { VideoList } from '../components/VideoList'
import type { VideoInfo } from '../data'

type Props = {
  videos: VideoInfo[]
  onOpenVideo: (video: VideoInfo) => void
  onTemplate: () => void
  onEdit: () => void
}

type Path = {
  title: string
  text: string
  color: string
  tilt: string
  onClick: () => void
  // Shown but not clickable yet
  soon?: boolean
}

// Two big ways to start. The cards keep their blob colors at night too,
// so their text uses "ink" (navy that never swaps).
export function Home({ videos, onOpenVideo, onTemplate, onEdit }: Props) {
  const paths: Path[] = [
    {
      title: 'Make from a template',
      text: 'Add your screenshots and logo, pick a style. Wrenn makes the video.',
      color: 'bg-sky',
      tilt: '-rotate-1',
      onClick: onTemplate
    },
    {
      title: 'Edit my video',
      text: 'Upload a video you filmed. Wrenn adds subtitles, cuts and zooms.',
      color: 'bg-lemon',
      tilt: 'rotate-1',
      onClick: onEdit,
      // The edit screens exist, but the real editing (subtitles, cuts, color) comes later
      soon: true
    }
  ]

  return (
    <div className="mx-auto w-full max-w-[896px] text-center">
      <h1 className="font-display text-[3.5rem] leading-[1.05] text-navy">
        What are we <BlobWord word="making" bg="bg-teal" /> today?
      </h1>
      <p className="mx-auto mt-md max-w-[512px] text-[1.1875rem] leading-[1.55] text-navy-body">
        Pick one to start. You can change your mind later.
      </p>

      <div className="mt-2xl grid grid-cols-2 gap-xl">
        {paths.map((p) => (
          <button
            key={p.title}
            type="button"
            onClick={p.onClick}
            disabled={p.soon}
            className={`group flex min-h-64 flex-col items-start justify-end rounded-lg px-[22px] py-[28px] text-left text-ink shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-transform duration-200 ease-[var(--ease-out-strong)] ${p.soon ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:rotate-0 hover:-translate-y-1 active:translate-y-0'} ${p.color} ${p.tilt}`}
          >
            <span className="font-display text-[1.875rem] leading-[1.1]">{p.title}</span>
            <span className="mt-sm text-base leading-[1.55]">{p.text}</span>
            {p.soon ? (
              <span className="mt-lg inline-flex items-center rounded-pill border-2 border-ink px-[16px] py-[6px] font-display text-lg leading-none">
                Coming soon
              </span>
            ) : (
              <span className="mt-lg inline-flex items-center gap-xs rounded-pill bg-ink px-[18px] py-[8px] font-display text-lg leading-none text-[#fff8ec]">
                Start
                <svg viewBox="0 0 24 24" className="size-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>

      <VideoList videos={videos} onOpen={onOpenVideo} />
    </div>
  )
}
