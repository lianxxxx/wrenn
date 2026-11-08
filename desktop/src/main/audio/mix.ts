// Mixes music and sound effects into a finished (silent) MP4 with one ffmpeg command.
//
// What the ffmpeg command does:
// 1. Music: looped if it's too short, cut to the video length, made quieter,
//    faded in (0.3 s) and out (1.5 s).
// 2. Each hit gets its effect, delayed so the effect's loud moment lands on the hit's time.
// 3. The music dips a little under the effects (ducking, "sidechaincompress").
// 4. A limiter stops anything from being too loud, then AAC audio goes into the MP4.
//    The picture is copied as it is (not encoded again), so it stays sharp and it's fast.

import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { rename, rm } from 'fs/promises'

import { getFfmpegPath } from '../render/render'
import type { Hit, SfxFile, SfxType } from './sounds'

export type MixOptions = {
  /** The silent MP4. It is replaced by the version with sound. */
  videoFile: string
  /** Video length in seconds */
  duration: number
  /** Song to use, or undefined for no music */
  musicFile?: string
  hits: Hit[]
  sfx: Map<SfxType, SfxFile[]>
  signal?: AbortSignal
}

// How loud things are (1 = as the file is). Songs are usually mastered loud,
// so the music sits well under the effects.
const MUSIC_VOLUME = 0.35
const SFX_VOLUME = 0.8
const FADE_IN = 0.3
const FADE_OUT = 1.5
// Shortest piece of an effect worth playing when its start has to be cut off (seconds)
const MIN_SFX_LEFT = 0.1
const MIX_TIME_LIMIT_MS = 2 * 60 * 1000

// Same format for every sound before they're mixed
const FORMAT = 'aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo'

// Runs ffmpeg and resolves with its log. Rejects if it fails or the signal aborts.
function runFfmpeg(args: string[], signal?: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError())
    const ffmpeg = spawn(getFfmpegPath(), args, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true })
    let log = ''
    ffmpeg.stderr.on('data', (chunk) => (log = (log + String(chunk)).slice(-8000)))

    const onAbort = (): void => {
      ffmpeg.kill('SIGKILL')
    }
    signal?.addEventListener('abort', onAbort, { once: true })

    // Safety net: mixing takes seconds, so if ffmpeg is still going after this, it's stuck
    let tooLong = false
    const timer = setTimeout(() => {
      tooLong = true
      ffmpeg.kill('SIGKILL')
    }, MIX_TIME_LIMIT_MS)

    ffmpeg.on('error', reject)
    ffmpeg.on('close', (code) => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      if (signal?.aborted) reject(abortError())
      else if (tooLong) reject(new Error(`ffmpeg took too long to mix the sound\n${log}`))
      else if (code === 0) resolve(log)
      else reject(new Error(`ffmpeg exited with code ${code}\n${log}`))
    })
  })
}

function abortError(): Error {
  const error = new Error('Sound mix cancelled')
  error.name = 'AbortError'
  return error
}

// The real length of a video file, read from ffmpeg's info ("Duration: 00:00:15.00").
// Returns undefined if ffmpeg doesn't say.
export async function videoDuration(file: string): Promise<number | undefined> {
  // ffmpeg with only an input "fails" (no output given) but still prints the info we need
  const log = await new Promise<string>((resolve) => {
    const ffmpeg = spawn(getFfmpegPath(), ['-hide_banner', '-i', file], {
      stdio: ['ignore', 'ignore', 'pipe'],
      windowsHide: true
    })
    let text = ''
    ffmpeg.stderr.on('data', (chunk) => (text += String(chunk)))
    ffmpeg.on('error', () => resolve(''))
    ffmpeg.on('close', () => resolve(text))
  })
  const m = /Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(log)
  if (!m) return undefined
  const seconds = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
  return seconds > 0 ? seconds : undefined
}

// Seconds with 3 decimals, the way ffmpeg likes them
const sec = (n: number): string => n.toFixed(3)

