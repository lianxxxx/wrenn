// Video jobs: everything between "Generate" and a finished MP4.
//
// 1. startJob makes a job folder (template + the user's files + brief.json).
// 2. It runs the user's own Claude Code in the background in that folder ("make my video"),
//    so the user only clicks: no window, no typing ("No prompts. Just render.").
// 3. Every 2 seconds we look for done.json, which Claude Code writes when it's finished.
// 4. Then we render scene/index.html to an MP4, add it to the library and tell the screen.

import { app, type WebContents } from 'electron'
import { spawn, type ChildProcess } from 'child_process'
import { randomBytes } from 'crypto'
import { existsSync } from 'fs'
import { copyFile, cp, mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'fs/promises'
import { basename, dirname, extname, isAbsolute, join } from 'path'

import type { JobEvent, JobRequest, SizeId } from '../preload'
import { findClaude } from './claude'
import { addVideo, outputDir } from './library'
import { renderScene } from './render/render'

const isWindows = process.platform === 'win32'

// Limits for what the page may send us
const MAX_FILES = 25
const MAX_TEXT = 200
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']
const VIDEO_EXTS = ['.mp4', '.webm', '.mov']
const SIZES: SizeId[] = ['reels', 'feed', 'square', 'youtube']
const LENGTHS = ['15', '30', '60']
const VIBES = ['playful', 'clean', 'bold', 'calm']
const ROLES = ['photo', 'recording', 'logo']

const POLL_MS = 2000
// How long Claude Code may work on one video before Wrenn calls it stuck
const CLAUDE_TIME_LIMIT_MS = 20 * 60 * 1000
// Old job folders are deleted when Wrenn starts (the videos themselves stay in Videos\Wrenn)
const KEEP_JOBS_MS = 7 * 24 * 60 * 60 * 1000
// Send at most about 10 progress updates per second to the screen
const PROGRESS_EVERY_MS = 100

// A job id looks like "1762500000000-a1b2c3" (time + short random part)
const JOB_ID = /^\d{13}-[0-9a-f]{6}$/

// What we keep in memory for each job that is still waiting or rendering
type RunningJob = {
  id: string
  dir: string
  size: SizeId
  // The window that started the job: progress goes back to it
  sender: WebContents
  timer?: NodeJS.Timeout
  // Stops the render when the user cancels
  abort: AbortController
  // True while we read done.json or render, so the timer doesn't start a second render
  busy: boolean
  // The background Claude Code process, while it's working
  claude?: ChildProcess
}

const jobs = new Map<string, RunningJob>()

// ---------------------------------------------------------------------------
// Folders
// ---------------------------------------------------------------------------

// Where the templates live. In dev that's desktop/templates.
// Packaging note: the built app needs electron-builder "extraResources" to copy
// templates/ next to the app, and this should then use process.resourcesPath.
export function templatesDir(): string {
  if (app.isPackaged) return join(process.resourcesPath, 'templates')
  // In dev the app folder is desktop/ with "npm run dev", but desktop/out/main when Electron
  // is started on the built file directly. So look in it and up to 2 folders above.
  let dir = app.getAppPath()
  for (let i = 0; i < 3; i++) {
    if (existsSync(join(dir, 'templates'))) return join(dir, 'templates')
    dir = dirname(dir)
  }
  return join(app.getAppPath(), 'templates')
}

function jobsDir(): string {
  return join(app.getPath('userData'), 'jobs')
}

function newJobId(): string {
  return `${Date.now()}-${randomBytes(3).toString('hex')}`
}

// ---------------------------------------------------------------------------
// Checking what the page sent
// ---------------------------------------------------------------------------

// The request comes from the page, so we check every field before we touch the disk.
// Throws an Error with a plain message the screen can show.
async function checkRequest(input: unknown): Promise<JobRequest> {
  const r = (input ?? {}) as Record<string, unknown>
  const isText = (v: unknown): v is string => typeof v === 'string' && v.length <= MAX_TEXT

  if (typeof r.templateId !== 'string' || !/^[a-z0-9-]+$/.test(r.templateId)) {
    throw new Error("That template doesn't exist.")
  }
  if (!existsSync(join(templatesDir(), r.templateId, 'template'))) {
    throw new Error("That template doesn't exist.")
  }
  if (!SIZES.includes(r.size as SizeId)) throw new Error('Pick a size for your video.')
  if (!LENGTHS.includes(r.length as string)) throw new Error('Pick a length for your video.')
  if (!VIBES.includes(r.vibe as string)) throw new Error('Pick a vibe for your video.')
  if (!isText(r.brandName) || r.brandName.trim() === '') throw new Error('Add your brand name.')
  if (!isText(r.endingText)) throw new Error('The ending line is too long.')

  if (!Array.isArray(r.files)) throw new Error('Add at least one screenshot or recording.')
  if (r.files.length > MAX_FILES) throw new Error(`That's a lot of files. Use ${MAX_FILES} or fewer.`)

  const files: JobRequest['files'] = []
  for (const f of r.files as Record<string, unknown>[]) {
    if (!f || typeof f.path !== 'string' || !isAbsolute(f.path) || !ROLES.includes(f.role as string)) {
      throw new Error("One of your files couldn't be read. Try adding it again.")
    }
    const name = basename(f.path)
    const ext = extname(f.path).toLowerCase()
    const allowed = f.role === 'recording' ? VIDEO_EXTS : IMAGE_EXTS
    if (!allowed.includes(ext)) {
      throw new Error(`"${name}" isn't a ${f.role === 'recording' ? 'video' : 'picture'} Wrenn can use.`)
    }
    const info = await stat(f.path).catch(() => null)
    if (!info || !info.isFile()) throw new Error(`Wrenn can't find "${name}" anymore. Try adding it again.`)
    files.push({ path: f.path, role: f.role as 'photo' | 'recording' | 'logo' })
  }
  if (files.filter((f) => f.role === 'logo').length > 1) throw new Error('Add just one logo.')
  if (!files.some((f) => f.role !== 'logo')) throw new Error('Add at least one screenshot or recording.')

  return {
    templateId: r.templateId,
    size: r.size as SizeId,
    length: r.length as JobRequest['length'],
    vibe: r.vibe as JobRequest['vibe'],
    brandName: r.brandName.trim(),
    endingText: r.endingText.trim(),
    files
  }
}

// ---------------------------------------------------------------------------
// Making the job folder
// ---------------------------------------------------------------------------

// Copy the user's files into assets/. Photos and recordings keep their names
// ("shot.png", then "shot (2).png" if the name is taken). The logo becomes logo.<ext>.
async function copyAssets(files: JobRequest['files'], assetsDir: string): Promise<void> {
  // Windows file names ignore upper/lower case, so we compare in lower case
  const taken = new Set<string>()

  const logo = files.find((f) => f.role === 'logo')
  if (logo) {
    const name = `logo${extname(logo.path).toLowerCase()}`
    taken.add(name)
    await copyFile(logo.path, join(assetsDir, name))
  }

  for (const file of files) {
    if (file.role === 'logo') continue
    const ext = extname(file.path)
    const stem = basename(file.path, ext)
    let name = basename(file.path)
    for (let n = 2; taken.has(name.toLowerCase()); n++) name = `${stem} (${n})${ext}`
    taken.add(name.toLowerCase())
    await copyFile(file.path, join(assetsDir, name))
  }
}

// ---------------------------------------------------------------------------
// Opening Claude Code
// ---------------------------------------------------------------------------

// Opens a new, visible console window in the job folder with Claude Code running.
async function openClaudeConsole(jobDir: string): Promise<void> {
  const claude = await findClaude()
  if (!claude) throw new Error("Wrenn can't find Claude Code on this computer. Run setup again.")

  if (isWindows) {
    // "start" opens a new console window. We build the command line ourselves
    // (windowsVerbatimArguments) so Node doesn't add its own quotes around the title.
    const command = `/c start "Wrenn: make your video" /D "${jobDir}" cmd /k ${claude}`
    spawn('cmd.exe', [command], {
      cwd: jobDir,
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
      windowsVerbatimArguments: true
    }).unref()
  } else if (process.platform === 'darwin') {
    // Mac: open Terminal in the folder. The user starts Claude Code there (not tested yet).
    spawn('open', ['-a', 'Terminal', jobDir], { detached: true, stdio: 'ignore' }).unref()
  } else {
    throw new Error('Opening Claude Code is only set up for Windows for now.')
  }
}

// The one line Wrenn gives Claude Code. The template's CLAUDE.md in the job folder does the rest.
const PROMPT = 'make my video'
// Only file tools, and only inside the job folder (Claude Code's working directory)
const TOOLS = 'Read,Write,Edit,Glob,Grep'

// What Claude Code is doing, in plain words for the progress screen
function activityFor(tool: string): string | undefined {
  if (tool === 'Read' || tool === 'Glob' || tool === 'Grep') return 'Looking at your files'
  if (tool === 'Write' || tool === 'Edit') return 'Building your scenes'
  return undefined
}

// Runs the user's own Claude Code in the background in the job folder.
// It streams JSON lines, which we only use to show what it's doing.
async function runClaude(job: RunningJob): Promise<void> {
  const claude = await findClaude()
  if (!claude) throw new Error("Wrenn can't find Claude Code on this computer. Run setup again.")

  // Windows needs a shell because npm installs Claude Code as "claude.cmd".
  // Every part is fixed text (no user input), so building the line ourselves is safe.
  const line = `${claude} -p "${PROMPT}" --permission-mode acceptEdits --allowedTools "${TOOLS}" --max-turns 80 --output-format stream-json --verbose`
  const child = spawn(line, { cwd: job.dir, shell: true, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  job.claude = child

  let buffer = ''
  let lastActivity = ''
  child.stdout?.on('data', (chunk) => {
    buffer += String(chunk)
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const text of lines) {
      try {
        const msg = JSON.parse(text)
        const parts = msg?.message?.content
        if (msg?.type !== 'assistant' || !Array.isArray(parts)) continue
        for (const part of parts) {
          const activity = part?.type === 'tool_use' ? activityFor(String(part.name)) : undefined
          if (activity && activity !== lastActivity) {
            lastActivity = activity
            send(job, { stage: 'waiting-for-claude', message: activity })
          }
        }
      } catch {
        // Not a JSON line: ignore it
      }
    }
  })

  let errors = ''
  child.stderr?.on('data', (chunk) => (errors = (errors + String(chunk)).slice(-2000)))

  // Time limit: if Claude Code is still going after 20 minutes, it's stuck. Stop it and say so.
  const tooLong = setTimeout(() => {
    if (!jobs.has(job.id) || job.busy) return
    stopClaude(job)
    send(job, {
      stage: 'failed',
      message: 'Claude Code took too long, so Wrenn stopped it. Try again, maybe with fewer screenshots.'
    })
    finish(job)
  }, CLAUDE_TIME_LIMIT_MS)

  child.on('close', (code) => {
    clearTimeout(tooLong)
    job.claude = undefined
    // Give done.json a moment, then if it's still missing, Claude Code stopped without finishing
    setTimeout(() => {
      if (!jobs.has(job.id) || job.busy || existsSync(join(job.dir, 'done.json'))) return
      console.error(`Claude Code stopped (code ${code}) for job ${job.id}:`, errors)
      send(job, {
        stage: 'failed',
        message: "Claude Code stopped before your video was ready. Check you're still signed in, then try again."
      })
      finish(job)
    }, POLL_MS + 500)
  })
}

// Stops the background Claude Code. On Windows it runs inside a shell, so stop the whole tree.
function stopClaude(job: RunningJob): void {
  const child = job.claude
  if (!child?.pid) return
  if (isWindows) spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true })
  else child.kill()
  job.claude = undefined
}

