// The main process checks every video request before it touches the disk.
// These send BAD requests only, through the same bridge the screens use (window.api).
// Never send a fully valid request here: that would open the real Claude Code and use tokens.

import { expect, test, type ElectronApplication, type Page } from '@playwright/test'
import { existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { launchApp, makePicture, makeTempDirs, removeTempDirs, seedSettings, type TestDirs } from './helpers'

let dirs: TestDirs
let app: ElectronApplication
let page: Page
let picture: string

test.beforeEach(async () => {
  dirs = makeTempDirs()
  seedSettings(dirs, { setupDone: true })
  picture = makePicture(join(dirs.root, 'screenshot.png'))
  // hideClaude: even if a request slipped through by mistake, Claude Code can't start
  ;({ app, page } = await launchApp(dirs, { hideClaude: true }))
  await expect(page.getByRole('heading', { name: /What are we/ })).toBeVisible()
})

test.afterEach(async () => {
  await app.close()
  removeTempDirs(dirs)
})

// A request that's fine except for what each test changes
function request(changes: Record<string, unknown>): Record<string, unknown> {
  return {
    templateId: 'feature-walkthrough',
    size: 'reels',
    length: '15',
    vibe: 'playful',
    brandName: 'Test Brand',
    endingText: '',
    files: [{ path: picture, role: 'photo' }],
    music: 'none',
    ...changes
  }
}

// Sends the request and returns the error message the screen would get
async function startJobError(req: Record<string, unknown>): Promise<string> {
  return page.evaluate(async (r) => {
    try {
      // The page's own types don't exist here, so call it loosely
      await (window as unknown as { api: { startJob: (r: unknown) => Promise<unknown> } }).api.startJob(r)
      return 'NO ERROR'
    } catch (error) {
      return (error as Error).message
    }
  }, req)
}

function jobFolders(): string[] {
  const jobs = join(dirs.userData, 'jobs')
  return existsSync(jobs) ? readdirSync(jobs) : []
}

test('startJob turns down bad requests with plain messages', async () => {
  expect(await startJobError(request({ brandName: '' }))).toContain('Add your brand name.')
  expect(await startJobError(request({ brandName: '   ' }))).toContain('Add your brand name.')

  expect(await startJobError(request({ music: 'own' }))).toContain("Your song couldn't be read. Try adding it again.")

  expect(await startJobError(request({ music: 'radio' }))).toContain('Pick where the music comes from.')

  expect(await startJobError(request({ files: [] }))).toContain('Add at least one screenshot or recording.')
  expect(await startJobError(request({ about: 'a'.repeat(301) }))).toContain('Keep "What does it do?" under 300 letters.')

  // A picture can't pass as a font
  expect(await startJobError(request({ files: [{ path: picture, role: 'font' }] }))).toContain(
    `"screenshot.png" isn't a font Wrenn can use.`
  )
  expect(await startJobError(request({ templateId: '../secret' }))).toContain("That template doesn't exist.")

  // No ElevenLabs key saved in the test settings
  expect(await startJobError(request({ music: 'elevenlabs' }))).toContain('Add your ElevenLabs key in Settings first')

  // None of these made a job folder
  expect(jobFolders()).toEqual([])
})
