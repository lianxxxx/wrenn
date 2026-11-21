// What a user sees and clicks: setup, Home, the template path and Settings.
// None of these start a real video job, so Claude Code never runs and no tokens are used.

import { expect, test, type ElectronApplication, type Page } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'
import { launchApp, makeTempDirs, makeVideo, removeTempDirs, seedSettings, type TestDirs } from './helpers'

let dirs: TestDirs
let app: ElectronApplication | undefined

test.beforeEach(() => {
  dirs = makeTempDirs()
})

test.afterEach(async () => {
  await app?.close()
  app = undefined
  removeTempDirs(dirs)
})

// Starts the app straight on Home (setup marked done)
async function openHome(): Promise<Page> {
  seedSettings(dirs, { setupDone: true })
  const launched = await launchApp(dirs)
  app = launched.app
  await expect(launched.page.getByRole('heading', { name: /What are we/ })).toBeVisible()
  return launched.page
}

test('first launch shows the setup screen', async () => {
  // No settings file: a brand new install. Only checks the screen shows, never clicks Sign in.
  const launched = await launchApp(dirs)
  app = launched.app
  const page = launched.page
  await expect(page.getByRole('heading', { name: "Let's get you set up" })).toBeVisible()
  await expect(page.getByText('Install Claude Code').first()).toBeVisible()
  await expect(page.getByLabel('ElevenLabs key (optional)')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
})

test('Home shows both cards and the videos in the output folder', async () => {
  // A video already in the (temp) Videos\Wrenn folder. "square" in the name sets its size.
  makeVideo(join(dirs.output, 'wrenn square test.mp4'))
  const page = await openHome()

  await expect(page.getByRole('button', { name: /Make from a template/ })).toBeEnabled()

  const edit = page.getByRole('button', { name: /Edit my video/ })
  await expect(edit).toBeDisabled()
  await expect(edit).toContainText('Coming soon')

  await expect(page.getByRole('heading', { name: 'Your videos' })).toBeVisible()
  // No sidecar, so no brand name: the title is "Video, <date>"
  await expect(page.getByRole('button', { name: /Video, / })).toBeVisible()
  await expect(page.getByText('Videos you make will show up here.')).toHaveCount(0)
})

test('template path: options, music choices and the upload step', async () => {
  const page = await openHome()

  // Step 1: pick the template
  await page.getByRole('button', { name: /Make from a template/ }).click()
  await expect(page.getByRole('heading', { name: 'Pick a template' })).toBeVisible()
  await page.getByRole('button', { name: /Feature walkthrough/ }).click()

  // Step 2: size, length, vibe and music
  await expect(page.getByRole('heading', { name: 'How should it look?' })).toBeVisible()
  for (const group of ['Size', 'Length', 'Vibe', 'Music']) {
    await expect(page.getByRole('group', { name: group })).toBeVisible()
  }
  const music = page.getByRole('group', { name: 'Music' })
  const next = page.getByRole('button', { name: 'Next' })

  // Wrenn's music is picked to start with, and Next works
  await expect(music.getByRole('radio', { name: /Wrenn's music/ })).toBeChecked()
  await expect(next).toBeEnabled()

  // The radio buttons are hidden behind cards, so click the card text like a user would
  await page.getByText('YouTube 16:9').click()
  await expect(page.getByRole('radio', { name: /YouTube 16:9/ })).toBeChecked()
  await page.getByText('1 min').click()
  await expect(page.getByRole('radio', { name: /1 min/ })).toBeChecked()
  await page.getByText('Bold', { exact: true }).click()
  await expect(page.getByRole('radio', { name: /^Bold/ })).toBeChecked()

  // Your own song: the song box shows and Next waits for a song
  await music.getByText('Your own song').click()
  await expect(page.getByText('Your song', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Browse for your song' })).toBeVisible()
  await expect(page.getByText('Add your song, or pick other music.')).toBeVisible()
  await expect(next).toBeDisabled()

  // A new song with no ElevenLabs key: asks for the key, Next waits
  await music.getByText('A new song').click()
  await expect(page.getByText('To make a new song, Wrenn needs your ElevenLabs key.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add it in Settings' })).toBeVisible()
  await expect(page.getByText('Add your ElevenLabs key, or pick other music.')).toBeVisible()
  await expect(next).toBeDisabled()

  // No music: fine, Next works
  await music.getByText('No music').click()
  await expect(page.getByText('Your song', { exact: true })).toHaveCount(0)
  await expect(next).toBeEnabled()
  await next.click()

  // Step 3: the upload screen. With no files, Make my video can't be pressed.
  await expect(page.getByRole('heading', { name: 'Add your stuff' })).toBeVisible()
  await expect(page.getByLabel('Brand name')).toBeVisible()
  await expect(page.getByText('Photos and screenshots')).toBeVisible()
  await expect(page.getByText('Fonts (optional)')).toBeVisible()
  await expect(page.getByText('Add at least one file and your brand name.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Make my video' })).toBeDisabled()

  // A brand name alone isn't enough
  await page.getByLabel('Brand name').fill('Test Brand')
  await expect(page.getByRole('button', { name: 'Make my video' })).toBeDisabled()
})

test('Settings keeps the ElevenLabs key, encrypted on disk', async () => {
  const key = 'sk_test_wrenn_1234567890abcdef'
  let page = await openHome()

  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  const field = page.getByLabel('ElevenLabs key (optional)')
  await field.fill(key)
  // The key saves when you click away from the box
  await field.blur()
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()

  const encryption = await app!.evaluate(({ safeStorage }) => safeStorage.isEncryptionAvailable())

  // Close and open again with the same folders
  await app!.close()
  const launched = await launchApp(dirs)
  app = launched.app
  page = launched.page
  await expect(page.getByRole('heading', { name: /What are we/ })).toBeVisible()
  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByLabel('ElevenLabs key (optional)')).toHaveValue(key)

  // On disk the key is never plain text when Windows can encrypt it
  const onDisk = readFileSync(join(dirs.userData, 'settings.json'), 'utf8')
  if (encryption) {
    expect(onDisk).not.toContain(key)
    expect(JSON.parse(onDisk).voiceoverKeyEncrypted).toBeTruthy()
  } else {
    test.info().annotations.push({ type: 'note', description: 'safeStorage not available, key saved as plain text' })
  }
})
