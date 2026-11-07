// Fake data and shared types for the first version of the app screens.
// Nothing here talks to Claude Code or the render engine yet.

export type SizeId = 'reels' | 'feed' | 'square' | 'youtube'

export type Size = {
  id: SizeId
  name: string
  ratio: string
  width: number
  height: number
  hint: string
}

export const sizes: Size[] = [
  { id: 'reels', name: 'Reels', ratio: '9:16', width: 1080, height: 1920, hint: 'TikTok, Reels, Stories' },
  { id: 'feed', name: 'Feed', ratio: '4:5', width: 1080, height: 1350, hint: 'Facebook and Instagram feed' },
  { id: 'square', name: 'Square', ratio: '1:1', width: 1080, height: 1080, hint: 'Any feed' },
  { id: 'youtube', name: 'YouTube', ratio: '16:9', width: 1920, height: 1080, hint: 'YouTube and websites' }
]

export function getSize(id: SizeId): Size {
  return sizes.find((s) => s.id === id) ?? sizes[0]
}

export type Template = {
  id: string
  name: string
  description: string
  available: boolean
  color: string
}

export const templates: Template[] = [
  {
    id: 'feature-walkthrough',
    name: 'Feature walkthrough',
    description: 'Show what your app does, one screen at a time.',
    available: true,
    color: 'bg-sky'
  },
  {
    id: 'product-launch',
    name: 'Product launch',
    description: 'A loud, quick hello for something new.',
    available: false,
    color: 'bg-lemon'
  },
  {
    id: 'before-after',
    name: 'Before and after',
    description: 'Show the problem, then your fix.',
    available: false,
    color: 'bg-lime'
  },
  {
    id: 'customer-love',
    name: 'Customer love',
    description: 'Turn happy reviews into a short video.',
    available: false,
    color: 'bg-orange'
  }
]

export type LengthId = '15' | '30' | '60'

export const lengths: { id: LengthId; name: string }[] = [
  { id: '15', name: '15 sec' },
  { id: '30', name: '30 sec' },
  { id: '60', name: '1 min' }
]

export type VibeId = 'playful' | 'clean' | 'bold' | 'calm'

export const vibes: { id: VibeId; name: string; hint: string }[] = [
  { id: 'playful', name: 'Playful', hint: 'Bouncy and bright' },
  { id: 'clean', name: 'Clean', hint: 'Simple and smooth' },
  { id: 'bold', name: 'Bold', hint: 'Big text, fast cuts' },
  { id: 'calm', name: 'Calm', hint: 'Slow and soft' }
]

export type SubtitleId = 'bold-pop' | 'clean' | 'boxed'

export const subtitleStyles: { id: SubtitleId; name: string; hint: string }[] = [
  { id: 'bold-pop', name: 'Bold pop', hint: 'Big words that pop in' },
  { id: 'clean', name: 'Clean', hint: 'Small and simple' },
  { id: 'boxed', name: 'Boxed', hint: 'Words on a color box' }
]

// Everything picked on the template path. Kept in App, so Back keeps your answers.
export type TemplateDraft = {
  templateId: string
  size: SizeId
  length: LengthId
  vibe: VibeId
  photos: File[]
  recordings: File[]
  logo: File[]
  brandName: string
  cta: string
}

export const emptyTemplateDraft: TemplateDraft = {
  templateId: 'feature-walkthrough',
  size: 'reels',
  length: '30',
  vibe: 'playful',
  photos: [],
  recordings: [],
  logo: [],
  brandName: '',
  cta: ''
}

// Everything picked on the edit path. Automatic is the default.
export type EditDraft = {
  video: File[]
  subtitles: SubtitleId
  cutPauses: boolean
  zooms: boolean
  autoColor: boolean
  size: SizeId
}

export const emptyEditDraft: EditDraft = {
  video: [],
  subtitles: 'bold-pop',
  cutPauses: true,
  zooms: true,
  autoColor: true,
  size: 'reels'
}

// Which path the current video came from, and its size (for the Done preview)
export type Job = {
  kind: 'template' | 'edit'
  size: SizeId
}

export type Settings = {
  elevenLabsKey: string
  outputFolder: string
}

export const defaultSettings: Settings = {
  elevenLabsKey: '',
  outputFolder: 'C:\\Users\\You\\Videos\\Wrenn'
}

// A finished video in "Your videos" on Home. Fake for now: kept in memory only,
// and every preview plays the engine test video. Later this list comes from the output folder.
export type Video = {
  id: string
  fileName: string
  kind: 'template' | 'edit'
  size: SizeId
  createdAt: Date
}

// A unique name per video, so a new one never replaces an old one
export function makeVideo(job: Job, now = new Date()): Video {
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
  return {
    id: String(now.getTime()),
    fileName: `wrenn ${stamp}.mp4`,
    kind: job.kind,
    size: job.size,
    createdAt: now
  }
}

// A few fake past videos, so Home doesn't look empty while we design it
export const sampleVideos: Video[] = [
  makeVideo({ kind: 'template', size: 'reels' }, new Date(2026, 10, 6, 16, 20, 5)),
  makeVideo({ kind: 'edit', size: 'square' }, new Date(2026, 10, 5, 10, 2, 40)),
  makeVideo({ kind: 'template', size: 'youtube' }, new Date(2026, 10, 3, 19, 45, 12))
]

// A friendly name for a video, like "Reels video, Nov 6". The file name stays in "Saved to".
export function videoTitle(video: Video): string {
  const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(video.createdAt)
  return `${getSize(video.size).name} video, ${day}`
}
