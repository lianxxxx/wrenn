// "Make a video from a link": the user pastes their website's address, and Wrenn
// opens it in a hidden window, takes screenshots and picks up the logo, colors and fonts.
//
// 1. Check the address: only http(s), and only public sites (not this computer or the home network).
// 2. Open it in a hidden, locked-down window: no Node, no preload, no popups, no downloads,
//    no permission prompts, its own throwaway session (no cookies kept).
// 3. Force light mode, then screenshot each screen-height section at desktop and phone width.
// 4. Read the logo, fonts and colors from the page, and download the logo and same-site fonts.
// 5. Save it all in userData/grabs/<id>/. The screen shows the files like normal uploads,
//    and startJob copies them into the job folder like any other file.

import { app, BrowserWindow, session, type Session, type WebContents } from 'electron'
import { randomBytes } from 'crypto'
import { lookup } from 'dns/promises'
import { isIP } from 'net'
import { mkdir, readdir, rm, stat, writeFile } from 'fs/promises'
import { join } from 'path'

import type { GrabbedFile, SiteGrab } from '../preload'
import { MAX_SITE_URL } from '../shared/limits'

// The plain message for anything that goes wrong
const FAILED = "Couldn't open that page. Check the link, or upload screenshots instead."

// How long the page may take to load before we give up
const LOAD_TIMEOUT_MS = 30_000
// The whole grab (two page loads, screenshots, logo, fonts) never takes longer than this
const TOTAL_TIMEOUT_MS = 90_000
// After loading, wait a moment for fonts, lazy pictures and intro animations
const SETTLE_MS = 1500
// After each scroll, wait for lazy content and scroll animations
const SCROLL_WAIT_MS = 700
// Screenshots per size, top to bottom
const MAX_SHOTS = 6
const MAX_FONTS = 4
const MAX_LOGO_BYTES = 5 * 1024 * 1024
const MAX_FONT_BYTES = 3 * 1024 * 1024
// Grab folders older than this are deleted when Wrenn starts
const KEEP_GRABS_MS = 7 * 24 * 60 * 60 * 1000

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, mobile: false },
  { name: 'phone', width: 390, height: 844, mobile: true }
] as const

const PHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

// Only one grab at a time
let busy = false

function grabsDir(): string {
  return join(app.getPath('userData'), 'grabs')
}

// Test-only: the Playwright test serves a page from this computer (127.0.0.1)
function allowLocal(): boolean {
  return process.env.WRENN_TEST_ALLOW_LOCAL_SITES === '1'
}

// ---------------------------------------------------------------------------
// Is this a public address?
// ---------------------------------------------------------------------------

// True for addresses on this computer or a home/office network
function isPrivateIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number)
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    )
  }
  const v6 = ip.toLowerCase()
  if (v6.startsWith('::ffff:')) return isPrivateIp(v6.slice(7))
  return v6 === '::' || v6 === '::1' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80')
}

// Turns what the user typed into a URL we're willing to open. "mysite.com" becomes "https://mysite.com".
function parseSiteUrl(input: unknown): URL | null {
  if (typeof input !== 'string') return null
  let text = input.trim()
  if (!text || text.length > MAX_SITE_URL) return null
  if (!/^[a-z][a-z0-9+.-]*:/i.test(text)) text = `https://${text}`
  try {
    const url = new URL(text)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (!url.hostname || url.username || url.password) return null
    return url
  } catch {
    return null
  }
}

