import { BlobWord } from '../components/BlobWord'
import { Button } from '../components/Button'
import { getSize, videoTitle, type VideoInfo } from '../data'

type Props = {
  video: VideoInfo
  // True right after making it, false when opened again from "Your videos"
  isNew: boolean
  onAnother: () => void
  onHome: () => void
}

// One finished video: right after it's made, or opened again from Home.
// It plays from the wrenn-media:// address the main process gives each video.
export function Done({ video, isNew, onAnother, onHome }: Props) {
  const size = getSize(video.size)
  const wide = size.width > size.height

  return (
    <div className="mx-auto flex w-full max-w-[896px] items-center gap-xl">
      {/* Product frames keep fixed colors in both themes (DESIGN.md) */}
      <div className="flex w-[420px] shrink-0 justify-center">
        <video
          // #t=1.5 shows a frame from 1.5s before play, so the box isn't blank navy
          src={`${video.url}#t=1.5`}
          preload="metadata"
          controls
          playsInline
          className="rounded-md border-2 border-[#023047] bg-[#023047] object-cover"
          // Wide videos fill the width, tall and square ones fill the height
          style={{
            aspectRatio: `${size.width} / ${size.height}`,
            width: wide ? '100%' : 'auto',
            height: wide ? 'auto' : '440px'
          }}
          aria-label={`Your video, ${size.name} ${size.ratio}`}
        />
      </div>

      <div>
        {isNew ? (
          <h1 className="font-display text-[3rem] leading-[1.05] text-navy">
            Your video is <BlobWord word="ready" bg="bg-red" seed={1} />
          </h1>
        ) : (
          <h1 className="font-display text-[3rem] leading-[1.05] text-navy">{videoTitle(video)}</h1>
        )}
        <p className="mt-md text-[1.1875rem] leading-[1.55] text-navy-body">Saved to</p>
        <p className="mt-xs break-all rounded-sm bg-sky-soft px-md py-sm font-semibold text-navy">
          {video.filePath}
        </p>
        <div className="mt-xl flex flex-wrap gap-md">
          <Button onClick={() => window.api.openOutputFolder()}>Open folder</Button>
          {isNew ? (
            <Button variant="ghost" onClick={onAnother}>
              Make another
            </Button>
          ) : (
            <Button variant="ghost" onClick={onHome}>
              Back to my videos
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
