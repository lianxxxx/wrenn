// Dev tool: render a scene from the terminal, no app window.
// Usage (from desktop/): npm run render -- <sceneDir> <outFile> [--sound <vibe>]
// With --sound, Wrenn's own music for that vibe and the scene's sound.json are mixed in after.
// Built by electron-vite as a second main entry (out/main/render-cli.js).

import { app } from 'electron'
import { statSync } from 'fs'
import { dirname, resolve } from 'path'
import { addSound } from '../audio'
import { renderScene } from './render'

// Electron's argv is [electron, script, ...our arguments]
const [sceneDir, outFile, flag, vibe] = process.argv.slice(2)
const soundVibe = flag === '--sound' ? vibe || 'playful' : undefined

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

    if (soundVibe) {
      console.log(`Adding sound (${soundVibe})...`)
      const { added, note } = await addSound({
        // Any text works as the id: it only picks which of the vibe's songs to use
        jobId: resolve(sceneDir),
        jobDir: dirname(resolve(sceneDir)),
        videoFile: resolve(outFile),
        music: 'wrenn',
        vibe: soundVibe,
        // 0 = read the real length from the video
        duration: 0
      })
      console.log(added ? 'Sound added.' : 'No sound found, the video stays silent.')
      if (note) console.log(note)
    }

    const seconds = ((Date.now() - started) / 1000).toFixed(1)
    const sizeMb = (statSync(resolve(outFile)).size / 1024 / 1024).toFixed(2)
    console.log(`Done in ${seconds}s. ${resolve(outFile)} (${sizeMb} MB)`)
    app.exit(0)
  } catch (error) {
    console.error(error)
    app.exit(1)
  }
})
