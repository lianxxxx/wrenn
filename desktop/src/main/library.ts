// The video library: every finished MP4 in Videos\Wrenn.
// No database: each video can have a small "sidecar" file next to it
// ("my video.mp4.json") that remembers what kind of video it is and its size.

import { app } from 'electron'
import { mkdirSync, promises as fs } from 'fs'
import { basename, join } from 'path'

import type { SizeId, VideoInfo } from '../preload'

const SIZES: SizeId[] = ['reels', 'feed', 'square', 'youtube']

// What the sidecar file holds
type Sidecar = {
  kind: 'template' | 'edit'
  size: SizeId
  createdAt: string
}

// Where Wrenn saves videos. Makes the folder if it isn't there yet.
export function outputDir(): string {
  // Test-only: Playwright tests use a temp folder, so they never write in the real Videos folder
  const dir = process.env.WRENN_TEST_OUTPUT_DIR || join(app.getPath('videos'), 'Wrenn')
  mkdirSync(dir, { recursive: true })
  return dir
}

function sidecarPath(videoPath: string): string {
  return `${videoPath}.json`
}

function toVideoInfo(filePath: string, data: Sidecar): VideoInfo {
  const fileName = basename(filePath)
  return {
    id: fileName,
    fileName,
    filePath,
    url: `wrenn-media://video/${encodeURIComponent(fileName)}`,
    kind: data.kind,
    size: data.size,
    createdAt: data.createdAt
  }
}

// Saves the sidecar for a new video and returns its library entry
export async function addVideo(info: {
  filePath: string
  kind: 'template' | 'edit'
  size: SizeId
  createdAt: Date
}): Promise<VideoInfo> {
  const data: Sidecar = { kind: info.kind, size: info.size, createdAt: info.createdAt.toISOString() }
  await fs.writeFile(sidecarPath(info.filePath), JSON.stringify(data, null, 2), 'utf8')
  return toVideoInfo(info.filePath, data)
}

// Old test videos have no sidecar, so guess the size from words in the file name.
// Reading the real width and height would mean opening every video: too slow for a list.
function guessSize(fileName: string): SizeId {
  const name = fileName.toLowerCase()
  return SIZES.find((size) => name.includes(size)) ?? 'reels'
}

// Reads a sidecar if there is one and it looks right. Otherwise returns null.
async function readSidecar(videoPath: string): Promise<Partial<Sidecar> | null> {
  try {
    const parsed = JSON.parse(await fs.readFile(sidecarPath(videoPath), 'utf8'))
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

// Every .mp4 directly inside the output folder, newest first
export async function listVideos(): Promise<VideoInfo[]> {
  const dir = outputDir()
  let names: string[]
  try {
    names = await fs.readdir(dir)
  } catch {
    return []
  }

  const videos: VideoInfo[] = []
  for (const fileName of names) {
    if (!fileName.toLowerCase().endsWith('.mp4')) continue
    const filePath = join(dir, fileName)
    try {
      const stats = await fs.stat(filePath)
      if (!stats.isFile()) continue

      const sidecar = await readSidecar(filePath)
      // Use each sidecar field only if it's valid, otherwise fall back to a guess
      const kind = sidecar?.kind === 'edit' || sidecar?.kind === 'template' ? sidecar.kind : 'template'
      const size = sidecar?.size && SIZES.includes(sidecar.size) ? sidecar.size : guessSize(fileName)
      const createdAt =
        typeof sidecar?.createdAt === 'string' && !isNaN(Date.parse(sidecar.createdAt))
          ? sidecar.createdAt
          : stats.mtime.toISOString()

      videos.push(toVideoInfo(filePath, { kind, size, createdAt }))
    } catch {
      // Can't read this file (locked, deleted mid-scan): skip it
    }
  }

  // Newest first
  videos.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  return videos
}
