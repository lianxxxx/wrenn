import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { checkClaude, openClaudeSignIn } from './claude'
import { cancelJob, cleanOldJobs, openClaudeInJob, startJob, stopAllJobs } from './jobs'
import { outputDir, listVideos } from './library'
import { registerMediaHandler, registerMediaScheme } from './media'
import { getSettings, saveSettings } from './settings'
import { startUpdateChecks } from './updates'

// Test-only: Playwright tests point settings at a temp folder, so they never touch real settings
if (process.env.WRENN_TEST_USER_DATA) app.setPath('userData', process.env.WRENN_TEST_USER_DATA)

// The wrenn-media:// address for playing videos has to be announced before the app is ready
registerMediaScheme()

// ---------------------------------------------------------------------------
// Actions the screens can ask for (see the bridge in preload/index.ts).
// Everything a screen sends is checked here or in the module it goes to.
// ---------------------------------------------------------------------------

// Is the user's Claude Code installed and signed in? (see claude.ts)
ipcMain.handle('check-claude', () => checkClaude())
// Opens Claude Code's own sign-in, so the user signs in themselves
ipcMain.handle('open-claude-sign-in', () => openClaudeSignIn())

// Where finished videos go: Videos\Wrenn (outputDir makes it if it's missing), opened in File Explorer.
// The main process owns this path: the screens never send a path to open.
// Returns an error message, or an empty string if it worked.
ipcMain.handle('open-output-folder', () => shell.openPath(outputDir()))

// Settings saved on this computer (see settings.ts)
ipcMain.handle('get-settings', () => getSettings())
ipcMain.handle('save-settings', (_event, changes: unknown) => saveSettings(changes))

// Every video in Videos\Wrenn, newest first (see library.ts)
ipcMain.handle('list-videos', () => listVideos())

// Video jobs (see jobs.ts). Progress goes back to the window that started the job.
ipcMain.handle('start-job', (event, request: unknown) => startJob(event.sender, request))
ipcMain.handle('open-claude-in-job', (_event, jobId: unknown) => openClaudeInJob(jobId))
ipcMain.handle('cancel-job', (_event, jobId: unknown) => cancelJob(jobId))

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    show: false,
    title: 'Wrenn',
    // Cream, so there's no white flash before the page loads
    backgroundColor: '#fcfcfa',
    autoHideMenuBar: true,
    // Placeholder: Lian's draft app icon. Swap for the traced SVG export (.ico) later.
    icon: join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      // Safety settings, written out so a later edit can't turn them off by accident:
      // the page can't use Node, and it only talks to us through the preload bridge.
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // Look for a newer Wrenn a few seconds later (installed app only, see updates.ts)
    startUpdateChecks()
  })

  // Links that try to open a new window go to the normal browser, but only https links
  mainWindow.webContents.setWindowOpenHandler((details) => {
    try {
      if (new URL(details.url).protocol === 'https:') shell.openExternal(details.url)
    } catch {
      // Not a valid URL: ignore it
    }
    return { action: 'deny' }
  })

  // The app window never leaves the app (for example when a file is dropped outside a drop box)
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) event.preventDefault()
  })

  // In dev, load the Vite server (hot reload). In the built app, load the file.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Same as appId in electron-builder.yml. Windows needs it to show notifications (notify.ts).
  electronApp.setAppUserModelId('com.wrenn.app')

  // Serve finished videos to the screens at wrenn-media://video/<file name> (see media.ts)
  registerMediaHandler()

  // Delete job folders older than a week (in the background, never blocks the app)
  void cleanOldJobs()

  // F12 opens DevTools in dev, and reload shortcuts are off in the built app
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Stop any waiting or rendering jobs. Their folders stay on disk.
app.on('before-quit', () => stopAllJobs())

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
