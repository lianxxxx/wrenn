import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { ScreenTitle } from '../components/ScreenTitle'
import { CheckIcon, Spinner } from '../components/Spinner'
import { TextField } from '../components/TextField'

type Props = {
  elevenLabsKey: string
  onKeyChange: (key: string) => void
  onContinue: () => void
}

// Where setup is. People only ever click buttons: no terminal.
//   checking    -> looking for Claude Code
//   missing     -> not installed: "Install Claude Code" button
//   installing  -> Wrenn runs Anthropic's official installer, with a progress bar
//   signed-out  -> installed, not signed in: "Sign in" button
//   waiting     -> the browser is open on Claude's sign-in page, Wrenn checks on its own
//   found       -> all set
type Status = 'checking' | 'missing' | 'installing' | 'signed-out' | 'waiting' | 'found'
type FirstResult = 'found' | 'missing' | 'signed-out'

// Placeholder link: double check the exact Anthropic install page before launch
const INSTALL_URL = 'https://docs.anthropic.com/en/docs/claude-code/setup'

// All FAKE for now: timers stand in for the real work. Later each step asks the main process
// (check, run the official installer, start Claude Code's own sign-in), once Anthropic says it's okay.
export function Setup({ elevenLabsKey, onKeyChange, onContinue }: Props) {
  const [status, setStatus] = useState<Status>('checking')
  const [progress, setProgress] = useState(0)
  // Dev only: what the fake first check finds, to preview each case
  const [firstResult, setFirstResult] = useState<FirstResult>('missing')

  // Every fake timer goes through here, so leaving the screen or restarting clears them all
  const timers = useRef<number[]>([])
  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms))
  }
  function clearTimers() {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  useEffect(() => clearTimers, [])

  // The first check. Runs again when the dev preview changes.
  useEffect(() => {
    clearTimers()
    setStatus('checking')
    later(() => setStatus(firstResult), 1200)
  }, [firstResult])

  function install() {
    clearTimers()
    setStatus('installing')
    setProgress(0)
    // Fake progress: 10 small steps, then it's installed but not signed in yet
    for (let i = 1; i <= 10; i++) later(() => setProgress(i * 10), i * 300)
    later(() => setStatus('signed-out'), 3300)
  }

  function signIn() {
    clearTimers()
    setStatus('waiting')
    // Real version: opens Claude's sign-in page in the browser, then checks every few seconds.
    // Fake: "signs in" after 3 seconds.
    later(() => setStatus('found'), 3000)
  }

  return (
    <div className="mx-auto w-full max-w-[672px]">
      <ScreenTitle
        title="Let's get you set up"
        sub="Wrenn uses Claude Code to build your videos. We'll get it ready in a couple of clicks."
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
                text="Wrenn installs it for you. It takes about a minute."
              />
              <Actions>
                <Button onClick={install}>Install Claude Code</Button>
                <a href={INSTALL_URL} target="_blank" rel="noreferrer" className="text-[0.9375rem] font-semibold text-navy underline">
                  I'd rather do it myself
                </a>
              </Actions>
            </>
          )}

          {status === 'installing' && (
            <>
              <Row icon={<Spinner className="size-8" />} title="Installing Claude Code..." text="You can leave this open. Don't close Wrenn." />
              <div className="mt-md ml-[56px]">
                <div
                  className="h-3 overflow-hidden rounded-pill bg-sky-soft"
                  role="progressbar"
                  aria-label="Installing Claude Code"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <div className="h-full rounded-pill bg-teal transition-[width] duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </>
          )}

          {status === 'signed-out' && (
            <>
              <Row
                icon={<Badge>2</Badge>}
                title="Sign in to Claude"
                text="Your browser opens Claude's sign-in page. Sign in there, then come back."
              />
              <Actions>
                <Button onClick={signIn}>Sign in</Button>
                <a href="https://claude.ai" target="_blank" rel="noreferrer" className="text-[0.9375rem] font-semibold text-navy underline">
                  No Claude plan yet? Get one at claude.ai
                </a>
              </Actions>
            </>
          )}

          {status === 'waiting' && (
            <>
              <Row
                icon={<Spinner className="size-8" />}
                title="Waiting for you to sign in..."
                text="Finish signing in on the page that opened in your browser. Wrenn will notice on its own."
              />
              <Actions>
                <Button variant="ghost" onClick={signIn}>
                  Open the sign-in page again
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
              text="Claude Code is ready. Wrenn will use it in the background."
            />
          )}
        </div>
      </div>

      {/* Dev only: pick what the fake first check finds, to see each case */}
      {import.meta.env.DEV && (
        <div className="mt-sm flex items-center gap-sm text-[0.8125rem] text-navy-body">
          <span>Preview start:</span>
          {(['missing', 'signed-out', 'found'] as const).map((result) => (
            <button
              key={result}
              type="button"
              onClick={() => setFirstResult(result)}
              className={`cursor-pointer rounded-pill border px-sm py-[2px] ${firstResult === result ? 'border-navy text-navy' : 'border-line'}`}
            >
              {result}
            </button>
          ))}
        </div>
      )}

      <TextField
        className="mt-xl"
        label="Voiceover key (optional)"
        hint="Adds voiceovers to your videos. You can skip this and add it later in Settings."
        type="password"
        autoComplete="off"
        spellCheck={false}
        placeholder="Paste your key here"
        value={elevenLabsKey}
        onChange={(e) => onKeyChange(e.target.value)}
      />

      <div className="mt-xl flex justify-end">
        <Button onClick={onContinue} disabled={status !== 'found'}>
          Continue
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
