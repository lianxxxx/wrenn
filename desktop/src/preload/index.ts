import { contextBridge, ipcRenderer, webUtils } from 'electron'

// ---------------------------------------------------------------------------
// Shared types: the screens and the main process both use these.
// ---------------------------------------------------------------------------

// What the Claude Code check sends back. Only yes/no and the version: no account info.
export type ClaudeStatus = {
  installed: boolean
  signedIn: boolean
  version?: string
}

export type SizeId = 'reels' | 'feed' | 'square' | 'youtube'

// Saved in a settings file on this computer, so they survive closing the app
export type Settings = {
  // True once setup found Claude Code, so setup doesn't show on every launch
  setupDone: boolean
  // ElevenLabs key (optional, for ElevenLabs music now and voiceover later).
  // Stored encrypted when Windows allows it. The name stays "voiceoverKey" so saved settings keep working.
  voiceoverKey: string
}

// Where the video's music comes from
//   wrenn      -> a free (CC0) song that ships inside Wrenn, picked for the vibe (the default)
//   own        -> the user's own song (musicFile is its real path on disk)
//   elevenlabs -> ElevenLabs makes a song with the user's own key (from Settings)
//   none       -> no music (sound effects only)
export type MusicChoice = 'wrenn' | 'own' | 'elevenlabs' | 'none'

// A finished video in Videos\Wrenn
export type VideoInfo = {
  id: string
  fileName: string
  // Full path on disk (for "Saved to")
  filePath: string
  // Address the screens can play: wrenn-media://video/<file name>
  url: string
  kind: 'template' | 'edit'
  size: SizeId
  // ISO date string
  createdAt: string
  // The brand name, e.g. "Trackr". Older videos don't have one.
  title?: string
}

// Everything the template path collected
export type JobRequest = {
  templateId: string
  size: SizeId
  length: '15' | '30' | '60'
  vibe: 'playful' | 'clean' | 'bold' | 'calm'
  brandName: string
  endingText: string
  // What the app does, in one or two sentences (up to 300 letters). Empty when skipped.
  about?: string
  // Real paths on disk (from getPathForFile). Fonts are .woff2, .woff, .ttf or .otf.
  files: { path: string; role: 'photo' | 'recording' | 'logo' | 'font' }[]
  music: MusicChoice
  // Only when music is "own": real path of the song (.mp3, .wav, .m4a, .aac, .ogg, .flac)
  musicFile?: string
}

// Sent by the main process while a video is being made
//   waiting-for-claude -> the job folder is ready, Claude Code is open, waiting for done.json
//   rendering          -> turning the scene into an MP4 (frame / total)
//   adding-sound       -> mixing the music and sound effects into the MP4 (message may say e.g. "Making your song")
//   done               -> finished, video is set
//   failed             -> something broke, message says what (plain words)
//   cancelled          -> the user pressed Cancel
export type JobEvent = {
  jobId: string
  stage: 'waiting-for-claude' | 'rendering' | 'adding-sound' | 'done' | 'failed' | 'cancelled'
  frame?: number
  total?: number
  video?: VideoInfo
  message?: string
  // Only while it's being made: how far along the whole video is (0 to 1),
  // and about how many seconds are left (a guess from past videos, see main/eta.ts)
  progress?: number
  secondsLeft?: number
}

// ---------------------------------------------------------------------------
// The safe bridge: the screens can only call the actions listed here, nothing else.
// ---------------------------------------------------------------------------
const api = {
  // Opens Wrenn's video folder in File Explorer. Resolves to an error message, or "".
  openOutputFolder: (): Promise<string> => ipcRenderer.invoke('open-output-folder'),

  // Is Claude Code installed and signed in?
  checkClaude: (): Promise<ClaudeStatus> => ipcRenderer.invoke('check-claude'),
  // Opens Claude Code's own sign-in window (which opens the browser)
  openClaudeSignIn: (): Promise<void> => ipcRenderer.invoke('open-claude-sign-in'),

  // The real path of a file the user dropped or picked (needed to copy it into a job)
  getPathForFile: (file: File): string => webUtils.getPathForFile(file),

  // Settings saved on this computer
  getSettings: (): Promise<Settings> => ipcRenderer.invoke('get-settings'),
  saveSettings: (changes: Partial<Settings>): Promise<Settings> => ipcRenderer.invoke('save-settings', changes),

  // Every video in Videos\Wrenn, newest first
  listVideos: (): Promise<VideoInfo[]> => ipcRenderer.invoke('list-videos'),

  // Makes the job folder, opens Claude Code in it, and starts waiting for it
  startJob: (request: JobRequest): Promise<{ jobId: string }> => ipcRenderer.invoke('start-job', request),
  // Opens Claude Code in the job folder again (if the user closed the window)
  openClaudeInJob: (jobId: string): Promise<void> => ipcRenderer.invoke('open-claude-in-job', jobId),
  cancelJob: (jobId: string): Promise<void> => ipcRenderer.invoke('cancel-job', jobId),
  // Listen for progress. Returns a function that stops listening.
  onJobEvent: (callback: (event: JobEvent) => void): (() => void) => {
    const listener = (_: unknown, event: JobEvent): void => callback(event)
    ipcRenderer.on('job-event', listener)
    return () => {
      ipcRenderer.removeListener('job-event', listener)
    }
  },

  // A newer Wrenn was downloaded in the background (installed app only, see main/updates.ts).
  // Gets the new version number. Returns a function that stops listening.
  onUpdateReady: (callback: (version: string) => void): (() => void) => {
    const listener = (_: unknown, version: string): void => callback(version)
    ipcRenderer.on('update-ready', listener)
    return () => {
      ipcRenderer.removeListener('update-ready', listener)
    }
  },
  // Closes Wrenn, installs the downloaded update, and opens Wrenn again
  installUpdate: (): Promise<void> => ipcRenderer.invoke('install-update')
}

export type Api = typeof api

contextBridge.exposeInMainWorld('api', api)