// Does this address point at a public site? Looks the name up, so "localhost" and
// names that lead to the home network are turned down too.
async function isPublicUrl(url: URL): Promise<boolean> {
  if (allowLocal()) return true
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return false
  if (isIP(host)) return !isPrivateIp(host)
  try {
    const found = await lookup(host, { all: true })
    return found.length > 0 && found.every((a) => !isPrivateIp(a.address))
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// The hidden window
// ---------------------------------------------------------------------------

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// A fresh in-memory session for each grab: nothing is kept, nothing can be downloaded or allowed
function grabSession(id: string): Session {
  const ses = session.fromPartition(`wrenn-grab-${id}`, { cache: false })
  ses.setPermissionRequestHandler((_wc, _permission, callback) => callback(false))
  ses.setPermissionCheckHandler(() => false)
  ses.on('will-download', (event) => event.preventDefault())
  // The page can't reach this computer or the home network either (except in the test)
  if (!allowLocal()) {
    ses.webRequest.onBeforeRequest((details, callback) => {
      try {
        const u = new URL(details.url)
        const host = u.hostname.replace(/^\[|\]$/g, '')
        const local =
          host === 'localhost' || host.endsWith('.localhost') || (isIP(host) !== 0 && isPrivateIp(host))
        callback({ cancel: local || (u.protocol !== 'http:' && u.protocol !== 'https:' && u.protocol !== 'data:' && u.protocol !== 'blob:') })
      } catch {
        callback({ cancel: true })
      }
    })
  }
  return ses
}

function makeHiddenWindow(ses: Session): BrowserWindow {
  const win = new BrowserWindow({
    show: false,
    width: 1440,
    height: 900,
    webPreferences: {
      session: ses,
      // Locked down: a stranger's page runs in here
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      // Drawn in memory, never on screen. Screenshots of a plain hidden window never arrive.
      offscreen: true,
      backgroundThrottling: false,
      javascript: true,
      spellcheck: false
    }
  })
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  win.webContents.setAudioMuted(true)
  return win
}

// Chrome DevTools commands (emulation and screenshots), sent through Electron's debugger
async function cdp<T = unknown>(wc: WebContents, method: string, params: Record<string, unknown> = {}): Promise<T> {
  return (await wc.debugger.sendCommand(method, params)) as T
}

// Opens the address. Waits for the page, or at least its HTML, for up to 30 seconds.
async function openPage(wc: WebContents, url: string): Promise<void> {
  let domReady = false
  // A real failure (no such site, connection refused), not the "aborted" some redirects give
  let failed = false
  // The page's HTTP status, like 200 or 404
  let status = 0
  const onDom = (): void => {
    domReady = true
  }
  const onFail = (_e: unknown, code: number, _desc: string, _url: string, isMainFrame: boolean): void => {
    if (isMainFrame && code !== -3) failed = true
  }
  const onNavigate = (_e: unknown, _url: string, code: number): void => {
    status = code
  }
  wc.on('dom-ready', onDom)
  wc.on('did-fail-load', onFail)
  wc.on('did-navigate', onNavigate)
  try {
    const loaded = wc.loadURL(url).then(
      () => true,
      // Some sites "abort" the first load on a redirect but still show the page
      () => false
    )
    const result = await Promise.race([loaded, wait(LOAD_TIMEOUT_MS).then(() => 'timeout' as const)])
    // Chromium shows its own error page when a site can't be reached: never screenshot that
    const ok = (): boolean => !failed && status < 400
    if (result === true && ok()) return
    // Not fully loaded, but the HTML is there: good enough for screenshots
    if (result !== true && ok() && (domReady || (await waitFor(() => domReady, 3000))) && ok()) return
    throw new Error(result === 'timeout' ? 'The page took too long.' : `The page did not load (status ${status}).`)
  } finally {
    wc.removeListener('dom-ready', onDom)
    wc.removeListener('did-fail-load', onFail)
    wc.removeListener('did-navigate', onNavigate)
  }
}

async function waitFor(check: () => boolean, ms: number): Promise<boolean> {
  const until = Date.now() + ms
  while (Date.now() < until) {
    if (check()) return true
    await wait(100)
  }
  return check()
}

// Screenshots of each screen-height section, from the top down
async function takeShots(
  wc: WebContents,
  url: string,
  viewport: (typeof VIEWPORTS)[number],
  dir: string,
  host: string
): Promise<GrabbedFile[]> {
  await cdp(wc, 'Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.mobile ? 2 : 1,
    mobile: viewport.mobile
  })
  await cdp(wc, 'Emulation.setTouchEmulationEnabled', { enabled: viewport.mobile, maxTouchPoints: viewport.mobile ? 5 : 1 })
  if (viewport.mobile) wc.setUserAgent(PHONE_UA)
  await openPage(wc, url)
  await wait(SETTLE_MS)

  const pageHeight = Number(
    await wc.executeJavaScript(
      'Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0)',
      true
    )
  )
  const count = Math.max(1, Math.min(MAX_SHOTS, Math.ceil((pageHeight || viewport.height) / viewport.height)))

  const files: GrabbedFile[] = []
  for (let i = 0; i < count; i++) {
    await wc.executeJavaScript(`window.scrollTo(0, ${i * viewport.height})`, true)
    await wait(SCROLL_WAIT_MS)
    const shot = await cdp<{ data: string }>(wc, 'Page.captureScreenshot', { format: 'jpeg', quality: 90 })
    const name = `${host}-${viewport.name}-${i + 1}.jpg`
    const path = join(dir, name)
    const data = Buffer.from(shot.data, 'base64')
    await writeFile(path, data)
    files.push({ path, name, type: 'image/jpeg', data: new Uint8Array(data) })
  }
  return files
}

// ---------------------------------------------------------------------------
// Logo, fonts and colors
// ---------------------------------------------------------------------------

type PageBrand = {
  logo: { kind: 'url'; url: string } | { kind: 'svg'; svg: string } | null
  colors: string[]
  fonts: string[]
  fontFiles: { url: string; family: string; weight: string }[]
}

// Runs inside the page. Plain JavaScript in a string, so nothing from Node goes in there.
const READ_BRAND = `(() => {
  const out = { logo: null, colors: [], fonts: [], fontFiles: [] }
  const hex = (c) => {
    const m = /rgba?\\(([^)]+)\\)/.exec(c || '')
    if (!m) return ''
    const p = m[1].split(/[\\s,/]+/).filter(Boolean).map(Number)
    if (p.length < 3 || (p.length > 3 && p[3] < 0.5)) return ''
    return '#' + p.slice(0, 3).map((n) => Math.round(n).toString(16).padStart(2, '0')).join('').toUpperCase()
  }
  const style = (el) => (el ? getComputedStyle(el) : null)
  const addColor = (c) => { const h = hex(c); if (h && !out.colors.includes(h)) out.colors.push(h) }
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4 }

  // Colors: page background, text, header, headings, buttons and links
  const body = document.body
  addColor(style(body)?.backgroundColor)
  addColor(style(document.documentElement)?.backgroundColor)
  addColor(style(body)?.color)
  const header = document.querySelector('header, [role="banner"], nav')
  addColor(style(header)?.backgroundColor)
  const h1 = document.querySelector('h1') || document.querySelector('h2')
  addColor(style(h1)?.color)
  const buttons = Array.from(document.querySelectorAll('button, a[class*="btn"], a[class*="button"], [role="button"], input[type="submit"]')).filter(visible).slice(0, 8)
  for (const b of buttons) { addColor(style(b).backgroundColor); addColor(style(b).color) }
  const link = Array.from(document.querySelectorAll('main a, a')).find(visible)
  addColor(style(link)?.color)
  out.colors = out.colors.slice(0, 8)

  // Fonts: the headline's and the body text's, by name
  const generic = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace', '-apple-system', 'blinkmacsystemfont', 'inherit', 'initial']
  for (const el of [h1, body]) {
    const first = (style(el)?.fontFamily || '').split(',')[0].trim().replace(/^["']|["']$/g, '')
    if (first && !generic.includes(first.toLowerCase()) && !out.fonts.includes(first)) out.fonts.push(first)
  }
  // Font files from @font-face, only from this site, only for the fonts above
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      let rules
      try { rules = sheet.cssRules } catch { continue }
      for (const rule of Array.from(rules || [])) {
        if (!(rule instanceof CSSFontFaceRule)) continue
        const family = rule.style.getPropertyValue('font-family').trim().replace(/^["']|["']$/g, '')
        if (!out.fonts.includes(family)) continue
        const src = rule.style.getPropertyValue('src')
        const m = /url\\(\\s*["']?([^"')]+)["']?\\s*\\)/.exec(src)
        if (!m) continue
        const url = new URL(m[1], sheet.href || location.href)
        if (url.origin !== location.origin) continue
        out.fontFiles.push({ url: url.href, family, weight: rule.style.getPropertyValue('font-weight').trim() || '400' })
      }
    }
  } catch {}

  // Logo: a picture in the header, or anything called "logo"
  const isLogo = (el) => /logo/i.test([el.id, el.getAttribute('class'), el.getAttribute('alt'), el.getAttribute('aria-label'), el.getAttribute('src')].join(' '))
  const inHeader = header ? Array.from(header.querySelectorAll('img, svg')) : []
  const all = Array.from(document.querySelectorAll('img, svg'))
  const logoEl =
    inHeader.find((el) => visible(el) && (isLogo(el) || isLogo(el.parentElement || el))) ||
    all.find((el) => visible(el) && isLogo(el)) ||
    inHeader.find((el) => visible(el) && el.closest('a[href="/"], a[href="' + location.origin + '/"]'))
  if (logoEl && logoEl.tagName.toLowerCase() === 'img' && (logoEl.currentSrc || logoEl.src)) {
    out.logo = { kind: 'url', url: logoEl.currentSrc || logoEl.src }
  } else if (logoEl) {
    const svg = logoEl.cloneNode(true)
    if (!svg.getAttribute('xmlns')) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    out.logo = { kind: 'svg', svg: svg.outerHTML }
  } else {
    const touch = document.querySelector('link[rel~="apple-touch-icon"]')
    const og = document.querySelector('meta[property="og:image"]')
    if (touch && touch.href) out.logo = { kind: 'url', url: touch.href }
    else if (og && og.content) out.logo = { kind: 'url', url: new URL(og.content, location.href).href }
  }
  return out
})()`

// Picture types Wrenn can use as a logo, by content type and by file ending
const LOGO_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg'
}
const FONT_TYPES = ['.woff2', '.woff', '.ttf', '.otf']

