import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { mkdir } from 'fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { checkClaude, openClaudeSignIn } from './claude'

// Is the user's Claude Code installed and signed in? (see claude.ts)
ipcMain.handle('check-claude', () => checkClaude())
// Opens Claude Code's own sign-in, so the user signs in themselves
ipcMain.handle('open-claude-sign-in', () => openClaudeSignIn())

// Where finished videos go: Videos\Wrenn. Made if it's missing, then opened in File Explorer.
// The main process owns this path: the screens never send a path to open.
// Returns an error message, or an empty string if it worked.
ipcMain.handle('open-output-folder', async () => {
  const folder = join(app.getPath('videos'), 'Wrenn')
  await mkdir(folder, { recursive: true })
  return shell.openPath(folder)
})

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
  electronApp.setAppUserModelId('com.wrenn.app')

  // F12 opens DevTools in dev, and reload shortcuts are off in the built app
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
