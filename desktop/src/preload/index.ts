import { contextBridge, ipcRenderer } from 'electron'
// What the Claude Code check sends back. Only yes/no and the version: no account info.
export type ClaudeStatus = {
  installed: boolean
  signedIn: boolean
  version?: string
}

// The safe bridge: the screens can only call the actions listed here, nothing else.
// More real actions (run Claude Code, save files) go here later.
const api = {
  // Asks the main process to open Wrenn's video folder in File Explorer.
  // Resolves to an error message, or an empty string if it worked.
  openOutputFolder: (): Promise<string> => ipcRenderer.invoke('open-output-folder'),
  // Is Claude Code installed and signed in? Only yes/no and the version come back.
  checkClaude: (): Promise<ClaudeStatus> => ipcRenderer.invoke('check-claude'),
  // Opens Claude Code's own sign-in window (which opens the browser)
  openClaudeSignIn: (): Promise<void> => ipcRenderer.invoke('open-claude-sign-in')
}

export type Api = typeof api

contextBridge.exposeInMainWorld('api', api)