// Downloads a file through the grab's own session. Only public http(s) addresses.
async function download(ses: Session, address: string, maxBytes: number): Promise<{ data: Buffer; type: string } | null> {
  try {
    if (address.startsWith('data:')) {
      const m = /^data:([^;,]+)(;base64)?,(.*)$/s.exec(address)
      if (!m) return null
      const data = m[2] ? Buffer.from(m[3], 'base64') : Buffer.from(decodeURIComponent(m[3]), 'utf8')
      return data.length <= maxBytes ? { data, type: m[1].toLowerCase() } : null
    }
    const url = parseSiteUrl(address)
    if (!url || !(await isPublicUrl(url))) return null
    const response = await ses.fetch(url.href, { signal: AbortSignal.timeout(10_000) })
    if (!response.ok) return null
    const data = Buffer.from(await response.arrayBuffer())
    if (data.length === 0 || data.length > maxBytes) return null
    return { data, type: (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase() }
  } catch {
    return null
  }
}

// What kind of picture is this logo? Content type first, then the address's file ending.
function logoExt(type: string, address: string): string | null {
  if (LOGO_TYPES[type]) return LOGO_TYPES[type]
  const m = /\.(png|jpe?g|webp|gif|svg)(?:[?#]|$)/i.exec(address)
  return m ? (m[1].toLowerCase() === 'jpeg' ? '.jpg' : `.${m[1].toLowerCase()}`) : null
}

// A safe file name part, like "Inter" or "Open-Sans"
function namePart(text: string): string {
  return text.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'font'
}

async function saveLogo(ses: Session, brand: PageBrand, dir: string): Promise<GrabbedFile | undefined> {
  if (!brand.logo) return undefined
  let data: Buffer
  let ext: string | null
  if (brand.logo.kind === 'svg') {
    if (brand.logo.svg.length > MAX_LOGO_BYTES) return undefined
    data = Buffer.from(brand.logo.svg, 'utf8')
    ext = '.svg'
  } else {
    const got = await download(ses, brand.logo.url, MAX_LOGO_BYTES)
    if (!got) return undefined
    data = got.data
    ext = logoExt(got.type, brand.logo.url)
  }
  if (!ext) return undefined
  const name = `logo${ext}`
  const path = join(dir, name)
  await writeFile(path, data)
  const type = Object.keys(LOGO_TYPES).find((t) => LOGO_TYPES[t] === ext) ?? 'image/png'
  return { path, name, type, data: new Uint8Array(data) }
}

async function saveFonts(ses: Session, brand: PageBrand, dir: string): Promise<GrabbedFile[]> {
  const files: GrabbedFile[] = []
  const taken = new Set<string>()
  for (const font of brand.fontFiles) {
    if (files.length >= MAX_FONTS) break
    const m = /\.(woff2|woff|ttf|otf)(?:[?#]|$)/i.exec(font.url)
    if (!m) continue
    const ext = `.${m[1].toLowerCase()}`
    if (!FONT_TYPES.includes(ext)) continue
    // Named after the font, so Claude Code can tell which file is which
    const name = `${namePart(font.family)}-${namePart(font.weight)}${ext}`
    if (taken.has(name.toLowerCase())) continue
    const got = await download(ses, font.url, MAX_FONT_BYTES)
    if (!got) continue
    taken.add(name.toLowerCase())
    const path = join(dir, name)
    await writeFile(path, got.data)
    files.push({ path, name, type: 'font/' + ext.slice(1), data: new Uint8Array(got.data) })
  }
  return files
}

// Keeps only real hex colors and plain font names, whatever the page sent back
function cleanBrand(raw: unknown): PageBrand {
  const r = (raw ?? {}) as Record<string, unknown>
  const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
  const colors = list(r.colors).filter((c): c is string => typeof c === 'string' && /^#[0-9A-F]{6}$/.test(c)).slice(0, 8)
  const fonts = list(r.fonts)
    .filter((f): f is string => typeof f === 'string')
    .map((f) => f.replace(/[^\w .-]/g, '').trim().slice(0, 60))
    .filter(Boolean)
    .slice(0, 3)
  const fontFiles = list(r.fontFiles)
    .filter((f): f is PageBrand['fontFiles'][number] => {
      const o = f as Record<string, unknown>
      return !!o && typeof o.url === 'string' && typeof o.family === 'string' && typeof o.weight === 'string'
    })
    .slice(0, 20)
  let logo: PageBrand['logo'] = null
  const l = r.logo as Record<string, unknown> | null
  if (l && l.kind === 'url' && typeof l.url === 'string') logo = { kind: 'url', url: l.url }
  if (l && l.kind === 'svg' && typeof l.svg === 'string' && /^<svg[\s>]/i.test(l.svg)) logo = { kind: 'svg', svg: l.svg }
  return { logo, colors, fonts, fontFiles }
}

// ---------------------------------------------------------------------------
// What index.ts calls
// ---------------------------------------------------------------------------

// The steps, in the hidden window. grabSite below sets it up and tidies up after.
async function runGrab(url: URL, dir: string, ses: Session, wc: WebContents): Promise<SiteGrab> {
  await mkdir(dir, { recursive: true })
  // The debugger's emulation commands wait forever on a window that has no page yet
  await wc.loadURL('about:blank')
  wc.debugger.attach('1.3')
  // Light mode: most screenshots look best that way, and it matches what most people see first
  await cdp(wc, 'Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] })
  const host = namePart(url.hostname.replace(/^www\./, ''))

  // Desktop first, and read the brand there (the full header and logo show at desktop width)
  const desktop = await takeShots(wc, url.href, VIEWPORTS[0], dir, host)
  await wc.executeJavaScript('window.scrollTo(0, 0)', true)
  const brand = cleanBrand(await wc.executeJavaScript(READ_BRAND, true).catch(() => null))
  const logo = await saveLogo(ses, brand, dir).catch(() => undefined)
  const fonts = await saveFonts(ses, brand, dir).catch(() => [])

  // Phone: a missing phone view isn't worth failing the whole grab for
  const phone = await takeShots(wc, url.href, VIEWPORTS[1], dir, host).catch(() => [])

  return {
    url: url.href,
    photos: [...desktop, ...phone],
    logo,
    fonts,
    colors: brand.colors,
    fontFamilies: brand.fonts
  }
}

export async function grabSite(input: unknown): Promise<SiteGrab> {
  if (busy) throw new Error('Wrenn is already looking at a site. Give it a moment.')
  const url = parseSiteUrl(input)
  if (!url) throw new Error('That link doesn\'t look right. Try one like https://yoursite.com.')
  if (!(await isPublicUrl(url))) throw new Error('Wrenn can only open public websites, not pages on this computer or your home network.')

  busy = true
  const id = `${Date.now()}-${randomBytes(3).toString('hex')}`
  const dir = join(grabsDir(), id)
  const ses = grabSession(id)
  const win = makeHiddenWindow(ses)
  const wc = win.webContents
  let timer: NodeJS.Timeout | undefined
  try {
    const tooLong = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('The whole grab took too long.')), TOTAL_TIMEOUT_MS)
    })
    return await Promise.race([runGrab(url, dir, ses, wc), tooLong])
  } catch (error) {
    console.error('Grabbing the site failed:', error)
    await rm(dir, { recursive: true, force: true }).catch(() => {})
    throw new Error(FAILED)
  } finally {
    clearTimeout(timer)
    busy = false
    try {
      if (wc.debugger.isAttached()) wc.debugger.detach()
    } catch {
      // Already gone
    }
    if (!win.isDestroyed()) win.destroy()
    void ses.clearStorageData().catch(() => {})
  }
}

// Deletes grab folders older than a week. Errors are ignored (try again next time).
export async function cleanOldGrabs(): Promise<void> {
  try {
    for (const name of await readdir(grabsDir())) {
      const folder = join(grabsDir(), name)
      const info = await stat(folder)
      if (Date.now() - info.mtimeMs > KEEP_GRABS_MS) await rm(folder, { recursive: true, force: true })
    }
  } catch {
    // No grabs folder yet
  }
}