// Adds the sound. Does nothing when there's no music and no effects (the video stays silent).
// Returns true if sound was added.
export async function mixSound({ videoFile, duration, musicFile, hits, sfx, signal }: MixOptions): Promise<boolean> {
  // Find a file for each hit. Variants take turns: the 1st pop uses pop-1, the 2nd pop-2, and so on.
  const used = new Map<SfxType, number>()
  const placed: { file: SfxFile; t: number }[] = []
  for (const hit of hits) {
    const choices = sfx.get(hit.type)
    if (!choices?.length) continue
    const n = used.get(hit.type) ?? 0
    used.set(hit.type, n + 1)
    const file = choices[n % choices.length]
    // An effect that would have to start before 0 s (a riser right at the start) gets its
    // beginning cut off. If we don't know its length, or too little would be left, skip it:
    // an effect cut down to nothing makes ffmpeg wait forever.
    const cut = file.hit - hit.t
    if (cut > 0 && (file.length === undefined || file.length - cut < MIN_SFX_LEFT)) continue
    placed.push({ file, t: hit.t })
  }

  if (!musicFile && placed.length === 0) return false

  const inputs: string[] = ['-i', videoFile]
  const filters: string[] = []
  let next = 1 // input 0 is the video

  // Music
  let musicLabel: string | undefined
  if (musicFile) {
    // -stream_loop -1 repeats the song forever, atrim below cuts it to the video length
    inputs.push('-stream_loop', '-1', '-i', musicFile)
    const fadeOutStart = Math.max(0, duration - FADE_OUT)
    filters.push(
      `[${next}:a]${FORMAT},atrim=0:${sec(duration)},asetpts=PTS-STARTPTS,volume=${MUSIC_VOLUME},` +
        `afade=t=in:st=0:d=${FADE_IN},afade=t=out:st=${sec(fadeOutStart)}:d=${FADE_OUT}[music]`
    )
    musicLabel = '[music]'
    next++
  }

  // Effects: each one delayed so its loud moment ("hit") lands on t
  const sfxLabels: string[] = []
  placed.forEach(({ file, t }, i) => {
    inputs.push('-i', file.path)
    const delay = t - file.hit
    // Cut the beginning off if it would start before 0 s (checked above that enough is left)
    const trim = delay < 0 ? `atrim=start=${sec(-delay)},asetpts=PTS-STARTPTS,` : ''
    const delayMs = Math.round(Math.max(0, delay) * 1000)
    filters.push(`[${next}:a]${FORMAT},${trim}volume=${SFX_VOLUME},adelay=${delayMs}:all=1[s${i}]`)
    sfxLabels.push(`[s${i}]`)
    next++
  })

  // All effects on one track. normalize=0 keeps each effect at its own volume.
  let sfxLabel: string | undefined
  if (sfxLabels.length === 1) {
    sfxLabel = sfxLabels[0]
  } else if (sfxLabels.length > 1) {
    filters.push(`${sfxLabels.join('')}amix=inputs=${sfxLabels.length}:duration=longest:normalize=0[sfx]`)
    sfxLabel = '[sfx]'
  }

  // Put music and effects together
  let mixLabel: string
  if (musicLabel && sfxLabel) {
    // One copy of the effects goes into the mix, the other tells the compressor when to dip the music.
    // Gentle: about 4:1 above the threshold, quick to dip, slow to come back.
    // The key copy is padded with silence: if it ended, the compressor would stop the music too
    filters.push(`${sfxLabel}asplit=2[sfxmix][key0]`)
    filters.push(`[key0]apad[sfxkey]`)
    filters.push(`${musicLabel}[sfxkey]sidechaincompress=threshold=0.05:ratio=4:attack=5:release=300[ducked]`)
    filters.push(`[ducked][sfxmix]amix=inputs=2:duration=longest:normalize=0[mixed]`)
    mixLabel = '[mixed]'
  } else {
    mixLabel = (musicLabel ?? sfxLabel) as string
  }

  // Pad with silence, then cut, so the sound is exactly as long as the video (never shorter,
  // never longer, so the picture is never cut). Then the limiter (about -1 dB, no auto gain).
  filters.push(`${mixLabel}apad,atrim=0:${sec(duration)},alimiter=limit=0.89:level=disabled[aout]`)

  const tempFile = videoFile.replace(/\.mp4$/i, '') + '.sound.mp4'
  const args = [
    '-y',
    '-hide_banner',
    ...inputs,
    '-filter_complex', filters.join(';'),
    '-map', '0:v',
    '-map', '[aout]',
    // Copy the picture as it is
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-ar', '48000',
    '-ac', '2',
    // Moves the file index to the start so the video plays before it's fully loaded
    '-movflags', '+faststart',
    tempFile
  ]

  try {
    await runFfmpeg(args, signal)
    // Swap the silent video for the one with sound (rename replaces the old file)
    await rename(tempFile, videoFile)
    return true
  } catch (error) {
    // Only delete the new file if the silent one is still there, so one video always survives
    if (existsSync(videoFile)) await rm(tempFile, { force: true }).catch(() => {})
    throw error
  }
}