// ---------------------------------------------------------------------------
// Talking to the screen
// ---------------------------------------------------------------------------

function send(job: RunningJob, event: Omit<JobEvent, 'jobId'>): void {
  // The window may have been closed while we worked
  if (!job.sender.isDestroyed()) job.sender.send('job-event', { jobId: job.id, ...event })
}

// Stop the timer and forget the job
function finish(job: RunningJob): void {
  if (job.timer) clearInterval(job.timer)
  jobs.delete(job.id)
}

// ---------------------------------------------------------------------------
// Waiting for done.json, then rendering
// ---------------------------------------------------------------------------

// "wrenn 2026-11-07 14-03-22.mp4" (local time). Adds " (2)" if that name is taken.
function videoFileName(): string {
  const d = new Date()
  const two = (n: number): string => String(n).padStart(2, '0')
  const stamp = `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())} ${two(d.getHours())}-${two(d.getMinutes())}-${two(d.getSeconds())}`
  let name = `wrenn ${stamp}.mp4`
  for (let n = 2; existsSync(join(outputDir(), name)); n++) name = `wrenn ${stamp} (${n}).mp4`
  return name
}

// Move a file, even to another drive (rename can't do that, so copy then delete)
async function moveFile(from: string, to: string): Promise<void> {
  try {
    await rename(from, to)
  } catch {
    await copyFile(from, to)
    await rm(from, { force: true })
  }
}

