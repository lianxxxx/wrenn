// Shared helpers for the Playwright tests.
// Every test gets its own temp folders, so the real settings and Videos\Wrenn are never touched.

import { _electron as electron, type ElectronApplication, type Page } from '@playwright/test'
import { spawnSync } from 'child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { delimiter, join, resolve } from 'path'

export const DESKTOP = resolve(__dirname, '..')
// The built app (made by "electron-vite build", which "npm test" runs first)
export const APP_ENTRY = join(DESKTOP, 'out', 'main', 'index.js')
export const RENDER_CLI = join(DESKTOP, 'out', 'main', 'render-cli.js')
export const FFMPEG = join(DESKTOP, 'node_modules', 'ffmpeg-static', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg')

export type TestDirs = {
  // Parent temp folder, deleted after the test
  root: string
  // Stands in for %APPDATA%\Wrenn (settings.json, jobs\)
  userData: string
  // Stands in for Videos\Wrenn
  output: string
}

export function makeTempDirs(): TestDirs {
  const root = mkdtempSync(join(tmpdir(), 'wrenn-test-'))
  const dirs = { root, userData: join(root, 'userData'), output: join(root, 'videos') }
  mkdirSync(dirs.userData)
  mkdirSync(dirs.output)
  return dirs
}

// Windows can keep a file locked for a moment after the app closes, so try a few times
export function removeTempDirs(dirs: TestDirs): void {
  rmSync(dirs.root, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}

// Writes settings.json the way the app does. setupDone: true skips the setup screen.
export function seedSettings(dirs: TestDirs, settings: { setupDone: boolean }): void {
  writeFileSync(join(dirs.userData, 'settings.json'), JSON.stringify(settings, null, 2), 'utf8')
}

// Starts the built app with the test folders. Checks the build is there first,
// so a missing build is a clear test error instead of an Electron error dialog.
// options.hideClaude: the app can't find Claude Code at all (a seatbelt for tests that
// send video requests, so a mistake can never run the real Claude Code and use tokens)
export async function launchApp(
  dirs: TestDirs,
  options: { hideClaude?: boolean } = {}
): Promise<{ app: ElectronApplication; page: Page }> {
  if (!existsSync(APP_ENTRY)) throw new Error(`Built app not found at ${APP_ENTRY}. Run "npm test" (it builds first).`)

  const env: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) if (value !== undefined) env[key] = value
  // Without this the app would try to load the dev server instead of the built page
  delete env.ELECTRON_RENDERER_URL
  env.WRENN_TEST_USER_DATA = dirs.userData
  env.WRENN_TEST_OUTPUT_DIR = dirs.output

  if (options.hideClaude) {
    // Drop every PATH folder that has Claude Code in it ("Path" on Windows, "PATH" elsewhere)
    const pathKey = Object.keys(env).find((k) => k.toUpperCase() === 'PATH') ?? 'PATH'
    env[pathKey] = (env[pathKey] ?? '')
      .split(delimiter)
      .filter((folder) => !['claude', 'claude.exe', 'claude.cmd'].some((name) => existsSync(join(folder, name))))
      .join(delimiter)
    // Wrenn also looks in ~/.local/bin, so point the home folder at the temp folder
    env.USERPROFILE = dirs.root
    env.HOME = dirs.root
  }

  const app = await electron.launch({ args: [APP_ENTRY], cwd: DESKTOP, env })
  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  return { app, page }
}

// Runs ffmpeg and returns what it printed. ffmpeg prints its info on stderr, so both are returned.
// allowFail: "ffmpeg -i file" with no output file exits with an error but still prints the info we want.
export function ffmpeg(args: string[], allowFail = false): string {
  if (!existsSync(FFMPEG)) throw new Error(`ffmpeg not found at ${FFMPEG}. Run npm install.`)
  const result = spawnSync(FFMPEG, ['-hide_banner', ...args], { encoding: 'utf8' })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  if (result.status !== 0 && !allowFail) throw new Error(`ffmpeg failed:\n${output}`)
  return output
}

// A tiny 2 second silent MP4, made on the spot
export function makeVideo(file: string): string {
  ffmpeg(['-y', '-f', 'lavfi', '-i', 'color=c=0x219ebc:s=320x320:d=2', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', file])
  return file
}

// A tiny PNG picture, made on the spot
export function makePicture(file: string): string {
  ffmpeg(['-y', '-f', 'lavfi', '-i', 'color=c=0xffb703:s=64x64', '-frames:v', '1', file])
  return file
}
