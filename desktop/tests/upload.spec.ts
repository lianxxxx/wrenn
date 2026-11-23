// Step 3 of the template path ("Add your stuff"): the fonts box and the "What does it do?" box.
// Nothing here presses "Make my video", so no job starts and Claude Code never runs.

import { expect, test, type ElectronApplication, type Page } from '@playwright/test'
import { join } from 'path'
import { MAX_ABOUT } from '../src/shared/limits'
import { launchApp, makeFontFile, makePicture, makeTempDirs, removeTempDirs, seedSettings, type TestDirs } from './helpers'

let dirs: TestDirs
let app: ElectronApplication
let page: Page

test.beforeEach(async () => {
  dirs = makeTempDirs()
  seedSettings(dirs, { setupDone: true })
  ;({ app, page } = await launchApp(dirs, { hideClaude: true }))
  await expect(page.getByRole('heading', { name: /What are we/ })).toBeVisible()

  // Home, pick the template, keep the starting options, on to step 3
  await page.getByRole('button', { name: /Make from a template/ }).click()
  await page.getByRole('button', { name: /Feature walkthrough/ }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByRole('heading', { name: 'Add your stuff' })).toBeVisible()
})

test.afterEach(async () => {
  await app.close()
  removeTempDirs(dirs)
})

test('"What does it do?" counts letters and stops at the limit', async () => {
  const about = page.getByLabel('What does it do? (optional)')
  await expect(about).toHaveValue('')
  await expect(page.getByText(`0/${MAX_ABOUT}`, { exact: true })).toBeVisible()

  await about.fill('Turns screenshots into videos.')
  await expect(page.getByText(`30/${MAX_ABOUT}`, { exact: true })).toBeVisible()

  // Typing past the limit stops at the limit
  await about.fill('')
  await about.pressSequentially('a'.repeat(MAX_ABOUT + 5), { delay: 0 })
  await expect(about).toHaveValue('a'.repeat(MAX_ABOUT))
  await expect(page.getByText(`${MAX_ABOUT}/${MAX_ABOUT}`, { exact: true })).toBeVisible()
})

test('the fonts box takes font files and turns down the rest', async () => {
  await expect(page.getByText('Fonts (optional)')).toBeVisible()
  await expect(page.getByText("Your brand's font files. Skip this and Wrenn picks a font for you.")).toBeVisible()
  await expect(page.getByRole('button', { name: 'Browse for fonts (optional)' })).toBeVisible()

  // The hidden file input behind Browse
  const input = page.locator('input[type="file"][accept=".woff2,.woff,.ttf,.otf"]')
  const chosen = page.getByRole('list', { name: 'Fonts (optional): chosen files' })

  // A picture isn't a font
  await input.setInputFiles(makePicture(join(dirs.root, 'photo.png')))
  await expect(page.getByText("Wrenn can't use that file type yet. Try a WOFF2, WOFF, TTF or OTF font.")).toBeVisible()
  await expect(chosen).toHaveCount(0)

  // All four kinds of font are taken, upper case names too
  const fonts = ['Brand.woff2', 'Brand.woff', 'Brand.ttf', 'BRAND-BOLD.OTF'].map((name) =>
    makeFontFile(join(dirs.root, name))
  )
  await input.setInputFiles(fonts)
  await expect(page.getByText("Wrenn can't use that file type yet.", { exact: false })).toHaveCount(0)
  await expect(chosen.getByRole('listitem')).toHaveText(['Brand.woff2', 'Brand.woff', 'Brand.ttf', 'BRAND-BOLD.OTF'])

  // A mix: the font is added, and the message says one was left out
  await input.setInputFiles([makeFontFile(join(dirs.root, 'Extra.ttf')), join(dirs.root, 'photo.png')])
  await expect(page.getByText("Wrenn can't use that file type yet. Try a WOFF2, WOFF, TTF or OTF font.")).toBeVisible()
  await expect(chosen.getByRole('listitem')).toHaveCount(5)

  await page.getByRole('button', { name: 'Remove all' }).click()
  await expect(chosen).toHaveCount(0)
})
