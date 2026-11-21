// Shared types and the fixed lists the screens use (sizes, templates, vibes).
// Types the main process also uses come from the preload (the contract), so both sides agree.
import type { JobRequest, MusicChoice, SizeId, VideoInfo } from '../../preload'
// Placeholder video for the fake edit path
import sampleVideo from './assets/sample.mp4'

export type { JobEvent, JobRequest, MusicChoice, Settings, SizeId, VideoInfo } from '../../preload'

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

// Where the music comes from. Wrenn's own songs are the default.
export const musicChoices: { id: MusicChoice; name: string; hint: string }[] = [
  { id: 'wrenn', name: "Wrenn's music", hint: 'Free songs for your vibe' },
  { id: 'own', name: 'Your own song', hint: 'A song on your computer' },
  // Non-techy users may not know ElevenLabs, so the name says what they get
  { id: 'elevenlabs', name: 'A new song', hint: 'Made by ElevenLabs' },
  { id: 'none', name: 'No music', hint: 'Just sound effects' }
]

// Song files Wrenn can mix in (used as a file input accept string)
export const songTypes = '.mp3,.wav,.m4a,.aac,.ogg,.flac'

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
  fonts: File[]
  brandName: string
  cta: string
  music: MusicChoice
  // Only used when music is "own": one song file
  musicFile: File[]
}

export const emptyTemplateDraft: TemplateDraft = {
  templateId: 'feature-walkthrough',
  size: 'reels',
  length: '30',
  vibe: 'playful',
  photos: [],
  recordings: [],
  logo: [],
  fonts: [],
  brandName: '',
  cta: '',
  music: 'wrenn',
  musicFile: []
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

// Fake for now: the edit path isn't built yet. It shows fake progress, then the engine test video.
// Only the template path talks to Claude Code and the render engine.
export function fakeEditVideo(size: SizeId, now = new Date()): VideoInfo {
  return {
    id: `fake-edit-${now.getTime()}`,
    fileName: 'sample.mp4',
    filePath: 'Not saved yet. Editing your own video is coming soon.',
    url: sampleVideo,
    kind: 'edit',
    size,
    createdAt: now.toISOString()
  }
}

// The picked files as real paths on disk, each with its role, for startJob
export function draftFiles(draft: TemplateDraft): JobRequest['files'] {
  const toPaths = (files: File[], role: JobRequest['files'][number]['role']) =>
    files.map((file) => ({ path: window.api.getPathForFile(file), role }))
  return [
    ...toPaths(draft.photos, 'photo'),
    ...toPaths(draft.recordings, 'recording'),
    ...toPaths(draft.logo, 'logo'),
    ...toPaths(draft.fonts, 'font')
  ]
}

// The music choice for startJob. The song's real path only goes along with "Your own song".
export function draftMusic(draft: TemplateDraft): Pick<JobRequest, 'music' | 'musicFile'> {
  const song = draft.musicFile[0]
  if (draft.music === 'own' && song) return { music: 'own', musicFile: window.api.getPathForFile(song) }
  return { music: draft.music }
}

// The folder a file sits in (everything before the last slash)
export function folderOf(filePath: string): string {
  const cut = Math.max(filePath.lastIndexOf('\\'), filePath.lastIndexOf('/'))
  return cut > 0 ? filePath.slice(0, cut) : filePath
}

// A friendly name for a video, like "Trackr, Nov 6". Older videos have no brand name: "Video, Nov 6".
// The file name stays in "Saved to".
export function videoTitle(video: VideoInfo): string {
  const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(video.createdAt))
  return `${video.title || 'Video'}, ${day}`
}

// Electron wraps errors from the main process like "Error invoking remote method 'start-job': Error: ...".
// Keep only the plain message at the end.
export function cleanError(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error)
  return text.replace(/^Error invoking remote method '[^']*':\s*/, '').replace(/^Error:\s*/, '')
}
