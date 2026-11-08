import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'

// ---------------------------------------------------------------------------
// Auto updates. Wrenn looks for a newer version in the GitHub Releases of
// lianxxxx/wrenn (the "publish" part of electron-builder.yml), downloads it in
// the background, and tells the screens when it's ready.
// The user can click "Restart" on the banner, or just close Wrenn: the update
// installs when the app quits.
//
// Updates must never get in the way. Offline, private repo, no releases yet:
// every error is written to the log and nothing else happens. No dialogs.
// ---------------------------------------------------------------------------

// Wait a little after the window shows, so the check never slows down opening the app
const CHECK_DELAY_MS = 5000

// Short log lines with a prefix, so update messages are easy to spot in the terminal
const log = {
  info: (message: unknown): void => console.log('[updates]', message),
  warn: (message: unknown): void => console.warn('[updates]', message),
  // electron-updater's own error logs are long (headers, stack). The 'error' listener
  // below writes one short line instead.
  error: (): void => {},
  debug: (): void => {}
}

// Just the first line, e.g. "Update check failed: HttpError: 404"
function logFailure(error: unknown): void {
  const text = error instanceof Error ? error.message : String(error)
  console.warn('[updates] Update check failed:', text.split('\n')[0].trim())
}

// Only in the installed app. Not in npm run dev (there's nothing to update),
// and not in tests (they must never reach the internet or download anything).
function updatesAllowed(): boolean {
  return app.isPackaged && !process.env.WRENN_TEST_USER_DATA
}

// The "Restart" button on the banner. Registered even when updates are off,
// so a click can never fail with "no handler". It only does something once an update is downloaded.
let updateReady = false
ipcMain.handle('install-update', () => {
  if (!updateReady) return
  // Silent install (no setup wizard), then open Wrenn again
  autoUpdater.quitAndInstall(true, true)
})

// Call when the main window is shown. Only the first call does anything.
let started = false
export function startUpdateChecks(): void {
  if (started || !updatesAllowed()) return
  started = true

  autoUpdater.logger = log
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  // Without this listener, an error would crash the main process
  autoUpdater.on('error', logFailure)

  autoUpdater.on('update-downloaded', (info) => {
    updateReady = true
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) win.webContents.send('update-ready', info.version)
    }
  })

  setTimeout(() => {
    // The same error also goes to the 'error' listener, which already logged it
    autoUpdater.checkForUpdates().catch(() => {})
  }, CHECK_DELAY_MS)
}
