// Makes a song with ElevenLabs Music, using the user's own key from Settings.
// API: POST https://api.elevenlabs.io/v1/music, header xi-api-key,
// body { prompt, music_length_ms (3000 to 600000), force_instrumental }, the answer is the MP3 itself.
// Never log or show the key.

import { writeFile } from 'fs/promises'

const MUSIC_URL = 'https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128'
// Making a song can take a while, but not forever
const TIME_LIMIT_MS = 3 * 60 * 1000
const MIN_MS = 3000
const MAX_MS = 600000

// What each vibe sounds like. Always instrumental: no singing over the brand's video.
const VIBE_PROMPTS: Record<string, string> = {
  playful: 'Playful, bouncy, upbeat pop with bright plucks, claps and a fun bass line',
  clean: 'Clean, modern, minimal electronic with soft synths and a tight steady beat',
  bold: 'Bold, energetic, punchy electronic with big drums and a driving bass',
  calm: 'Calm, warm, gentle lo-fi with soft keys and a relaxed beat'
}

export function musicPrompt(vibe: string): string {
  const style = VIBE_PROMPTS[vibe] ?? VIBE_PROMPTS.clean
  return `${style}. Instrumental only, no vocals. Background music for a short product showreel video, with a clear ending.`
}

// Plain reason for the log (never includes the key)
function reasonFor(status: number): string {
  if (status === 401 || status === 403) return 'the key was not accepted'
  if (status === 402) return 'ElevenLabs asked for payment (no credits, or the plan has no Music)'
  if (status === 429) return 'too many requests'
  if (status === 422) return 'ElevenLabs did not accept the request'
  return `ElevenLabs answered with status ${status}`
}

// ElevenLabs' own error message, so we know the real cause. Short, and never the key.
async function detailFrom(response: Response): Promise<string> {
  try {
    const text = await response.text()
    try {
      const body = JSON.parse(text)
      const detail = body?.detail
      const message = typeof detail === 'string' ? detail : detail?.message ?? detail?.status
      if (message) return String(message).slice(0, 200)
    } catch {
      // Not JSON, use the plain text
    }
    return text.slice(0, 200)
  } catch {
    return ''
  }
}

// Saves the song to outFile. Throws an Error with a plain reason if anything goes wrong.
export async function makeElevenLabsSong(opts: {
  apiKey: string
  vibe: string
  duration: number
  outFile: string
  signal?: AbortSignal
}): Promise<void> {
  if (!opts.apiKey) throw new Error('no ElevenLabs key in Settings')
  const lengthMs = Math.min(MAX_MS, Math.max(MIN_MS, Math.round(opts.duration * 1000)))

  // Stop when the user cancels, or when it takes too long
  const signals = [AbortSignal.timeout(TIME_LIMIT_MS)]
  if (opts.signal) signals.push(opts.signal)

  let response: Response
  try {
    response = await fetch(MUSIC_URL, {
      method: 'POST',
      headers: { 'xi-api-key': opts.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: musicPrompt(opts.vibe), music_length_ms: lengthMs, force_instrumental: true }),
      signal: AbortSignal.any(signals)
    })
  } catch (error) {
    if (opts.signal?.aborted) throw error
    const name = (error as Error).name
    throw new Error(name === 'TimeoutError' ? 'it took too long' : 'no connection to ElevenLabs')
  }

  if (!response.ok) {
    const detail = await detailFrom(response)
    throw new Error(detail ? `${reasonFor(response.status)}: ${detail}` : reasonFor(response.status))
  }
  const song = Buffer.from(await response.arrayBuffer())
  if (song.length < 1000) throw new Error('ElevenLabs sent back an empty song')
  await writeFile(opts.outFile, song)
}
