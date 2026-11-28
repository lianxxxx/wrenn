import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { ScreenTitle } from '../components/ScreenTitle'
import { CheckIcon, Spinner } from '../components/Spinner'
import { TextField } from '../components/TextField'
import { keyWarning } from '../elevenlabsKey'

type Props = {
  voiceoverKey: string
  onKeyChange: (key: string) => void
  // Saves "setup done" and the key, then goes to Home
  onContinue: () => Promise<void>
}

// Where setup is. People only click buttons here, and Wrenn checks again on its own.
//   checking    -> asking the computer for Claude Code (first time only)
//   missing     -> not installed: "Install Claude Code" installs it for them
//   installing  -> Anthropic's installer runs hidden in the background
//   signed-out  -> installed, not signed in: "Sign in" opens Claude Code's own sign-in
//   waiting     -> the sign-in window is open, Wrenn checks until it's done
//   found       -> all set
type Status = 'checking' | 'missing' | 'installing' | 'signed-out' | 'waiting' | 'found'

// Anthropic's install guide: the fallback if the one-click install doesn't work
export const INSTALL_URL = 'https://code.claude.com/docs/en/setup'

export const INSTALLING_NOTE = 'Installing Claude Code. This takes about a minute.'
// Shown if the install call itself breaks (the main process sends its own message otherwise)
export const INSTALL_ERROR = "Couldn't install Claude Code. Try again, or follow Anthropic's guide."

// How often to check again while waiting for the user to install or sign in
export const RECHECK_MS = 4000

// Sign-in opens Claude Code in a black command window (it needs one to run), then the browser.
// We say so up front, so the black window doesn't look like something broke.
export const SIGN_IN_NOTE = "A black window opens, then your browser. That's normal. Sign in on the browser page, then close the black window."
export const WAITING_NOTE = "Finish signing in on the page that opened in your browser, then close the black window. Wrenn will notice on its own."

