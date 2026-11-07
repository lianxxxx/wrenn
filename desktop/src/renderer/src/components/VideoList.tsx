import { getSize, videoTitle, type Video } from '../data'
// Placeholder: every card shows the engine test video until real videos exist
import sampleVideo from '../assets/sample.mp4'

type Props = {
  videos: Video[]
  onOpen: (video: Video) => void
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
})

// "Your videos" on Home: every video made so far, newest first.
export function VideoList({ videos, onOpen }: Props) {
  return (
    <section className="mt-3xl text-left" aria-labelledby="your-videos">
      <h2 id="your-videos" className="font-display text-[2rem] leading-[1.1] text-navy">
        Your videos
      </h2>

      {videos.length === 0 ? (
        <p className="mt-sm text-base text-navy-body">Videos you make will show up here.</p>
      ) : (
        <ul className="mt-lg grid grid-cols-3 gap-lg">
          {videos.map((video) => {
            const size = getSize(video.size)
            return (
              <li key={video.id}>
                <button
                  type="button"
                  onClick={() => onOpen(video)}
                  className="group w-full cursor-pointer rounded-lg border-2 border-line bg-card p-sm text-left transition-colors duration-200 hover:border-navy/40"
                >
                  {/* Product frames keep fixed colors in both themes (DESIGN.md) */}
                  <span className="flex aspect-video items-center justify-center overflow-hidden rounded-md bg-[#023047]">
                    <video
                      src={`${sampleVideo}#t=1.5`}
                      muted
                      preload="metadata"
                      className="max-h-full max-w-full object-cover"
                      style={{ aspectRatio: `${size.width} / ${size.height}` }}
                      aria-hidden
                    />
                  </span>
                  <span className="mt-sm block truncate px-xs font-semibold text-navy">{videoTitle(video)}</span>
                  <span className="block px-xs pb-xs text-[0.8125rem] text-navy-body">
                    {dateFormat.format(video.createdAt)} · {size.ratio} ·{' '}
                    {video.kind === 'template' ? 'Template' : 'Edited'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
