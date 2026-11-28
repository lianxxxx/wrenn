// Finds the user's own Claude Code and asks it if they're signed in.
// Wrenn never reads the user's Claude login files: it only asks Claude Code itself,
// and only passes "installed / version / signed in" to the screens (no email, no account info).

import { exec, execFile, spawn } from 'child_process'
import { existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

import type { ClaudeStatus, InstallResult } from '../preload'

const isWindows = process.platform === 'win32'

// Runs a command and resolves with what it printed. Never throws: a failure resolves
// with ok: false. Windows needs a shell because npm installs Claude Code as "claude.cmd".
// There we build the line ourselves: every part is fixed text (no user input), and
// passing a list of args together with a shell is deprecated in Node.
function run(command: string, args: string[], timeoutMs = 15000): Promise<{ ok: boolean; out: string }> {
  return new Promise((resolve) => {
    const done = (error: Error | null, stdout: string | Buffer): void =>
      resolve({ ok: !error, out: String(stdout).trim() })
    if (isWindows) {
      exec([command, ...args].join(' '), { timeout: timeoutMs, windowsHide: true }, done)
    } else {
      execFile(command, args, { timeout: timeoutMs, windowsHide: true }, done)
    }
  })
}

// Where is Claude Code? First the PATH, then the native installer's usual spot.
// Returns a command ready for a command line ("claude", or a quoted full path), or null.
export async function findClaude(): Promise<string | null> {
  const lookup = await run(isWindows ? 'where' : 'which', ['claude'])
  if (lookup.ok && lookup.out) return 'claude'

  const native = join(homedir(), '.local', 'bin', isWindows ? 'claude.exe' : 'claude')
  if (existsSync(native)) return `"${native}"`

  return null
}

export async function checkClaude(): Promise<ClaudeStatus> {
  const claude = await findClaude()
  if (!claude) return { installed: false, signedIn: false }

  const version = await run(claude, ['--version'])
  if (!version.ok) return { installed: false, signedIn: false }

  // Prints JSON like { "loggedIn": true, ... } and uses no tokens
  const auth = await run(claude, ['auth', 'status'])
  let signedIn = false
  try {
    signedIn = JSON.parse(auth.out).loggedIn === true
  } catch {
    signedIn = false
  }

  // "2.1.319 (Claude Code)" -> "2.1.319"
  return { installed: true, signedIn, version: version.out.split(' ')[0] }
}

// Opens Claude Code's own sign-in in a new window. Claude Code then opens the browser,
// and the user signs in there themselves. Wrenn just checks again until it says yes.
export async function openClaudeSignIn(): Promise<void> {
  const claude = await findClaude()
  if (!claude) return

  if (isWindows) {
    // "start" opens a new console window, so the user sees Claude Code's own messages.
    // We keep it visible on purpose: if the browser can't hand the login back on its own,
    // Claude Code asks the user to paste a code into this window, and a hidden window
    // would leave them stuck. The screens warn that a black window opens (SIGN_IN_NOTE).
    spawn('cmd.exe', ['/c', 'start', '"Sign in to Claude"', 'cmd', '/k', `${claude} auth login`], {
      detached: true,
      stdio: 'ignore',
      windowsHide: false
    }).unref()
  } else {
    spawn(claude, ['auth', 'login'], { detached: true, stdio: 'ignore' }).unref()
  }
}

// Anthropic's official installers, from https://code.claude.com/docs/en/setup (native install).
// Fixed text only: nothing the user typed goes into these commands.
const INSTALL_WINDOWS = 'irm https://claude.ai/install.ps1 | iex'
const INSTALL_MAC_LINUX = 'curl -fsSL https://claude.ai/install.sh | bash'

// A slow connection can take a while, but not forever
const INSTALL_TIMEOUT_MS = 10 * 60 * 1000

const INSTALL_FAILED = "Couldn't install Claude Code. Check your internet connection and try again."

// The install that's running right now, if any. Setup and Settings both get this same one,
// so clicking twice (or on two screens) never starts two installers at once.
let installing: Promise<InstallResult> | null = null

// Installs Claude Code with Anthropic's own installer, hidden in the background (no black window).
// It goes into the user's home folder (on Windows %USERPROFILE%\.local\bin\claude.exe),
// so it needs no admin rights. findClaude already looks there, so Wrenn finds it right after,
// even though Wrenn's own PATH doesn't know about the new folder until Wrenn restarts.
export function installClaude(): Promise<InstallResult> {
  if (!installing) {
    installing = runInstaller().finally(() => {
      installing = null
    })
  }
  return installing
}

async function runInstaller(): Promise<InstallResult> {
  // Already there? Nothing to do.
  if (await findClaude()) return { ok: true }

  const exitedOk = await new Promise<boolean>((resolve) => {
    const child = isWindows
      ? spawn(
          powershellPath(),
          ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', INSTALL_WINDOWS],
          { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] }
        )
      : spawn('/bin/bash', ['-c', INSTALL_MAC_LINUX], { stdio: ['ignore', 'pipe', 'pipe'] })

    // Keep the end of what it printed, only for the log (the screens get plain words)
    let output = ''
    const keep = (chunk: Buffer): void => {
      output = (output + chunk.toString()).slice(-4000)
    }
    child.stdout?.on('data', keep)
    child.stderr?.on('data', keep)

    const timer = setTimeout(() => child.kill(), INSTALL_TIMEOUT_MS)
    child.on('error', (error) => {
      clearTimeout(timer)
      console.error('Claude Code install could not start:', error)
      resolve(false)
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (code !== 0) console.error(`Claude Code install failed (exit ${code}):\n${output}`)
      resolve(code === 0)
    })
  })

  if (!exitedOk) return { ok: false, message: INSTALL_FAILED }

  // The installer said it worked. Make sure Wrenn can really find it now.
  if (!(await findClaude())) {
    return { ok: false, message: "Claude Code installed, but Wrenn can't find it yet. Close Wrenn and open it again." }
  }
  return { ok: true }
}

// Windows PowerShell's usual spot, so it works even if the PATH is odd. Falls back to the name.
function powershellPath(): string {
  const full = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
  return existsSync(full) ? full : 'powershell.exe'
}
