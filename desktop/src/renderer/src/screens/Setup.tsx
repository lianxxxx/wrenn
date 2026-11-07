import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { ScreenTitle } from '../components/ScreenTitle'
import { CheckIcon, Spinner } from '../components/Spinner'
import { TextField } from '../components/TextField'

type Props = {
  elevenLabsKey: string
  onKeyChange: (key: string) => void
  onContinue: () => void
}

// What the Claude Code check found
type Status = 'checking' | 'found' | 'missing' | 'signed-out'

// Placeholder link: double check the exact Anthropic install page before launch
const INSTALL_URL = 'https://docs.anthropic.com/en/docs/claude-code/setup'

// First run. Checks for Claude Code (faked for now: a short wait, then the fake result).
export function Setup({ elevenLabsKey, onKeyChange, onContinue }: Props) {
  const [status, setStatus] = useState<Status>('checking')
  // Only for previewing the screens in dev. Later the main process gives the real answer.
  const [fakeResult, setFakeResult] = useState<Exclude<Status, 'checking'>>('found')

  const check = useCallback(() => {
    setStatus('checking')
    const timer = window.setTimeout(() => setStatus(fakeResult), 1200)
    return () => window.clearTimeout(timer)
  }, [fakeResult])

  useEffect(() => check(), [check])

  return (
    <div className="mx-auto w-full max-w-[672px]">
      <ScreenTitle
        title="Let's get you set up"
        sub="Wrenn uses Claude Code on your computer to build your videos. First, Wrenn checks for it on your computer."
      />

      <div className="rounded-lg border-2 border-line bg-card p-lg" role="status" aria-live="polite">
        {status === 'checking' && (
          <StatusRow icon={<Spinner className="size-8" />} title="Looking for Claude Code..." text="Checking your computer." />
        )}

        {status === 'found' && (
          <StatusRow
            icon={
              <span className="flex size-10 items-center justify-center rounded-full bg-lime text-ink">
                <CheckIcon />
              </span>
            }
            title="Claude Code found"
            text="You're all set. Wrenn will use it in the background."
          />
        )}

        {status === 'missing' && (
          <Problem
            title="Claude Code isn't installed yet"
            text="Wrenn needs it to build your videos. Here's how to get it:"
            steps={[
              <>
                Get a Claude plan at{' '}
                <a href="https://claude.ai" target="_blank" rel="noreferrer" className="font-semibold text-navy underline">
                  claude.ai
                </a>
                .
              </>,
              <>
                Install Claude Code with{' '}
                <a href={INSTALL_URL} target="_blank" rel="noreferrer" className="font-semibold text-navy underline">
                  Anthropic's guide
                </a>
                .
              </>,
              'Open Claude Code once and sign in.',
              'Come back here and click Check again.'
            ]}
            onRetry={check}
          />
        )}

        {status === 'signed-out' && (
          <Problem
            title="Sign in to Claude Code first"
            text="Claude Code is installed, but you're not signed in."
            steps={['Open Claude Code.', 'Sign in with your Claude account.', 'Come back here and click Check again.']}
            onRetry={check}
          />
        )}
      </div>

      {/* Dev only: switch what the fake check finds, to see each case */}
      {import.meta.env.DEV && (
        <div className="mt-sm flex items-center gap-sm text-[0.8125rem] text-navy-body">
          <span>Preview:</span>
          {(['found', 'missing', 'signed-out'] as const).map((result) => (
            <button
              key={result}
              type="button"
              onClick={() => setFakeResult(result)}
              className={`cursor-pointer rounded-pill border px-sm py-[2px] ${fakeResult === result ? 'border-navy text-navy' : 'border-line'}`}
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

function StatusRow({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
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

type ProblemProps = {
  title: string
  text: string
  steps: ReactNode[]
  onRetry: () => void
}

// Not installed or not signed in: plain steps, then Check again
function Problem({ title, text, steps, onRetry }: ProblemProps) {
  return (
    <div>
      <StatusRow
        icon={
          <span className="flex size-10 items-center justify-center rounded-full bg-orange font-display text-2xl text-ink" aria-hidden>
            !
          </span>
        }
        title={title}
        text={text}
      />
      <ol className="mt-md ml-[56px] list-decimal space-y-xs pl-md text-base text-navy-body">
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      <div className="mt-lg ml-[56px]">
        <Button variant="ghost" onClick={onRetry}>
          Check again
        </Button>
      </div>
    </div>
  )
}
