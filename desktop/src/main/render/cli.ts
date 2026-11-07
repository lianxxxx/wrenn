// Dev tool: render a scene from the terminal, no app window.
// Usage (from desktop/): npm run render -- <sceneDir> <outFile>
// Built by electron-vite as a second main entry (out/main/render-cli.js).

import { app } from 'electron'
import { statSync } from 'fs'
import { resolve } from 'path'
import { renderScene } from './render'

// Electron's argv is [electron, script, ...our arguments]
const [sceneDir, outFile] = process.argv.slice(2)

if (!sceneDir || !outFile) {
  console.error('Usage: npm run render -- <sceneDir> <outFile>')
  process.exit(1)
}

// Don't quit when the hidden capture window closes, we quit ourselves
app.on('window-all-closed', () => {})

app.whenReady().then(async () => {
  const started = Date.now()
  let lastLogged = 0

  try {
    await renderScene({
      sceneDir,
      outFile,
      onProgress: (frame, total) => {
        // A line every 30 frames (and the last one) is enough to see it moving
        if (frame - lastLogged >= 30 || frame === total) {
          console.log(`frame ${frame}/${total}`)
          lastLogged = frame
        }
      }
    })

    const seconds = ((Date.now() - started) / 1000).toFixed(1)
    const sizeMb = (statSync(resolve(outFile)).size / 1024 / 1024).toFixed(2)
    console.log(`Done in ${seconds}s. ${resolve(outFile)} (${sizeMb} MB)`)
    app.exit(0)
  } catch (error) {
    console.error(error)
    app.exit(1)
  }
})
