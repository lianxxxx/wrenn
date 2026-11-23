// Starting a video job for real, but with a FAKE Claude Code (see fakeClaude in helpers.ts).
// The fake only waits, so nothing is ever sent to Claude and no tokens are used.
// Each test cancels its job, which stops the fake.

import { expect, test, type ElectronApplication, type Page } from '@playwright/test'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { launchApp, makeFontFile, makePicture, makeTempDirs, removeTempDirs, seedSettings, stopFakeClaude, type TestDirs } from './helpers'

let dirs: TestDirs
let app: ElectronApplication
let page: Page
let picture: string

test.beforeEach(async () => {
  dirs = makeTempDirs()
  seedSettings(dirs, { setupDone: true })
  picture = makePicture(join(dirs.root, 'screenshot.png'))
  ;({ app, page } = await launchApp(dirs, { fakeClaude: true }))
  await expect(page.getByRole('heading', { name: /What are we/ })).toBeVisible()
})

test.afterEach(async () => {
  await stopFakeClaude(dirs)
  await app.close()
  removeTempDirs(dirs)
})

// The page's own types don't exist here, so the bridge is called loosely
type JobEvent = { jobId: string; stage: string; progress?: number; secondsLeft?: number }

// Starts a job through the bridge, waits for its first time estimate, then cancels it
async function startAndCancel(changes: Record<string, unknown>): Promise<{ jobId: string; event: JobEvent }> {
  const req = {
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
  return page.evaluate(async (r) => {
    const api = (
      window as unknown as {
        api: {
          startJob: (r: unknown) => Promise<{ jobId: string }>
          cancelJob: (id: string) => Promise<void>
          onJobEvent: (cb: (e: JobEvent) => void) => () => void
        }
      }
    ).api
    const firstEstimate = new Promise<JobEvent>((resolve) => {
      const stop = api.onJobEvent((e) => {
        if (e.secondsLeft === undefined) return
        stop()
        resolve(e)
      })
    })
    const { jobId } = await api.startJob(r)
    const event = await firstEstimate
    await api.cancelJob(jobId)
    return { jobId, event }
  }, req)
}

function jobFolders(): string[] {
  const jobs = join(dirs.userData, 'jobs')
  return existsSync(jobs) ? readdirSync(jobs) : []
}

function readBrief(jobId: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(dirs.userData, 'jobs', jobId, 'brief.json'), 'utf8'))
}

test('brief.json gets "What does it do?" trimmed, and leaves it out when empty', async () => {
  const withAbout = await startAndCancel({ about: '   Turns screenshots into videos.  \n' })
  expect(readBrief(withAbout.jobId)).toEqual({
    brandName: 'Test Brand',
    endingText: '',
    about: 'Turns screenshots into videos.',
    size: 'reels',
    length: '15',
    vibe: 'playful'
  })

  // Only spaces, or not sent at all (older screens): no "about" in the brief
  const blank = await startAndCancel({ about: '   ' })
  expect(readBrief(blank.jobId)).not.toHaveProperty('about')
  const missing = await startAndCancel({})
  expect(readBrief(missing.jobId)).not.toHaveProperty('about')
})

test('from the upload screen: the about text and fonts reach the job folder', async () => {
  await page.getByRole('button', { name: /Make from a template/ }).click()
  await page.getByRole('button', { name: /Feature walkthrough/ }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByRole('heading', { name: 'Add your stuff' })).toBeVisible()

  await page.getByLabel('Brand name').fill('Test Brand')
  await page.getByLabel('What does it do? (optional)').fill('  Turns screenshots into videos.  ')
  await page.locator('input[type="file"][accept="image/*"]').first().setInputFiles(picture)
  await page
    .locator('input[type="file"][accept=".woff2,.woff,.ttf,.otf"]')
    .setInputFiles(makeFontFile(join(dirs.root, 'Brand.woff2')))
  await page.getByRole('button', { name: 'Make my video' }).click()

  await expect(page.getByRole('heading', { name: 'Making your video' })).toBeVisible()
  const [jobId] = jobFolders()
  expect(readBrief(jobId).about).toBe('Turns screenshots into videos.')
  const assets = readdirSync(join(dirs.userData, 'jobs', jobId, 'assets'))
  expect(assets).toEqual(expect.arrayContaining(['screenshot.png', 'Brand.woff2']))

  // Cancel stops the fake Claude Code and goes back to the upload step
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('heading', { name: 'Add your stuff' })).toBeVisible()
})