export function Setup({ voiceoverKey, onKeyChange, onContinue }: Props) {
  const [status, setStatus] = useState<Status>('checking')
  const [version, setVersion] = useState<string>()
  // Plain words for why the last install didn't work, or ''
  const [installError, setInstallError] = useState('')
  // Each check gets a number, so an old, slow answer can't overwrite a newer one
  const latestCheck = useRef(0)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  // Continue saves "setup done", so setup doesn't show again next launch
  async function finish() {
    setSaving(true)
    setSaveError(false)
    try {
      await onContinue()
    } catch {
      setSaveError(true)
      setSaving(false)
    }
  }

  const check = useCallback(async (waitingForSignIn = false) => {
    const id = ++latestCheck.current
    const result = await window.api.checkClaude()
    if (id !== latestCheck.current) return

    setVersion(result.version)
    if (!result.installed) setStatus('missing')
    else if (result.signedIn) setStatus('found')
    else setStatus(waitingForSignIn ? 'waiting' : 'signed-out')
  }, [])

  // First check when the screen opens
  useEffect(() => {
    check()
  }, [check])

  // While someone is installing or signing in, check again every few seconds.
  // Not during Wrenn's own install: that one tells us when it's done.
  useEffect(() => {
    if (status === 'checking' || status === 'installing' || status === 'found') return
    const timer = window.setInterval(() => check(status === 'waiting'), RECHECK_MS)
    return () => window.clearInterval(timer)
  }, [status, check])

  function signIn() {
    setStatus('waiting')
    window.api.openClaudeSignIn()
  }

  async function install() {
    // Throw away any check still on its way, so it can't flip the screen back to "missing"
    latestCheck.current++
    setInstallError('')
    setStatus('installing')
    let result
    try {
      result = await window.api.installClaude()
    } catch {
      result = { ok: false as const, message: INSTALL_ERROR }
    }
    if (!result.ok) {
      setInstallError(result.message)
      setStatus('missing')
      return
    }
    // Installed: check again, which moves on to signing in
    check()
  }

  return (
    <div className="mx-auto w-full max-w-[672px]">
      <ScreenTitle
        title="Let's get you set up"
        sub="Wrenn uses Claude Code, an AI helper from Anthropic, to build your videos. We'll get it ready in a couple of clicks."
      />

      <div className="rounded-lg border-2 border-line bg-card p-lg">
        <Steps status={status} />

        <div className="mt-lg border-t-2 border-line pt-lg" aria-live="polite">
          {status === 'checking' && (
            <Row icon={<Spinner className="size-8" />} title="Looking for Claude Code..." text="Checking your computer." />
          )}

          {status === 'missing' && (
            <>
              <Row
                icon={<Badge>1</Badge>}
                title="Install Claude Code"
                text="Wrenn installs it for you in the background. No terminal needed."
              />
              <Actions>
                <Button onClick={install}>Install Claude Code</Button>
                <a href="https://claude.ai" target="_blank" rel="noreferrer" className="text-[0.9375rem] font-semibold text-navy underline">
                  No Claude plan yet? Get one at claude.ai
                </a>
              </Actions>
              {installError && (
                <div className="mt-md ml-[56px]">
                  <p className="text-[0.9375rem] font-semibold text-navy" role="alert">
                    {installError}
                  </p>
                  <a
                    href={INSTALL_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-xs inline-block text-[0.9375rem] font-semibold text-navy underline"
                  >
                    Open the install guide
                  </a>
                </div>
              )}
            </>
          )}

          {status === 'installing' && (
            <Row icon={<Spinner className="size-8" />} title="Installing Claude Code..." text={INSTALLING_NOTE} />
          )}

          {status === 'signed-out' && (
            <>
              <Row
                icon={<Badge>2</Badge>}
                title="Sign in to Claude"
                text={SIGN_IN_NOTE}
              />
              <Actions>
                <Button onClick={signIn}>Sign in</Button>
              </Actions>
            </>
          )}

          {status === 'waiting' && (
            <>
              <Row
                icon={<Spinner className="size-8" />}
                title="Waiting for you to sign in..."
                text={WAITING_NOTE}
              />
              <Actions>
                <Button variant="ghost" onClick={signIn}>
                  Open sign-in again
                </Button>
              </Actions>
            </>
          )}

          {status === 'found' && (
            <Row
              icon={
                <span className="flex size-10 items-center justify-center rounded-full bg-lime text-ink">
                  <CheckIcon />
                </span>
              }
              title="You're all set"
              text={`Claude Code${version ? ` ${version}` : ''} is ready. Wrenn will use it to build your videos.`}
            />
          )}
        </div>
      </div>

      <TextField
        className="mt-xl"
        label="ElevenLabs key (optional)"
        hint="Lets ElevenLabs make a new song for your videos. You can skip this and add it later in Settings."
        type="password"
        autoComplete="off"
        spellCheck={false}
        placeholder="Paste your key here"
        warning={keyWarning(voiceoverKey)}
        value={voiceoverKey}
        onChange={(e) => onKeyChange(e.target.value)}
      />

      <div className="mt-xl flex items-center justify-end gap-md">
        {/* Says why Continue is greyed out */}
        {!saveError && status !== 'checking' && status !== 'found' && (
          <p className="text-[0.9375rem] text-navy-body">
            {status === 'missing' || status === 'installing' ? 'Install Claude Code first.' : 'Sign in to Claude first.'}
          </p>
        )}
        {saveError && (
          <p className="text-[0.9375rem] font-semibold text-navy" role="alert">
            Couldn't save your settings. Try again.
          </p>
        )}
        <Button onClick={finish} disabled={status !== 'found' || saving}>
          {saving ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}

// The two steps at the top, so people see how far along they are
function Steps({ status }: { status: Status }) {
  const installed = status === 'signed-out' || status === 'waiting' || status === 'found'
  const signedIn = status === 'found'
  const items = [
    { label: 'Install Claude Code', done: installed },
    { label: 'Sign in', done: signedIn }
  ]
  return (
    <ol className="flex gap-lg">
      {items.map((item, i) => (
        <li key={item.label} className="flex items-center gap-sm text-[0.9375rem] font-semibold text-navy">
          <span
            className={`flex size-6 items-center justify-center rounded-full text-[0.8125rem] ${item.done ? 'bg-lime text-ink' : 'border-2 border-line text-navy-body'}`}
          >
            {item.done ? <CheckIcon className="size-4" /> : i + 1}
          </span>
          <span className={item.done ? '' : 'text-navy-body'}>
            {item.label}
            <span className="sr-only">{item.done ? ' (done)' : ' (not done yet)'}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

function Row({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-md">
      <span className="flex size-10 shrink-0 items-center justify-center">{icon}</span>
      <div>
        <p className="font-display text-2xl leading-tight text-navy">{title}</p>
        <p className="text-base text-navy-body">{text}</p>
      </div>
    </div>
  )
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-full bg-sky font-display text-xl text-ink" aria-hidden>
      {children}
    </span>
  )
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="mt-lg ml-[56px] flex flex-wrap items-center gap-md">{children}</div>
}
