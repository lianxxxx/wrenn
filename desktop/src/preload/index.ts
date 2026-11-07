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
  // ElevenLabs key (optional). Stored encrypted when Windows allows it.
  voiceoverKey: string
}

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
}

// Everything the template path collected
export type JobRequest = {
  templateId: string
  size: SizeId
  length: '15' | '30' | '60'
  vibe: 'playful' | 'clean' | 'bold' | 'calm'
  brandName: string
  endingText: string
  // Real paths on disk (from getPathForFile)
  files: { path: string; role: 'photo' | 'recording' | 'logo' }[]
}

// Sent by the main process while a video is being made
//   waiting-for-claude -> the job folder is ready, Claude Code is open, waiting for done.json
//   rendering          -> turning the scene into an MP4 (frame / total)
//   done               -> finished, video is set
//   failed             -> something broke, message says what (plain words)
//   cancelled          -> the user pressed Cancel
export type JobEvent = {
  jobId: string
  stage: 'waiting-for-claude' | 'rendering' | 'done' | 'failed' | 'cancelled'
  frame?: number
  total?: number
  video?: VideoInfo
  message?: string
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
  }
}

export type Api = typeof api

contextBridge.exposeInMainWorld('api', api)
