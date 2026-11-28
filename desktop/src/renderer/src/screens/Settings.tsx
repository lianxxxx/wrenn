import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { ChoiceGroup } from '../components/ChoiceGroup'
import { ScreenTitle } from '../components/ScreenTitle'
import { CheckIcon, Spinner } from '../components/Spinner'
import { TextField } from '../components/TextField'
import { keyWarning } from '../elevenlabsKey'
import { INSTALL_URL, RECHECK_MS, SIGN_IN_NOTE, WAITING_NOTE } from './Setup'

type Props = {
  voiceoverKey: string
  // Saves the key to the settings file. Resolves when it's saved.
  onSaveKey: (key: string) => Promise<void>
  // Where videos go, e.g. C:\Users\Lian\Videos\Wrenn
  outputFolder: string
  onBack: () => void
}

type Theme = 'light' | 'dark'

// Light is the default. The choice is saved so it sticks next time (see theme.ts).
function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // Storage can be blocked; the switch still works until Wrenn closes
  }
}

export function Settings({ voiceoverKey, onSaveKey, outputFolder, onBack }: Props) {
  const [theme, setTheme] = useState<Theme>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )
  // The key being typed. It saves when you click away from the box.
  const [key, setKey] = useState(voiceoverKey)
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle')

  async function saveKey() {
    if (key === voiceoverKey) return
    try {
      await onSaveKey(key)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }

  return (
    <div className="mx-auto w-full max-w-[672px]">
      <ScreenTitle title="Settings" onBack={onBack} />

      <div className="flex flex-col gap-xl">
        <ClaudeCheck />

        <div>
          <TextField
            label="ElevenLabs key (optional)"
            hint="Lets ElevenLabs make a new song for your videos. Voiceovers are coming soon. Your key stays on this computer and saves when you click away."
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="Paste your key here"
            warning={keyWarning(key)}
            value={key}
            onChange={(e) => {
              setKey(e.target.value)
              setSaveState('idle')
            }}
            onBlur={saveKey}
          />
          <p className="mt-xs min-h-[1.25rem] text-[0.8125rem] font-semibold text-navy-body" aria-live="polite">
            {saveState === 'saved' ? 'Saved' : saveState === 'error' ? "Couldn't save. Try again." : ''}
          </p>
        </div>

        <div>
          <div className="text-[0.9375rem] font-semibold text-navy">Save videos to</div>
          <div className="mt-sm flex items-center gap-md">
            <p className="min-w-0 flex-1 truncate rounded-sm border-2 border-line bg-card px-md py-[10px] text-navy">
              {outputFolder}
            </p>
            {/* A folder picker comes later */}
            <Button variant="ghost" disabled aria-describedby="change-folder-hint">
              Change
            </Button>
          </div>
          <p id="change-folder-hint" className="mt-xs text-[0.8125rem] font-medium text-navy-body">
            Picking another folder is coming soon.
          </p>
        </div>

        <ChoiceGroup
          legend="Look"
          name="theme"
          columns="grid-cols-2"
          value={theme}
          onChange={(next) => {
            setTheme(next)
            applyTheme(next)
          }}
          options={[
            { id: 'light', name: 'Light' },
            { id: 'dark', name: 'Dark' }
          ]}
        />
      </div>
    </div>
  )
}

// Claude Code's status, the same check the setup screen uses (main/claude.ts).
//   checking   -> asking the computer
//   ready      -> installed and signed in
//   missing    -> not installed (or it stopped working)
//   signed-out -> installed, but needs a new sign-in
//   waiting    -> the sign-in window is open, Wrenn checks until it's done
type ClaudeState = 'checking' | 'ready' | 'missing' | 'signed-out' | 'waiting'

function ClaudeCheck() {
  const [state, setState] = useState<ClaudeState>('checking')
  const [version, setVersion] = useState<string>()
  // Each check gets a number, so an old, slow answer can't overwrite a newer one
  const latestCheck = useRef(0)

  const check = useCallback(async (waitingForSignIn = false) => {
    const id = ++latestCheck.current
    let result
    try {
      result = await window.api.checkClaude()
    } catch {
      result = { installed: false, signedIn: false }
    }
    if (id !== latestCheck.current) return
    setVersion(result.version)
    if (!result.installed) setState('missing')
    else if (result.signedIn) setState('ready')
    else setState(waitingForSignIn ? 'waiting' : 'signed-out')
  }, [])

  // Check once when Settings opens
  useEffect(() => {
    check()
  }, [check])

  // While the sign-in window is open, check again every few seconds
  useEffect(() => {
    if (state !== 'waiting') return
    const timer = window.setInterval(() => check(true), RECHECK_MS)
    return () => window.clearInterval(timer)
  }, [state, check])

  function signIn() {
    setState('waiting')
    window.api.openClaudeSignIn()
  }

  const text = {
    checking: 'Checking...',
    ready: `Ready${version ? ` (version ${version})` : ''}. Wrenn uses it to build your videos.`,
    missing: "Not installed. Wrenn can't make videos without it.",
    'signed-out': `You need to sign in again. ${SIGN_IN_NOTE}`,
    waiting: WAITING_NOTE
  }[state]

  return (
    <div>
      <div className="text-[0.9375rem] font-semibold text-navy">Claude Code</div>
      <div className="mt-sm flex items-center gap-md rounded-sm border-2 border-line bg-card px-md py-[10px]" aria-live="polite">
        <span className="flex size-8 shrink-0 items-center justify-center">
          {state === 'checking' || state === 'waiting' ? (
            <Spinner className="size-6" />
          ) : state === 'ready' ? (
            <span className="flex size-7 items-center justify-center rounded-full bg-lime text-ink" aria-hidden>
              <CheckIcon className="size-4" />
            </span>
          ) : (
            <span className="size-3 rounded-full bg-orange" aria-hidden />
          )}
        </span>
        <p className="min-w-0 flex-1 text-navy">{text}</p>
      </div>

      {state === 'missing' && (
        <div className="mt-sm flex flex-wrap items-center gap-md">
          <a
            href={INSTALL_URL}
            target="_blank"
            rel="noreferrer"
            className="press inline-flex items-center rounded-pill bg-navy px-[22px] py-[10px] font-display text-xl leading-none text-bg"
          >
            Open the install guide
          </a>
          <Button variant="ghost" onClick={() => check()}>
            Check again
          </Button>
        </div>
      )}
      {state === 'signed-out' && (
        <div className="mt-sm flex flex-wrap items-center gap-md">
          <Button onClick={signIn}>Sign in again</Button>
          <Button variant="ghost" onClick={() => check()}>
            Check again
          </Button>
        </div>
      )}
      {state === 'waiting' && (
        <div className="mt-sm">
          <Button variant="ghost" onClick={signIn}>
            Open sign-in again
          </Button>
        </div>
      )}
    </div>
  )
}
