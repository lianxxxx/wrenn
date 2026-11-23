// Saves and loads Wrenn's settings as a small JSON file on this computer.
// File: <userData>\settings.json (on Windows: %APPDATA%\Wrenn\settings.json).
// No database, no server: just this one file.
//
// The ElevenLabs key is encrypted with Windows' own protection (safeStorage) when it's
// available, so the file never holds the key as plain text. Never log the key.

import { app, safeStorage } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'

import type { Settings } from '../preload'

const DEFAULTS: Settings = { setupDone: false, voiceoverKey: '' }

// What actually goes into the file. The key is in one of the two key fields, never both.
type SettingsFile = {
  setupDone?: boolean
  // base64 of the encrypted key (the normal case)
  voiceoverKeyEncrypted?: string
  // plain key, only when encryption isn't available on this computer
  voiceoverKey?: string
}

// Kept in memory after the first read, so we don't read the file every time
let cache: Settings | null = null

// Saves run one after another, so two quick saves can't trip over each other
let saveQueue: Promise<unknown> = Promise.resolve()

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

// Turns the key back into plain text. Returns '' if it can't (for example the file
// was copied from another computer, where the encryption doesn't match).
// Uses the async version: Electron is removing the old one. It still opens keys saved the old way.
async function decryptKey(file: SettingsFile): Promise<string> {
  if (typeof file.voiceoverKeyEncrypted === 'string' && file.voiceoverKeyEncrypted) {
    try {
      const { result } = await safeStorage.decryptStringAsync(Buffer.from(file.voiceoverKeyEncrypted, 'base64'))
      return result
    } catch {
      return ''
    }
  }
  if (typeof file.voiceoverKey === 'string') return file.voiceoverKey
  return ''
}

export async function getSettings(): Promise<Settings> {
  if (cache) return { ...cache }

  let settings: Settings = { ...DEFAULTS }
  try {
    const text = await fs.readFile(settingsPath(), 'utf8')
    const file = JSON.parse(text) as SettingsFile
    if (file && typeof file === 'object') {
      settings = {
        setupDone: typeof file.setupDone === 'boolean' ? file.setupDone : DEFAULTS.setupDone,
        voiceoverKey: await decryptKey(file)
      }
    }
  } catch {
    // Missing or broken file: start from the defaults instead of crashing
  }

  cache = settings
  return { ...settings }
}

// Only keeps keys we know, with the right type. The changes come from the page,
// so anything else is ignored.
function cleanChanges(changes: unknown): Partial<Settings> {
  const clean: Partial<Settings> = {}
  if (!changes || typeof changes !== 'object') return clean
  const input = changes as Record<string, unknown>
  if (typeof input.setupDone === 'boolean') clean.setupDone = input.setupDone
  // API keys are short. A very long string is a mistake, so it's ignored.
  if (typeof input.voiceoverKey === 'string' && input.voiceoverKey.length <= 500) {
    clean.voiceoverKey = input.voiceoverKey.trim()
  }
  return clean
}

// Writes the file safely: first to a temp file, then swaps it in. If the app closes
// halfway, the old settings file is still whole.
async function writeFile(settings: Settings): Promise<void> {
  const file: SettingsFile = { setupDone: settings.setupDone }
  if (settings.voiceoverKey) {
    if (await safeStorage.isAsyncEncryptionAvailable()) {
      file.voiceoverKeyEncrypted = (await safeStorage.encryptStringAsync(settings.voiceoverKey)).toString('base64')
    } else {
      // Fallback: this computer can't encrypt, so the key is saved as plain text
      file.voiceoverKey = settings.voiceoverKey
    }
  }

  const target = settingsPath()
  const temp = `${target}.tmp`
  await fs.mkdir(app.getPath('userData'), { recursive: true })
  await fs.writeFile(temp, JSON.stringify(file, null, 2), 'utf8')
  await fs.rename(temp, target)
}

// The changes come straight from the page, so cleanChanges checks them first
export async function saveSettings(changes: unknown): Promise<Settings> {
  const run = async (): Promise<Settings> => {
    const current = await getSettings()
    const next: Settings = { ...current, ...cleanChanges(changes) }
    await writeFile(next)
    cache = next
    return { ...next }
  }
  const result = saveQueue.then(run, run)
  // Keep the queue going even if this save fails
  saveQueue = result.catch(() => undefined)
  return result
}
