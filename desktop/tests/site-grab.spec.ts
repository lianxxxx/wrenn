// "Grab from my site" on step 3: Wrenn opens a website in a hidden window and adds its
// screenshots, logo, fonts and colors like normal uploads.
// The test serves its own tiny website on this computer (127.0.0.1), so nothing goes to the internet.
// Claude Code is a fake (see fakeClaude in helpers.ts), so no tokens are used.

import { expect, test, type ElectronApplication, type Page } from '@playwright/test'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { createServer, type Server } from 'http'
import type { AddressInfo } from 'net'
import { join } from 'path'
import { launchApp, makePicture, makeTempDirs, removeTempDirs, seedSettings, stopFakeClaude, type TestDirs } from './helpers'

let dirs: TestDirs
let app: ElectronApplication | undefined
let page: Page
let server: Server
let siteUrl: string

// A tall page: a header with a logo, a red headline in the brand font, a teal button
const PAGE = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Test site</title>
<style>
  @font-face { font-family: "TestBrand"; src: url("/brand.woff2") format("woff2"); font-weight: 700; }
  body { margin: 0; background: #FFF8EC; color: #023047; font-family: Georgia, serif; }
  header { background: #FFFFFF; padding: 16px; }
  h1 { color: #D62828; font-family: "TestBrand", sans-serif; font-size: 64px; }
  .btn { background: #219EBC; color: #FFFFFF; padding: 12px 24px; display: inline-block; }
  section { height: 900px; }
</style></head>
<body>
  <header><a href="/"><img class="site-logo" src="/logo.png" alt="Test logo" width="64" height="64"></a></header>
  <section><h1>Hello there</h1><a class="btn" href="/start">Start now</a></section>
  <section>Second part</section>
  <section>Third part</section>
</body></html>`

test.beforeEach(async () => {
  dirs = makeTempDirs()
  seedSettings(dirs, { setupDone: true })
  const logo = readFileSync(makePicture(join(dirs.root, 'logo.png')))

  server = createServer((req, res) => {
    if (req.url === '/logo.png') {
      res.writeHead(200, { 'Content-Type': 'image/png' })
      res.end(logo)
    } else if (req.url === '/brand.woff2') {
      // Not a real font: Wrenn only saves the file
      res.writeHead(200, { 'Content-Type': 'font/woff2' })
      res.end('not a real font')
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(PAGE)
    }
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  siteUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`
})

test.afterEach(async () => {
  await stopFakeClaude(dirs)
  await app?.close()
  app = undefined
  await new Promise<void>((resolve) => server.close(() => resolve()))
  removeTempDirs(dirs)
})

// Opens Wrenn on step 3 of the Feature walkthrough
async function openUploadStep(allowLocalSites: boolean): Promise<void> {
  ;({ app, page } = await launchApp(dirs, { fakeClaude: true, allowLocalSites }))
  await expect(page.getByRole('heading', { name: /What are we/ })).toBeVisible()
  await page.getByRole('button', { name: /Make from a template/ }).click()
  await page.getByRole('button', { name: /Feature walkthrough/ }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByRole('heading', { name: 'Add your stuff' })).toBeVisible()
}

test('grabs screenshots, logo, fonts and colors, and they reach the job', async () => {
  test.setTimeout(120_000)
  await openUploadStep(true)

  await page.getByLabel('Your website (optional)').fill(siteUrl)
  await page.getByRole('button', { name: 'Grab from my site' }).click()
  await expect(page.getByText('Looking at your site. This takes about 20 seconds.')).toBeVisible()
  await expect(page.getByText(/^Added \d+ screenshots, your logo and 1 font file\./)).toBeVisible({ timeout: 60_000 })

  // Screenshots at desktop and phone width, in the normal upload list
  const photos = page.getByRole('list', { name: 'Photos and screenshots: chosen files' }).getByRole('listitem')
  const names = await photos.allTextContents()
  expect(names).toEqual(expect.arrayContaining(['127-0-0-1-desktop-1.jpg', '127-0-0-1-phone-1.jpg']))
  expect(names.length).toBeGreaterThanOrEqual(4)
  expect(names.length).toBeLessThanOrEqual(12)
  await expect(page.getByRole('list', { name: 'Logo (optional): chosen files' }).getByRole('listitem')).toHaveText(['logo.png'])
  await expect(page.getByRole('list', { name: 'Fonts (optional): chosen files' }).getByRole('listitem')).toHaveText(['TestBrand-700.woff2'])

  // The colors and the font name show
  const colors = page.getByRole('list', { name: 'Colors from your site' })
  await expect(colors.getByRole('listitem', { name: '#D62828' })).toBeVisible()
  await expect(colors.getByRole('listitem', { name: '#219EBC' })).toBeVisible()
  await expect(page.getByText('Fonts: TestBrand, Georgia')).toBeVisible()

  // A grabbed screenshot can be removed like any upload
  await page.getByRole('button', { name: 'Remove 127-0-0-1-desktop-1.jpg' }).click()
  await expect(photos).toHaveCount(names.length - 1)

  // Start the video: the files are in assets/, the colors and fonts in brief.json
  await page.getByLabel('Brand name').fill('Test Brand')
  await page.getByRole('button', { name: 'Make my video' }).click()
  await expect(page.getByRole('heading', { name: 'Making your video' })).toBeVisible()

  const [jobId] = readdirSync(join(dirs.userData, 'jobs'))
  const jobDir = join(dirs.userData, 'jobs', jobId)
  const assets = readdirSync(join(jobDir, 'assets'))
  expect(assets).toEqual(expect.arrayContaining(['logo.png', 'TestBrand-700.woff2', '127-0-0-1-phone-1.jpg']))
  expect(assets).not.toContain('127-0-0-1-desktop-1.jpg')
  const brief = JSON.parse(readFileSync(join(jobDir, 'brief.json'), 'utf8'))
  expect(brief.site.url).toBe(siteUrl)
  expect(brief.site.colors).toEqual(expect.arrayContaining(['#D62828', '#219EBC', '#FFF8EC']))
  expect(brief.site.fonts).toEqual(['TestBrand', 'Georgia'])
  expect(readFileSync(join(jobDir, 'CLAUDE.md'), 'utf8')).toContain("## Colors and fonts from the user's website")

  await page.getByRole('button', { name: 'Cancel' }).click()
  await page.getByRole('button', { name: 'Yes, stop' }).click()
  await expect(page.getByRole('heading', { name: 'Add your stuff' })).toBeVisible()
})

test('bad links and pages that do not open get a plain message', async () => {
  test.setTimeout(90_000)
  await openUploadStep(true)
  const field = page.getByLabel('Your website (optional)')
  const grab = page.getByRole('button', { name: 'Grab from my site' })

  // Not a website address
  await field.fill('file:///C:/Windows/win.ini')
  await grab.click()
  await expect(page.getByRole('alert')).toHaveText("That link doesn't look right. Try one like https://yoursite.com.")

  // A page that isn't there (the server is closed first)
  await new Promise<void>((resolve) => server.close(() => resolve()))
  server.listen(0)
  await field.fill(siteUrl)
  await grab.click()
  await expect(page.getByRole('alert')).toHaveText(
    "Couldn't open that page. Check the link, or upload screenshots instead.",
    { timeout: 60_000 }
  )
  await expect(page.getByRole('list', { name: 'Photos and screenshots: chosen files' })).toHaveCount(0)
  // Nothing is left behind from the failed grab
  const grabs = join(dirs.userData, 'grabs')
  expect(existsSync(grabs) ? readdirSync(grabs) : []).toEqual([])
})

test('pages on this computer are turned down outside tests', async () => {
  await openUploadStep(false)
  await page.getByLabel('Your website (optional)').fill(siteUrl)
  await page.getByRole('button', { name: 'Grab from my site' }).click()
  await expect(page.getByRole('alert')).toHaveText(
    'Wrenn can only open public websites, not pages on this computer or your home network.'
  )
})
