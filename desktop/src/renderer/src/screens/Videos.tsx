import { Button } from '../components/Button'
import { ScreenTitle } from '../components/ScreenTitle'
import { VideoList } from '../components/VideoList'
import type { VideoInfo } from '../data'

type Props = {
  videos: VideoInfo[]
  onOpenVideo: (video: VideoInfo) => void
  // Opens template pick, for the empty state
  onMakeVideo: () => void
}

// Every video made so far, newest first (from the Videos\Wrenn folder).
export function Videos({ videos, onOpenVideo, onMakeVideo }: Props) {
  if (videos.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[896px]">
        <ScreenTitle title="Your videos" sub="Nothing here yet." />
        <Button onClick={onMakeVideo}>Make a video</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[896px]">
      <ScreenTitle title="Your videos" sub="Everything you've made, newest first. Click one to watch it." />
      <VideoList videos={videos} onOpen={onOpenVideo} showHeading={false} />
    </div>
  )
}
