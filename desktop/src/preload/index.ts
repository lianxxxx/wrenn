import { contextBridge, ipcRenderer } from 'electron'

// The safe bridge: the screens can only call the actions listed here, nothing else.
// More real actions (run Claude Code, save files) go here later.
const api = {
  // Asks the main process to open Wrenn's video folder in File Explorer.
  // Resolves to an error message, or an empty string if it worked.
  openOutputFolder: (): Promise<string> => ipcRenderer.invoke('open-output-folder')
}

export type Api = typeof api

contextBridge.exposeInMainWorld('api', api)
