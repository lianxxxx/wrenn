// Finding the sounds that ship inside Wrenn, and reading the scene's sound.json.
//
// Layout of the sounds folder (desktop/resources in dev):
//   music/<vibe>/*.mp3   free (CC0) songs, a few per vibe
//   sfx/*.wav            sound effects, for example pop-1.wav, whoosh-2.wav
//   sfx/sfx.json         what each effect is: { "pop-1.wav": { "type": "pop", "hit": 0.0, "length": 0.18 } }
//                        "hit" is the second in the file where the sound peaks (for a riser: its end)

import { app } from 'electron'
import { existsSync } from 'fs'
import { readdir, readFile } from 'fs/promises'
import { dirname, extname, join } from 'path'

import { AUDIO_EXTS } from '../../shared/limits'

// The kinds of sound effects a scene may ask for
export const SFX_TYPES = ['pop', 'whoosh', 'click', 'impact', 'riser'] as const
export type SfxType = (typeof SFX_TYPES)[number]

// One moment in the video where an effect should land
export type Hit = { t: number; type: SfxType }

// One effect file, with where its loud moment is and how long it is (when sfx.json says)
export type SfxFile = { path: string; type: SfxType; hit: number; length?: number }

const MAX_HITS = 60

// The folder that holds music/ and sfx/.
// Packaged app: next to the app in process.resourcesPath (electron-builder "extraResources").
// Dev: desktop/resources, found by walking up from the app folder like templatesDir() does.
export function soundsDir(): string {
  if (app.isPackaged) return process.resourcesPath
  let dir = app.getAppPath()
  for (let i = 0; i < 3; i++) {
    if (existsSync(join(dir, 'resources', 'sfx')) || existsSync(join(dir, 'resources', 'music'))) {
      return join(dir, 'resources')
    }
    dir = dirname(dir)
  }
  return join(app.getAppPath(), 'resources')
}

// A small, stable number from a text (same text, same number, every time).
// Used to pick "a random song" that is the same for the same job.
export function hashText(text: string): number {
  let h = 0
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

// All songs Wrenn ships for this vibe, sorted so the pick is stable
export async function listSongs(vibe: string): Promise<string[]> {
  const dir = join(soundsDir(), 'music', vibe)
  const names = await readdir(dir).catch(() => [] as string[])
  return names
    .filter((n) => AUDIO_EXTS.includes(extname(n).toLowerCase()))
    .sort()
    .map((n) => join(dir, n))
}

function isSfxType(v: unknown): v is SfxType {
  return typeof v === 'string' && (SFX_TYPES as readonly string[]).includes(v)
}

// All effect files, grouped by type. Reads sfx.json when it's there.
// Without sfx.json we guess the type from the file name ("pop-2.wav" is a pop)
// and say the loud moment is at the very start. Risers need sfx.json (their hit is at the end).
export async function listSfx(): Promise<Map<SfxType, SfxFile[]>> {
  const dir = join(soundsDir(), 'sfx')
  const byType = new Map<SfxType, SfxFile[]>()
  const names = (await readdir(dir).catch(() => [] as string[])).filter((n) =>
    AUDIO_EXTS.includes(extname(n).toLowerCase())
  )

  let info: Record<string, { type?: unknown; hit?: unknown; length?: unknown }> = {}
  try {
    const parsed = JSON.parse(await readFile(join(dir, 'sfx.json'), 'utf8'))
    if (parsed && typeof parsed === 'object') info = parsed
  } catch {
    // No sfx.json (or broken): guess from the names below
  }

  for (const name of names.sort()) {
    const entry = info[name]
    let type: SfxType | undefined
    let hit = 0
    let length: number | undefined
    const isSeconds = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0
    if (entry && isSfxType(entry.type)) {
      type = entry.type
      if (isSeconds(entry.hit)) hit = entry.hit
      if (isSeconds(entry.length) && entry.length > 0) length = entry.length
    } else {
      const guess = name.toLowerCase().split(/[-_.]/)[0]
      if (isSfxType(guess) && guess !== 'riser') type = guess
    }
    if (!type) continue
    const list = byType.get(type) ?? []
    list.push({ path: join(dir, name), type, hit, length })
    byType.set(type, list)
  }
  return byType
}

// Reads scene/sound.json. It's optional and written by Claude Code, so we trust nothing:
// a missing file gives no hits, a broken one gives a warning and no hits. Never throws.
export async function readHits(sceneDir: string, duration: number): Promise<Hit[]> {
  const file = join(sceneDir, 'sound.json')
  let text: string
  try {
    text = await readFile(file, 'utf8')
  } catch {
    return []
  }

  try {
    const data = JSON.parse(text)
    if (!data || !Array.isArray(data.hits)) throw new Error('no "hits" list')
    const hits: Hit[] = []
    for (const h of data.hits) {
      const ok = h && typeof h.t === 'number' && Number.isFinite(h.t) && h.t >= 0 && h.t <= duration
      if (!ok || !isSfxType(h.type)) {
        console.warn('sound.json: skipped a hit that is out of range or has an unknown type:', JSON.stringify(h))
        continue
      }
      hits.push({ t: h.t, type: h.type })
    }
    hits.sort((a, b) => a.t - b.t)
    if (hits.length > MAX_HITS) {
      console.warn(`sound.json: ${hits.length} hits, only the first ${MAX_HITS} are used`)
      hits.length = MAX_HITS
    }
    return hits
  } catch (error) {
    console.warn('sound.json is broken, the video gets no sound effects:', (error as Error).message)
    return []
  }
}
