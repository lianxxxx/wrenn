// Shared types and the fixed lists the screens use (sizes, templates, vibes).
// Types the main process also uses come from the preload (the contract), so both sides agree.
import type { GrabbedFile, JobRequest, MusicChoice, SiteBrand, SiteGrab, SizeId, VideoInfo } from '../../preload'
import { AUDIO_EXTS } from '../../shared/limits'
import { rulesFor } from '../../shared/templates'
// Placeholder video for the fake edit path
import sampleVideo from './assets/sample.mp4'

export type { CustomTemplate, JobEvent, JobRequest, MusicChoice, NewCustomTemplate, Settings, SiteBrand, SiteGrab, SizeId, VideoInfo } from '../../preload'

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
  // The creator whose video inspired it, shown on the card. Wrenn's prompts are its own.
  credit?: string
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
    id: 'logo-reveal',
    name: 'Logo reveal',
    description: 'Your logo builds itself, piece by piece.',
    available: true,
    color: 'bg-lemon',
    credit: '@tdinh_me'
  },
  {
    id: 'kinetic-typography',
    name: 'Moving words',
    description: 'Your own words, big and on the beat.',
    available: true,
    color: 'bg-lime',
    credit: '@finnardley'
  },
  {
    id: 'product-launch',
    name: 'Product launch',
    description: 'A loud, quick hello for something new.',
    available: true,
    color: 'bg-orange',
    credit: '@twoclipping'
  },
  {
    id: 'product-explainer',
    name: 'Explainer',
    description: 'How your app works, step by step.',
    available: true,
    color: 'bg-lemon',
    credit: '@finnardley'
  },
  {
    id: 'showreel',
    name: 'Showreel',
    description: 'Fast cuts of all your screens, on the beat.',
    available: true,
    color: 'bg-sky',
    credit: '@stephanlivera'
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

// Song files Wrenn can mix in (used as a file input accept string: ".mp3,.wav,...")
export const songTypes = AUDIO_EXTS.join(',')

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
  // "What does it do?": one or two sentences
  about: string
  // "Extra instructions" under Advanced. Optional, empty for most people.
  extra: string
  music: MusicChoice
  // Only used when music is "own": one song file
  musicFile: File[]
  // The address typed in "Grab from my site", and the colors and fonts it found
  siteUrl: string
  site?: SiteBrand
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
  about: '',
  extra: '',
  music: 'wrenn',
  musicFile: [],
  siteUrl: ''
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

// Files from "Grab from my site" aren't picked from the disk, so the browser doesn't know
// their path. We remember it here, next to the File the screen shows.
const grabbedPaths = new WeakMap<File, string>()

// Turns a file "Grab from my site" saved into a File the upload boxes can show
export function fileFromGrab(grabbed: GrabbedFile): File {
  const file = new File([grabbed.data as Uint8Array<ArrayBuffer>], grabbed.name, { type: grabbed.type })
  grabbedPaths.set(file, grabbed.path)
  return file
}

// True for files that came from "Grab from my site"
export function isGrabbed(file: File): boolean {
  return grabbedPaths.has(file)
}

// Puts what "Grab from my site" found into the draft. A new grab replaces the files from
// the last one, but never the user's own uploads (their own logo stays too).
// Screenshots only go in when the template has a screenshots box.
export function applyGrab(draft: TemplateDraft, grab: SiteGrab): TemplateDraft {
  const own = (files: File[]) => files.filter((f) => !isGrabbed(f))
  const photos =
    rulesFor(draft.templateId).needs === 'screens'
      ? [...own(draft.photos), ...grab.photos.map(fileFromGrab)]
      : draft.photos
  const keepOwnLogo = draft.logo.length > 0 && !isGrabbed(draft.logo[0])
  const logo = keepOwnLogo ? draft.logo : grab.logo ? [fileFromGrab(grab.logo)] : own(draft.logo)
  const fonts = [...own(draft.fonts), ...grab.fonts.map(fileFromGrab)]
  const found = grab.colors.length > 0 || grab.fontFamilies.length > 0
  return {
    ...draft,
    photos,
    logo,
    fonts,
    site: found ? { url: grab.url, colors: grab.colors, fonts: grab.fontFamilies } : undefined
  }
}

// The picked files as real paths on disk, each with its role, for startJob
export function draftFiles(draft: TemplateDraft): JobRequest['files'] {
  const toPaths = (files: File[], role: JobRequest['files'][number]['role']) =>
    files.map((file) => ({ path: grabbedPaths.get(file) ?? window.api.getPathForFile(file), role }))
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
