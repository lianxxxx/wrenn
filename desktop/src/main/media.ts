// The wrenn-media:// address, so the screens can play finished videos.
//
// The page can't open files from disk directly (that would be unsafe), so it asks for
// wrenn-media://video/<file name> and we answer with that file from Videos\Wrenn.
// Only .mp4 files sitting directly in that folder are served. Nothing else on the disk.
//
// Video players ask for pieces of the file ("Range" requests) when you jump around,
// so we answer those with just that piece (status 206). That's what makes seeking work.

import { protocol } from 'electron'
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { dirname, resolve } from 'path'
import { Readable } from 'stream'

import { outputDir } from './library'

const SCHEME = 'wrenn-media'

// Must run BEFORE the app is ready (Electron's rule for custom schemes)
export function registerMediaScheme(): void {
  protocol.registerSchemesAsPrivileged([
    { scheme: SCHEME, privileges: { standard: true, secure: true, stream: true, supportFetchAPI: true } }
  ])
}

// Turn "wrenn-media://video/<name>" into a full path inside Videos\Wrenn, or null if it's not allowed
function fileFromUrl(url: string): string | null {
  let name: string
  try {
    const parsed = new URL(url)
    if (parsed.host !== 'video') return null
    name = decodeURIComponent(parsed.pathname.slice(1))
  } catch {
    return null
  }

  // Just a plain file name: no folders, no "..", only .mp4
  if (!name || name.includes('/') || name.includes('\\') || name.includes('..')) return null
  if (!name.toLowerCase().endsWith('.mp4')) return null

  // Double check: the file's folder must be exactly Videos\Wrenn
  const folder = resolve(outputDir())
  const file = resolve(folder, name)
  if (dirname(file).toLowerCase() !== folder.toLowerCase()) return null
  return file
}

// Reads "bytes=100-199", "bytes=100-" or "bytes=-500" into start and end (end included).
// Returns null if the range can't be served.
function parseRange(header: string, size: number): { start: number; end: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (!match || (match[1] === '' && match[2] === '')) return null

  let start: number
  let end: number
  if (match[1] === '') {
    // "bytes=-500" means the last 500 bytes
    start = Math.max(0, size - Number(match[2]))
    end = size - 1
  } else {
    start = Number(match[1])
    end = match[2] === '' ? size - 1 : Math.min(Number(match[2]), size - 1)
  }
  if (start > end || start >= size) return null
  return { start, end }
}

// The file's bytes from start to end, as something a Response can send
function streamFile(file: string, start: number, end: number): ReadableStream {
  return Readable.toWeb(createReadStream(file, { start, end })) as unknown as ReadableStream
}

// Must run AFTER the app is ready
export function registerMediaHandler(): void {
  protocol.handle(SCHEME, async (request) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405 })

    const file = fileFromUrl(request.url)
    if (!file) return new Response(null, { status: 404 })

    const info = await stat(file).catch(() => null)
    if (!info || !info.isFile()) return new Response(null, { status: 404 })

    const size = info.size
    const headers = { 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes' }
    const range = request.headers.get('range')

    // No range asked: send the whole file
    if (!range) {
      const body = request.method === 'HEAD' || size === 0 ? null : streamFile(file, 0, size - 1)
      return new Response(body, { status: 200, headers: { ...headers, 'Content-Length': String(size) } })
    }

    const part = parseRange(range, size)
    if (!part) {
      return new Response(null, { status: 416, headers: { ...headers, 'Content-Range': `bytes */${size}` } })
    }

    const body = request.method === 'HEAD' ? null : streamFile(file, part.start, part.end)
    return new Response(body, {
      status: 206,
      headers: {
        ...headers,
        'Content-Length': String(part.end - part.start + 1),
        'Content-Range': `bytes ${part.start}-${part.end}/${size}`
      }
    })
  })
}
