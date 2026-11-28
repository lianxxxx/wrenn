import { ScreenTitle } from '../components/ScreenTitle'
import { VideoList } from '../components/VideoList'
import type { VideoInfo } from '../data'

type Props = {
  videos: VideoInfo[]
  onOpenVideo: (video: VideoInfo) => void
}

// Every video made so far, newest first (from the Videos\Wrenn folder).
export function Videos({ videos, onOpenVideo }: Props) {
  return (
    <div className="mx-auto w-full max-w-[896px]">
      <ScreenTitle title="Your videos" sub="Everything you've made, newest first. Click one to watch it." />
      <VideoList videos={videos} onOpen={onOpenVideo} showHeading={false} />
    </div>
  )
}
