import logo from '../assets/wrenn-logo.png'

type Props = {
  onLogo?: () => void
  onSettings?: () => void
}

// Top bar: logo on the left (goes home), settings gear on the right.
// Either one is hidden when it's not useful, e.g. during first setup.
export function Header({ onLogo, onSettings }: Props) {
  const img = (
    <img
      src={logo}
      alt="Wrenn"
      className="h-10 w-auto dark:[filter:drop-shadow(0_0_1px_#f3ebdd)_drop-shadow(0_0_1px_#f3ebdd)]"
    />
  )
  return (
    <header className="flex items-center justify-between px-lg py-md">
      {onLogo ? (
        <button type="button" onClick={onLogo} aria-label="Wrenn, go to home" className="cursor-pointer rounded-sm">
          {img}
        </button>
      ) : (
        img
      )}
      {onSettings && (
        <button
          type="button"
          onClick={onSettings}
          aria-label="Settings"
          className="press flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-navy/15 text-navy hover:border-navy/40"
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
        </button>
      )}
    </header>
  )
}
