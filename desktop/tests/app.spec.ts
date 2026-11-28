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
  // No sidebar during setup
  await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0)
})

test('the sidebar moves between Home, Templates, Your videos and Settings', async () => {
  makeVideo(join(dirs.output, 'wrenn square test.mp4'))
  const page = await openHome()
  const nav = page.getByRole('navigation', { name: 'Main' })
  const item = (name: string) => nav.getByRole('button', { name, exact: true })

  await expect(item('Home')).toHaveAttribute('aria-current', 'page')

  await item('Templates').click()
  await expect(page.getByRole('heading', { name: 'Pick a template' })).toBeVisible()
  await expect(item('Templates')).toHaveAttribute('aria-current', 'page')
  await expect(item('Home')).not.toHaveAttribute('aria-current', 'page')
  // Sidebar screens have no Back link: the sidebar is the way around
  await expect(page.getByRole('button', { name: 'Back' })).toHaveCount(0)

  await item('Your videos').click()
  await expect(page.getByRole('heading', { name: 'Your videos', level: 1 })).toBeVisible()
  await expect(page.getByRole('button', { name: /Video, / })).toBeVisible()

  await item('Settings').click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await expect(item('Settings')).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('button', { name: 'Back' })).toHaveCount(0)

  await item('Home').click()
  await expect(page.getByRole('heading', { name: /What are we/ })).toBeVisible()
})

test('Your videos with no videos yet points to making one', async () => {
  const page = await openHome()
  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Your videos', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Your videos', level: 1 })).toBeVisible()
  await expect(page.getByText('Nothing here yet.')).toBeVisible()
  await expect(page.getByText('Click one to watch it', { exact: false })).toHaveCount(0)
  await page.getByRole('button', { name: 'Make a video' }).click()
  await expect(page.getByRole('heading', { name: 'Pick a template' })).toBeVisible()
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
  await expect(page.getByLabel('What does it do? (optional)')).toBeVisible()
  await expect(page.getByText('Add your brand name and at least one screenshot or recording.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Make my video' })).toBeDisabled()

  // A brand name alone isn't enough
  await page.getByLabel('Brand name').fill('Test Brand')
  await expect(page.getByText('Add at least one screenshot or recording.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Make my video' })).toBeDisabled()
})

test('Settings keeps the ElevenLabs key, encrypted on disk', async () => {
  const key = 'sk_test_wrenn_1234567890abcdef'
  let page = await openHome()

  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Settings' }).click()
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
  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Settings' }).click()
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

test('My own prompt: save a template, see its card, pick it, delete it', async () => {
  let page = await openHome()
  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Templates', exact: true }).click()
  await page.getByRole('button', { name: /My own prompt/ }).click()
  await expect(page.getByRole('heading', { name: 'My own prompt' })).toBeVisible()

  // Save waits for a name and a prompt
  const save = page.getByRole('button', { name: 'Save template' })
  await expect(save).toBeDisabled()
  await page.getByLabel('Template name').fill('Neon launch')
  await page.getByLabel('Your prompt').fill('Dark and loud. Each screen slams in on the beat.')
  await page.getByLabel("Where it's from (optional)").fill('@somecreator')
  await save.click()

  // Back on the pick screen with the new card
  await expect(page.getByRole('heading', { name: 'Pick a template' })).toBeVisible()
  const card = page.getByRole('button', { name: /Neon launch/ }).first()
  await expect(card).toContainText('Inspired by @somecreator')

  // Saved on disk, so it's still there after closing and opening the app
  const saved = JSON.parse(readFileSync(join(dirs.userData, 'custom-templates.json'), 'utf8'))
  expect(saved.templates).toHaveLength(1)
  expect(saved.templates[0]).toMatchObject({ name: 'Neon launch', credit: '@somecreator' })
  await app?.close()
  const launched = await launchApp(dirs)
  app = launched.app
  page = launched.page
  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Templates', exact: true }).click()
  await expect(page.getByRole('button', { name: /Neon launch/ }).first()).toBeVisible()

  // Picking it goes through the same steps as Wrenn's own templates
  await page.getByRole('button', { name: /Neon launch/ }).first().click()
  await expect(page.getByRole('heading', { name: 'How should it look?' })).toBeVisible()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByRole('heading', { name: 'Add your stuff' })).toBeVisible()
  await page.getByRole('button', { name: 'Back' }).click()
  await page.getByRole('button', { name: 'Back' }).click()

  // Delete asks first, on the card. "Keep it" keeps it.
  await page.getByRole('button', { name: 'Delete Neon launch' }).click()
  await expect(page.getByText('Delete "Neon launch"?')).toBeVisible()
  await page.getByRole('button', { name: 'Keep it' }).click()
  await expect(page.getByRole('button', { name: /Neon launch/ }).first()).toBeVisible()
  // Focus goes back to the trash button, and Escape works the same way
  await expect(page.getByRole('button', { name: 'Delete Neon launch' })).toBeFocused()
  await page.getByRole('button', { name: 'Delete Neon launch' }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Delete Neon launch' })).toBeFocused()

  await page.getByRole('button', { name: 'Delete Neon launch' }).click()
  await page.getByRole('button', { name: 'Yes, delete' }).click()
  await expect(page.getByRole('button', { name: /Neon launch/ })).toHaveCount(0)
  expect(JSON.parse(readFileSync(join(dirs.userData, 'custom-templates.json'), 'utf8')).templates).toEqual([])
})
