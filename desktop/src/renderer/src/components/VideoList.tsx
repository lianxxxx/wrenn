import { getSize, videoTitle, type VideoInfo } from '../data'

type Props = {
  videos: VideoInfo[]
  onOpen: (video: VideoInfo) => void
  // Home shows only the newest few, with a link to see them all
  limit?: number
  onSeeAll?: () => void
  // False on the Your videos screen, which has its own big title
  showHeading?: boolean
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
})

// Videos made so far, newest first. On Home (newest few) and the Your videos screen (all).
export function VideoList({ videos, onOpen, limit, onSeeAll, showHeading = true }: Props) {
  const shown = limit === undefined ? videos : videos.slice(0, limit)
  const more = videos.length > shown.length
  return (
    <section
      className={`text-left ${showHeading ? 'mt-3xl' : ''}`}
      aria-labelledby={showHeading ? 'your-videos' : undefined}
      aria-label={showHeading ? undefined : 'Your videos'}
    >
      {showHeading && (
        <div className="flex items-baseline justify-between gap-md">
          <h2 id="your-videos" className="font-display text-[2rem] leading-[1.1] text-navy">
            Your videos
          </h2>
          {more && onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              className="cursor-pointer rounded-sm py-xs text-[0.9375rem] font-semibold text-navy hover:underline"
            >
              See all {videos.length}
            </button>
          )}
        </div>
      )}

      {videos.length === 0 ? (
        <p className={`text-base text-navy-body ${showHeading ? 'mt-sm' : ''}`}>Videos you make will show up here.</p>
      ) : (
        <ul className={`grid grid-cols-3 gap-lg ${showHeading ? 'mt-lg' : ''}`}>
          {shown.map((video) => {
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
                      src={`${video.url}#t=1.5`}
                      muted
                      preload="metadata"
                      className="max-h-full max-w-full object-cover"
                      style={{ aspectRatio: `${size.width} / ${size.height}` }}
                      aria-hidden
                    />
                  </span>
                  <span className="mt-sm block truncate px-xs font-semibold text-navy">{videoTitle(video)}</span>
                  <span className="block px-xs pb-xs text-[0.8125rem] text-navy-body">
                    {dateFormat.format(new Date(video.createdAt))} · {size.ratio} ·{' '}
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