async function checkForDone(job: RunningJob): Promise<void> {
  const doneFile = join(job.dir, 'done.json')
  if (job.busy || !existsSync(doneFile)) return
  job.busy = true

  let done: { ok?: unknown; reason?: unknown }
  try {
    done = JSON.parse(await readFile(doneFile, 'utf8'))
  } catch {
    // Claude Code may still be writing it: try again on the next check
    job.busy = false
    return
  }

  // The user may have pressed Cancel while we were reading
  if (job.abort.signal.aborted) return

  // From here on we don't need the timer
  if (job.timer) clearInterval(job.timer)

  if (done.ok !== true) {
    const reason =
      typeof done.reason === 'string' && done.reason.trim()
        ? done.reason.trim().slice(0, 300)
        : "Claude Code couldn't make this video."
    send(job, { stage: 'failed', message: reason })
    finish(job)
    return
  }

  // Render inside the job folder first, then move the finished file to Videos\Wrenn.
  // That way the library never sees a half-written video.
  const tempFile = join(job.dir, 'video.mp4')
  let lastSent = 0
  try {
    send(job, { stage: 'rendering', frame: 0 })
    await renderScene({
      sceneDir: join(job.dir, 'scene'),
      outFile: tempFile,
      signal: job.abort.signal,
      onProgress: (frame, total) => {
        const now = Date.now()
        if (now - lastSent >= PROGRESS_EVERY_MS || frame === total) {
          lastSent = now
          send(job, { stage: 'rendering', frame, total })
        }
      }
    })

    const filePath = join(outputDir(), videoFileName())
    await moveFile(tempFile, filePath)
    const video = await addVideo({ filePath, kind: 'template', size: job.size, createdAt: new Date() })
    send(job, { stage: 'done', video })
  } catch (error) {
    // A cancel already told the screen, so only report real errors
    if (!job.abort.signal.aborted) {
      console.error(`Render failed for job ${job.id}:`, error)
      send(job, {
        stage: 'failed',
        message:
          "Wrenn couldn't turn Claude Code's work into a video. Open Claude Code again and ask it to fix the video."
      })
    }
  } finally {
    finish(job)
  }
}

