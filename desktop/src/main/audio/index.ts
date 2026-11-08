// Adds music and sound effects to a rendered video. jobs.ts calls addSound() once the
// silent MP4 is ready. Sound is a bonus: if something is missing, we do less (sfx only,
// or no sound at all), and the video always still finishes.

import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

import type { MusicChoice } from '../../preload'
import { getSettings } from '../settings'
import { makeElevenLabsSong } from './elevenlabs'
import { mixSound, videoDuration } from './mix'
import { hashText, listSfx, listSongs, readHits } from './sounds'

export { soundsDir } from './sounds'

export type AddSoundOptions = {
  jobId: string
  /** The job folder (has scene/ and maybe music/own.<ext>) */
  jobDir: string
  /** The silent MP4, replaced in place */
  videoFile: string
  music: MusicChoice
  vibe: string
  /** Length the user picked, used if the video's real length can't be read */
  duration: number
  /** Only for music "own": the song already copied into the job folder */
  ownSongFile?: string
  signal?: AbortSignal
}

// One of Wrenn's own songs for this vibe. The job id picks which, so the same job
// always gets the same song.
async function wrennSong(vibe: string, jobId: string): Promise<string | undefined> {
  const songs = await listSongs(vibe)
  if (songs.length === 0) {
    console.warn(`No Wrenn songs found for the "${vibe}" vibe, using sound effects only.`)
    return undefined
  }
  return songs[hashText(jobId) % songs.length]
}

async function pickMusic(o: AddSoundOptions, duration: number): Promise<string | undefined> {
  if (o.music === 'none') return undefined

  if (o.music === 'own') {
    if (o.ownSongFile && existsSync(o.ownSongFile)) return o.ownSongFile
    console.warn('The own song is missing from the job folder, using a Wrenn song instead.')
    return wrennSong(o.vibe, o.jobId)
  }

  if (o.music === 'elevenlabs') {
    const outFile = join(o.jobDir, 'music', 'elevenlabs.mp3')
    try {
      await mkdir(join(o.jobDir, 'music'), { recursive: true })
      const { voiceoverKey } = await getSettings()
      await makeElevenLabsSong({ apiKey: voiceoverKey, vibe: o.vibe, duration, outFile, signal: o.signal })
      return outFile
    } catch (error) {
      // A cancel should stop everything, not fall back
      if (o.signal?.aborted) throw error
      console.warn(`ElevenLabs song failed (${(error as Error).message}), using a Wrenn song instead.`)
      return wrennSong(o.vibe, o.jobId)
    }
  }

  return wrennSong(o.vibe, o.jobId)
}

// Returns true if the video now has sound. Throws only if the mix itself failed or was cancelled,
// and then the silent video is left untouched.
export async function addSound(o: AddSoundOptions): Promise<boolean> {
  // The scene may be a bit longer or shorter than the length the user picked, so trust the file
  const duration = (await videoDuration(o.videoFile)) ?? o.duration

  const musicFile = await pickMusic(o, duration)
  const hits = await readHits(join(o.jobDir, 'scene'), duration)
  const sfx = await listSfx()

  return mixSound({ videoFile: o.videoFile, duration, musicFile, hits, sfx, signal: o.signal })
}
