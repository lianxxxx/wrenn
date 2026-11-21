// Finds the user's own Claude Code and asks it if they're signed in.
// Wrenn never reads the user's Claude login files: it only asks Claude Code itself,
// and only passes "installed / version / signed in" to the screens (no email, no account info).

import { exec, execFile, spawn } from 'child_process'
import { existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

import type { ClaudeStatus } from '../preload'

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
    // "start" opens a new console window, so the user sees Claude Code's own messages
    spawn('cmd.exe', ['/c', 'start', '"Sign in to Claude"', 'cmd', '/k', `${claude} auth login`], {
      detached: true,
      stdio: 'ignore',
      windowsHide: false
    }).unref()
  } else {
    spawn(claude, ['auth', 'login'], { detached: true, stdio: 'ignore' }).unref()
  }
}