// ---------------------------------------------------------------------------
// What index.ts calls
// ---------------------------------------------------------------------------

export async function startJob(sender: WebContents, input: unknown): Promise<{ jobId: string }> {
  const request = await checkRequest(input)

  // Check for Claude Code before making any folders
  if (!(await findClaude())) throw new Error("Wrenn can't find Claude Code on this computer. Run setup again.")

  const id = newJobId()
  const dir = join(jobsDir(), id)
  try {
    await cp(join(templatesDir(), request.templateId, 'template'), dir, { recursive: true })
    const assetsDir = join(dir, 'assets')
    await mkdir(assetsDir, { recursive: true })
    await copyAssets(request.files, assetsDir)

    const brief = {
      brandName: request.brandName,
      endingText: request.endingText,
      size: request.size,
      length: request.length,
      vibe: request.vibe
    }
    await writeFile(join(dir, 'brief.json'), JSON.stringify(brief, null, 2) + '\n', 'utf8')
  } catch (error) {
    // Don't leave a half-made folder behind
    console.error('Could not make the job folder:', error)
    await rm(dir, { recursive: true, force: true })
    throw new Error("Wrenn couldn't get your files ready. Check they're still there and try again.")
  }

  const job: RunningJob = { id, dir, size: request.size, sender, abort: new AbortController(), busy: false }
  jobs.set(id, job)
  try {
    await runClaude(job)
  } catch (error) {
    jobs.delete(id)
    throw error
  }
  job.timer = setInterval(() => void checkForDone(job), POLL_MS)
  send(job, { stage: 'waiting-for-claude', message: 'Getting started' })

  return { jobId: id }
}

// Opens Claude Code in the job folder again (for example if the user closed the window)
export async function openClaudeInJob(jobId: unknown): Promise<void> {
  if (typeof jobId !== 'string' || !JOB_ID.test(jobId)) throw new Error("Wrenn can't find that video job.")
  const dir = jobs.get(jobId)?.dir ?? join(jobsDir(), jobId)
  if (!existsSync(dir)) throw new Error("Wrenn can't find that video job.")
  await openClaudeConsole(dir)
}

export function cancelJob(jobId: unknown): void {
  if (typeof jobId !== 'string') return
  const job = jobs.get(jobId)
  if (!job) return
  job.abort.abort()
  stopClaude(job)
  finish(job)
  send(job, { stage: 'cancelled' })
}

// When the app quits: stop every Claude Code, timer and render. The job folders stay on disk.
// Deletes job folders older than a week, so they don't pile up on the user's computer.
// Only folders named like a job id, and never one that's running. Errors are ignored.
export async function cleanOldJobs(): Promise<void> {
  try {
    const names = await readdir(jobsDir())
    for (const name of names) {
      if (!JOB_ID.test(name) || jobs.has(name)) continue
      const dir = join(jobsDir(), name)
      const info = await stat(dir)
      if (Date.now() - info.mtimeMs > KEEP_JOBS_MS) await rm(dir, { recursive: true, force: true })
    }
  } catch {
    // No jobs folder yet, or a folder is in use: try again next time
  }
}

export function stopAllJobs(): void {
  for (const job of jobs.values()) {
    job.abort.abort()
    stopClaude(job)
    if (job.timer) clearInterval(job.timer)
  }
  jobs.clear()
}
